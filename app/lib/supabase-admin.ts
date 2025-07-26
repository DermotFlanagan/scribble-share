import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service_role_key = process.env.SUPABASE_SERVICE_ROLE_SECRET!;

if (!service_role_key) {
  throw new Error("SUPABASE_SERVICE_ROLE_SECRET is required");
}

export const supabaseAdmin = createClient(supabaseUrl, service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const adminAuthClient = supabaseAdmin.auth.admin;
