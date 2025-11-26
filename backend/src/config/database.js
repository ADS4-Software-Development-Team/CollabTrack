import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const { SUPABASE_URL, SUPABASE_KEY } = process.env;

//Create Supabase client connection
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


