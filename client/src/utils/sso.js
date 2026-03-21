import { supabase } from '../lib/supabase';

const SCIENTIA_URL = import.meta.env.VITE_SCIENTIA_URL || 'https://scientia-lms.vercel.app';
const VIDYASTRA_URL = import.meta.env.VITE_VIDYASTRA_URL || 'https://vidyastra-prep.vercel.app';
const APP_NAME = import.meta.env.VITE_APP_NAME || 'scientia';

// ─────────────────────────────────────────────────────────────────────────────
//  OUTBOUND — send user to other app with session
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scientia → Vidyastra (always allowed)
 * Call this when user clicks any Vidyastra link inside Scientia
 */
export async function goToVidyastra(path = '/') {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Not logged in — send to Vidyastra as guest
    window.location.href = `${VIDYASTRA_URL}${path}`;
    return;
  }

  // Append both tokens to URL so Vidyastra can restore the session
  const params = new URLSearchParams({
    sso_access_token: session.access_token,
    sso_refresh_token: session.refresh_token,
    sso_source: 'scientia',
  });

  window.location.href = `${VIDYASTRA_URL}${path}?${params.toString()}`;
}

/**
 * Vidyastra → Scientia (only for student/teacher roles)
 * Call this when user clicks "Continue with Scientia" inside Vidyastra
 */
export async function goToScientia(path = '/') {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Not logged in — send to Scientia login page
    window.location.href = `${SCIENTIA_URL}/login?redirect=${encodeURIComponent(path)}`;
    return;
  }

  // Check role before allowing cross-app login
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, app_source')
    .eq('id', session.user.id)
    .single();

  const allowedRoles = ['student', 'teacher'];

  if (!profile || !allowedRoles.includes(profile.role)) {
    // Admin or unknown role — just redirect without SSO
    window.location.href = `${SCIENTIA_URL}/login`;
    return;
  }

  // Allowed — pass session tokens
  const params = new URLSearchParams({
    sso_access_token: session.access_token,
    sso_refresh_token: session.refresh_token,
    sso_source: 'vidyastra',
  });

  window.location.href = `${SCIENTIA_URL}${path}?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  INBOUND — receive session from other app
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Call this once on app startup (in main App.jsx or AuthContext)
 * Reads SSO tokens from URL, restores session, then cleans up the URL
 */
export async function handleInboundSSO() {
  const params = new URLSearchParams(window.location.search);

  const accessToken = params.get('sso_access_token');
  const refreshToken = params.get('sso_refresh_token');
  const ssoSource = params.get('sso_source');

  // No SSO tokens in URL — nothing to do
  if (!accessToken || !refreshToken) return null;

  try {
    // Restore the session silently
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error('[SSO] Failed to restore session:', error.message);
      return null;
    }

    // Clean up tokens from URL (don't leave them in browser history)
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('sso_access_token');
    cleanUrl.searchParams.delete('sso_refresh_token');
    cleanUrl.searchParams.delete('sso_source');
    window.history.replaceState({}, '', cleanUrl.toString());

    console.log(`[SSO] Session restored from ${ssoSource || 'unknown'}`);
    return data.session;

  } catch (err) {
    console.error('[SSO] Unexpected error:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if current user came from Scientia (has premium access on Vidyastra)
 */
export async function isScientiaUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('app_source, scientia_linked')
    .eq('id', session.user.id)
    .single();

  return profile?.app_source === 'scientia' || profile?.scientia_linked === true;
}

/**
 * Get current user profile with role info
 */
export async function getCurrentProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return profile;
}