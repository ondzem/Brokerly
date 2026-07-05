import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Warning: Supabase environment variables are missing.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
