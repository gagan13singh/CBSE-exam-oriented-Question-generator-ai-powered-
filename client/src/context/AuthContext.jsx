import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// ── Supabase client ────────────────────────────────────────────────────────
const _url = import.meta.env.VITE_SUPABASE_URL;
const _key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseAvailable = Boolean(_url && _key);

export const supabase = supabaseAvailable
  ? createClient(_url, _key, {
      auth: {
        persistSession:     true,
        autoRefreshToken:   true,
        detectSessionInUrl: true,  // parses #access_token= from URL hash automatically
        flowType:           'implicit',
        storage:            window.localStorage,
      },
    })
  : null;

if (!supabaseAvailable) {
  console.warn('[Auth] Supabase env vars missing — guest mode only.');
}

// ── Constants ──────────────────────────────────────────────────────────────
const FIRST_SESSION_LIMIT     = 20;
const DAILY_LIMIT             = 10;
const GUEST_TOKEN_KEY         = 'vidyastra_guest_token';
const GUEST_FIRST_SESSION_KEY = 'vidyastra_guest_first_session_done';
const GUEST_USAGE_KEY         = 'vidyastra_guest_usage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,             setUser]             = useState(null);
  const [profile,          setProfile]          = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [isGuest,          setIsGuest]          = useState(false);
  const [isScentiaPremium, setIsScentiaPremium] = useState(false);
  const [questionsUsed,    setQuestionsUsed]    = useState(0);
  const [isFirstSession,   setIsFirstSession]   = useState(false);
  const [limitReached,     setLimitReached]     = useState(false);
  const [guestToken,       setGuestToken]       = useState(null);

  // ── Helpers ────────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async (userId) => {
    if (!supabaseAvailable) return null;
    try {
      const { data, error } = await supabase
        .from('profiles').select('*').eq('id', userId).single();
      if (!error && data) { setProfile(data); return data; }
    } catch (_) {}
    return null;
  }, []);

  const checkScentiaPremium = useCallback(async (userId) => {
    if (!supabaseAvailable || !userId) return false;
    try {
      const { data } = await supabase
        .from('profiles').select('app_source, scientia_linked').eq('id', userId).single();
      const premium = data?.app_source === 'scientia' || data?.scientia_linked === true;
      setIsScentiaPremium(premium);
      return premium;
    } catch (_) { return false; }
  }, []);

  const readGuestUsage = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const s = JSON.parse(localStorage.getItem(GUEST_USAGE_KEY) || '{}');
      if (s.date === today) return { count: s.count || 0 };
    } catch (_) {}
    return { count: 0 };
  }, []);

  const writeGuestUsage = useCallback((count) => {
    localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify({
      date: new Date().toISOString().split('T')[0], count,
    }));
  }, []);

  const initGuestMode = useCallback(() => {
    let token = localStorage.getItem(GUEST_TOKEN_KEY);
    if (!token) {
      token = 'guest_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(GUEST_TOKEN_KEY, token);
    }
    const hasFinishedFirst = localStorage.getItem(GUEST_FIRST_SESSION_KEY) === 'true';
    const isFirst = !hasFinishedFirst;
    const { count } = readGuestUsage();
    const limit = isFirst ? FIRST_SESSION_LIMIT : DAILY_LIMIT;
    setGuestToken(token);
    setIsGuest(true);
    setUser(null);
    setProfile(null);
    setIsScentiaPremium(false);
    setIsFirstSession(isFirst);
    setQuestionsUsed(count);
    setLimitReached(count >= limit);
  }, [readGuestUsage]);

  const handleLoggedIn = useCallback(async (sessionUser) => {
    setUser(sessionUser);
    setIsGuest(false);
    setLimitReached(false);
    await fetchProfile(sessionUser.id);
    await checkScentiaPremium(sessionUser.id);
    setLoading(false);
    // Clean auth junk from URL bar
    if (
      window.location.hash.includes('access_token') ||
      window.location.search.includes('code=') ||
      window.location.pathname === '/auth/callback'
    ) {
      window.history.replaceState({}, '', '/');
    }
  }, [fetchProfile, checkScentiaPremium]);

  // ── Main auth effect ───────────────────────────────────────────────────
  useEffect(() => {
    if (!supabaseAvailable) {
      initGuestMode();
      setLoading(false);
      return;
    }

    let settled = false;

    // STEP 1: listener FIRST — catches SIGNED_IN from email links
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth]', event);
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          settled = true;
          await handleLoggedIn(session.user);
        }
        if (event === 'SIGNED_OUT') {
          settled = true;
          setUser(null);
          setProfile(null);
          setIsScentiaPremium(false);
          initGuestMode();
          setLoading(false);
        }
      }
    );

    // STEP 2: init — SSO tokens + existing session
    const init = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sso_at = params.get('sso_access_token');
        const sso_rt = params.get('sso_refresh_token');

        // A: Scientia SSO inbound
        if (sso_at && sso_rt) {
          await supabase.auth.setSession({ access_token: sso_at, refresh_token: sso_rt });
          const clean = new URL(window.location.href);
          ['sso_access_token', 'sso_refresh_token', 'sso_source']
            .forEach(k => clean.searchParams.delete(k));
          window.history.replaceState({}, '', clean.toString());
          return; // onAuthStateChange fires SIGNED_IN
        }

        // B: getSession handles both persisted session AND #access_token= hash
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          settled = true;
          await handleLoggedIn(session.user);
          return;
        }
      } catch (e) {
        console.warn('[Auth] init error:', e.message);
      }

      // No session
      if (!settled) {
        initGuestMode();
        setLoading(false);
      }
    };

    init();

    // Safety: never blank longer than 6s
    const timer = setTimeout(() => {
      if (!settled) {
        console.warn('[Auth] timeout — guest fallback');
        initGuestMode();
        setLoading(false);
      }
    }, 6000);

    return () => {
      subscription?.unsubscribe();
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth actions ───────────────────────────────────────────────────────
  const signIn = async (email, password) => {
    if (!supabaseAvailable) throw new Error('Supabase not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, name) => {
    if (!supabaseAvailable) throw new Error('Supabase not configured.');
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, app_source: 'vidyastra', role: 'student' } },
    });
    if (error) throw error;
    return data;
  };

  const signInWithMagicLink = async (email) => {
    if (!supabaseAvailable) throw new Error('Supabase not configured.');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${import.meta.env.VITE_VIDYASTRA_URL || window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (supabaseAvailable) try { await supabase.auth.signOut(); } catch (_) {}
    setUser(null);
    setProfile(null);
    initGuestMode();
  };

  const incrementGuestUsage = useCallback(async () => {
    if (!isGuest) return;
    const newCount = questionsUsed + 1;
    writeGuestUsage(newCount);
    setQuestionsUsed(newCount);
    const limit = isFirstSession ? FIRST_SESSION_LIMIT : DAILY_LIMIT;
    if (newCount >= limit) setLimitReached(true);
  }, [isGuest, questionsUsed, isFirstSession, writeGuestUsage]);

  const markFirstSessionComplete = useCallback(() => {
    localStorage.setItem(GUEST_FIRST_SESSION_KEY, 'true');
    setIsFirstSession(false);
  }, []);

  const currentLimit = isFirstSession ? FIRST_SESSION_LIMIT : DAILY_LIMIT;

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isGuest, isScentiaPremium,
      questionsUsed, currentLimit, isFirstSession, limitReached, guestToken,
      supabaseAvailable,
      signIn, signUp, signOut, signInWithMagicLink,
      incrementGuestUsage, markFirstSessionComplete, fetchProfile, initGuestMode,
      isLoggedIn:         !!user && !isGuest,
      questionsRemaining: Math.max(0, currentLimit - questionsUsed),
      usagePercentage:    Math.min(100, Math.round((questionsUsed / currentLimit) * 100)),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;