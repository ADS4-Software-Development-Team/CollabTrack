import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

// Check for missing Supabase credentials
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase URL or Supabase Anon Key in .env file.");
}

// Create Supabase client connection
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { supabase };