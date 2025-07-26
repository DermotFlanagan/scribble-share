"use client";

import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { getUserSession } from "../services/user.service";
import { supabase } from "../lib/initSupabase";
import DashboardBody from "../components/dashboard/DashboardBody";
import Spinner from "../ui/Spinner";
import { Session } from "@supabase/supabase-js";

export default function Page() {
  const [session, setSession] = useState<Session | null>();
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

  function generateUserColor() {
    const colors = [
      "#f63b3b",
      "#f6ab3b",
      "#f3f63b",
      "#76f63b",
      "#3bf689",
      "#3bf6e6",
      "#3b86f6",
      "#3b57f6",
      "#6d3bf6",
      "#b23bf6",
      "#f63bed",
      "#f63b64",
    ];
    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
  }

  function createUsernameFromEmail(email: string) {
    try {
      const username = email?.split("@")[0];
      return username;
    } catch (error) {
      throw new Error("Error occurred while creating username: " + error);
    }
  }

  useEffect(() => {
    getUserSession()
      .then((session) => {
        if (session) {
          const isNewUser =
            !session?.user?.user_metadata?.userName &&
            !session?.user?.user_metadata?.userColor;

          if (isNewUser) {
            const userName = createUsernameFromEmail(
              session?.user?.email as string
            );
            const userColor = generateUserColor();

            supabase.auth
              .updateUser({
                data: { userName, userColor },
              })
              .then(() => {
                return getUserSession();
              })
              .then((updatedSession) => {
                setSession(updatedSession);
                setIsAuthenticating(false);
              });
          } else {
            setSession(session);
            setIsAuthenticating(false);
          }
        } else {
          window.location.href = "/login";
        }
      })
      .catch((error) => {
        console.error("Error occurred while fetching user session:", error);
        setIsAuthenticating(false);
      });
  }, []);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <main>
      <Navbar session={session ?? null} />
      <DashboardBody session={session ?? null} />
    </main>
  );
}
