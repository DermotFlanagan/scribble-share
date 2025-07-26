"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/initSupabase";
import { useRouter } from "next/navigation";
import { cherryBombOne, coiny } from "../ui/fonts";
import toast from "react-hot-toast";
import { getUserSession } from "../services/user.service";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  useEffect(
    function () {
      getUserSession().then((session) => {
        if (session?.user) {
          router.push("/dashboard");
        }
      });
    },
    [router]
  );

  const authenticateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || "Login attempt unsuccessful.", {
        position: "top-center",
        duration: 1000,
      });
      setIsLoading(false);
      return;
    }

    if (data?.user) {
      router.push("/dashboard");
    }

    setIsLoading(false);
  };

  async function handleForgotPassword() {
    if (!email) {
      toast.error("Please enter your email to reset your password.", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message || "Password reset unsuccessful.", {
        position: "top-center",
        duration: 1000,
      });
      setIsLoading(false);
      return;
    }

    toast.success("Email sent. Check your inbox.", {
      position: "top-center",
      duration: 3000,
    });

    setIsLoading(false);
  }

  return (
    <form
      onSubmit={authenticateUser}
      className="flex flex-col items-center h-screen max-w-lg mx-auto justify-center"
    >
      <label
        className={`${cherryBombOne.className} text-2xl md:text-4xl mb-5 text-center `}
      >
        Log into <span className="text-blue-600">ScribbleShare</span>
      </label>

      <input
        type="email"
        placeholder="Enter email"
        className=" w-full px-3 py-2 rounded-lg border-gray-400 outline-none bg-white max-w-sm mx-auto border-dashed border-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <input
        type="password"
        placeholder="Enter password"
        className="border-2 border-dashed border-gray-400 outline-none w-full px-3 py-2 rounded-lg bg-white mt-3 max-w-sm mx-auto"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className={`px-3 py-2 bg-blue-600 hover:bg-blue-500 border-b-6 border-blue-900 border-r-6 text-white rounded-xl w-full max-w-sm mx-auto mt-4 text-lg ${coiny.className} transition hover:scale-110 md:shadow-custom`}
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Log in"}
      </button>
      <button
        className="mt-4 underline cursor-pointer"
        onClick={handleForgotPassword}
        disabled={isLoading}
        type="button"
      >
        Forgot password?
      </button>
    </form>
  );
}
