import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically persist session in localStorage
    persistSession: true,
    // Automatically refresh token before expiry
    autoRefreshToken: true,
    // Detect session from URL (needed for magic link + SSO redirects)
    detectSessionInUrl: true,
    // Use localStorage for session storage
    storage: window.localStorage,
  },
});

export default supabase;