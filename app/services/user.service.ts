import { supabase } from "../lib/initSupabase";

export async function getUserSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function fetchUserById(userId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No valid session found");
  }

  const response = await fetch(`/api/user?userId=${userId}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch user");
  }

  const result = await response.json();
  return result.data;
}
