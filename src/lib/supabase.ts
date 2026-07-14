import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || 'placeholder-key';

if (!import.meta.env.NEXT_PUBLIC_SUPABASE_URL || !import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Warning: Supabase environment variables are missing. Using placeholder values.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

