import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}`;
const supabaseAnonKey = `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
