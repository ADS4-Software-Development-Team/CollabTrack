import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const { SUPABASE_URL, SUPABASE_KEY } = process.env;

//Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Test connection and show first row of each table
 */
export const supabaseConnection = async () => {
  const tables = [
    "notification_logs",
    "project_members",
    "projects",
    "task_comments",
    "task_priorities",
    "task_statuses",
    "tasks",
    "user_notification_preferences",
    "users"
  ];

  console.log("🔗 Testing Supabase connection...\n");

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.error(` Table "${table}" connection failed:`, error.message);
      } else {
        console.log(`Table "${table}" connected successfully.`);
        console.log(`Sample row from "${table}":`, data[0] || "No data yet.");
      }
      console.log("-----------------------------------");
    } catch (err) {
      console.error(`Error accessing table "${table}":`, err.message);
    }
  }
};

export default supabaseConnection;
