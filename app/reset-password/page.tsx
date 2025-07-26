"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/initSupabase";
import Spinner from "../ui/Spinner";
import { cherryBombOne } from "../ui/fonts";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isCheckingTokens, setIsCheckingTokens] = useState<boolean>(true);

  useEffect(() => {
    let access_token = searchParams.get("access_token");
    let refresh_token = searchParams.get("refresh_token");

    if (!access_token && typeof window !== "undefined") {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      access_token = hashParams.get("access_token");
      refresh_token = hashParams.get("refresh_token");
    }

    setAccessToken(access_token);
    setRefreshToken(refresh_token);
    setIsCheckingTokens(false);

    if (!access_token) {
      setTimeout(() => router.push("/login"), 2000);
    }
  }, [searchParams, router]);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!password) {
      toast.error("Please enter a new password.");
      return;
    }

    if (!accessToken) {
      toast.error("Invalid reset token.");
      return;
    }

    setIsLoading(true);

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || "",
    });

    if (sessionError) {
      console.error(sessionError);
      toast.error(sessionError.message || "Failed to set session.", {
        position: "top-center",
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error(error);
      toast.error(error.message || "Password reset failed.", {
        position: "top-center",
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    toast.success("Password reset successful. Proceed to log in.");
    router.push("/login");
    setIsLoading(false);
  }

  if (isCheckingTokens) {
    return (
      <div className="text-center mt-20">
        <Spinner />
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl mb-4">Invalid Reset Link</h1>
        <p className="mb-4">
          The password reset link is invalid or has expired.
        </p>
        <p className="text-sm text-gray-600">Redirecting...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleResetPassword}
      className="flex flex-col items-center h-screen max-w-lg mx-auto justify-center"
    >
      <label
        className={`${cherryBombOne.className} text-2xl md:text-4xl mb-5 text-center`}
      >
        Reset your <br /> <span className="text-blue-600">ScribbleShare</span>{" "}
        password
      </label>
      <input
        type="password"
        placeholder="Enter a new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-lg border border-blue-500 outline-none max-w-sm"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg max-w-sm w-full"
      >
        {isLoading ? "Resetting password..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="text-center mt-20">
          <Spinner />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
