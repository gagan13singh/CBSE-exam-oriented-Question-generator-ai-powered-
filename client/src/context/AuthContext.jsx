import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { handleInboundSSO, isScientiaUser } from '../utils/sso';

// ─────────────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────────────

const FIRST_SESSION_LIMIT = 20;  // generous first impression
const DAILY_LIMIT = 10;          // after first session

const GUEST_TOKEN_KEY = 'vidyastra_guest_token';
const GUEST_FIRST_SESSION_KEY = 'vidyastra_guest_first_session_done';

// ─────────────────────────────────────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isScentiaPremium, setIsScentiaPremium] = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [guestToken, setGuestToken] = useState(null);

  // ── Fetch user profile from Supabase ──────────────────────────────────────
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
      return data;
    }
    return null;
  }, []);

  // ── Check if Scientia premium ─────────────────────────────────────────────
  const checkScentiaPremium = useCallback(async () => {
    const premium = await isScientiaUser();
    setIsScentiaPremium(premium);
    return premium;
  }, []);

  // ── Get or create guest token ─────────────────────────────────────────────
  const getOrCreateGuestToken = useCallback(() => {
    let token = localStorage.getItem(GUEST_TOKEN_KEY);
    if (!token) {
      // Generate a random guest token
      token = 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(GUEST_TOKEN_KEY, token);
    }
    return token;
  }, []);

  // ── Fetch guest usage from Supabase ───────────────────────────────────────
  const fetchGuestUsage = useCallback(async (token) => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('guest_usage')
      .select('questions_used, first_session')
      .eq('guest_token', token)
      .eq('date', today)
      .single();

    if (error || !data) {
      // No record for today — fresh start
      return { questionsUsed: 0, firstSession: true };
    }

    return {
      questionsUsed: data.questions_used,
      firstSession: data.first_session,
    };
  }, []);

  // ── Increment guest question count ────────────────────────────────────────
  const incrementGuestUsage = useCallback(async () => {
    if (!isGuest || !guestToken) return;

    const today = new Date().toISOString().split('T')[0];
    const newCount = questionsUsed + 1;

    // Upsert guest usage record
    await supabase
      .from('guest_usage')
      .upsert({
        guest_token: guestToken,
        date: today,
        questions_used: newCount,
        first_session: isFirstSession,
      }, {
        onConflict: 'guest_token,date',
      });

    setQuestionsUsed(newCount);

    // Check limit
    const limit = isFirstSession ? FIRST_SESSION_LIMIT : DAILY_LIMIT;
    if (newCount >= limit) {
      setLimitReached(true);
    }
  }, [isGuest, guestToken, questionsUsed, isFirstSession]);

  // ── Initialize guest mode ─────────────────────────────────────────────────
  const initGuestMode = useCallback(async () => {
    const token = getOrCreateGuestToken();
    setGuestToken(token);
    setIsGuest(true);

    const { questionsUsed: used, firstSession } = await fetchGuestUsage(token);

    // First session = never hit the daily limit before
    const hasCompletedFirstSession = localStorage.getItem(GUEST_FIRST_SESSION_KEY) === 'true';
    const isFirst = !hasCompletedFirstSession;

    setIsFirstSession(isFirst);
    setQuestionsUsed(used);

    const limit = isFirst ? FIRST_SESSION_LIMIT : DAILY_LIMIT;
    if (used >= limit) {
      setLimitReached(true);
    }
  }, [getOrCreateGuestToken, fetchGuestUsage]);

  // ── On mount — check for SSO tokens or existing session ──────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // 1. Check for inbound SSO tokens in URL first
      const ssoSession = await handleInboundSSO();

      // 2. Get current session (either from SSO or existing)
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        await checkScentiaPremium();
        setIsGuest(false);
      } else {
        // No session — start as guest
        await initGuestMode();
      }

      setLoading(false);
    };

    init();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setIsGuest(false);
          setLimitReached(false);
          await fetchProfile(session.user.id);
          await checkScentiaPremium();
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsScentiaPremium(false);
          await initGuestMode();
        }

        if (event === 'TOKEN_REFRESHED' && session) {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  //  Auth Actions
  // ─────────────────────────────────────────────────────────────────────────

  // Email + Password login
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Email + Password register
  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          app_source: 'vidyastra',
          role: 'student',
        },
      },
    });
    if (error) throw error;
    return data;
  };

  // Magic link login
  const signInWithMagicLink = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${import.meta.env.VITE_VIDYASTRA_URL}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Mark first session as complete (call when user hits FIRST_SESSION_LIMIT)
  const markFirstSessionComplete = useCallback(() => {
    localStorage.setItem(GUEST_FIRST_SESSION_KEY, 'true');
    setIsFirstSession(false);
  }, []);

  // Get current question limit
  const currentLimit = isFirstSession ? FIRST_SESSION_LIMIT : DAILY_LIMIT;

  // ─────────────────────────────────────────────────────────────────────────
  //  Context Value
  // ─────────────────────────────────────────────────────────────────────────

  const value = {
    // State
    user,
    profile,
    loading,
    isGuest,
    isScentiaPremium,
    questionsUsed,
    currentLimit,
    isFirstSession,
    limitReached,
    guestToken,

    // Actions
    signIn,
    signUp,
    signOut,
    signInWithMagicLink,
    incrementGuestUsage,
    markFirstSessionComplete,
    fetchProfile,

    // Computed
    isLoggedIn: !!user && !isGuest,
    questionsRemaining: Math.max(0, currentLimit - questionsUsed),
    usagePercentage: Math.min(100, Math.round((questionsUsed / currentLimit) * 100)),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;