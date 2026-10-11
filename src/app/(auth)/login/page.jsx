"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FiHeart, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { validateLogin } from "@/validators/auth.validator";
import ThemeToggle from "@/components/theme/ThemeToggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const justRegistered = searchParams.get("registered") === "true";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    // 1. Validate fields with pure validator
    const validation = validateLogin(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      // 2. Authenticate via NextAuth credentials provider
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (!result?.ok) {
        setGeneralError(result?.error || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      // 3. On successful login, navigate to destination
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Login submission error:", err);
      setGeneralError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    signIn("google", { callbackUrl });
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            <FiHeart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Community Connect</span>
          </Link>
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome Back</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Sign in to access your events and volunteer dashboard
        </p>
      </div>

      {/* Just Registered Alert */}
      {justRegistered && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <FiCheckCircle className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>Account created successfully! Please sign in with your credentials.</span>
        </div>
      )}

      {/* General Error Alert */}
      {generalError && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Google Sign In Button */}
      <button
        type="button"
        disabled={isLoading || isGoogleLoading}
        onClick={handleGoogleSignIn}
        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
      >
        <FcGoogle className="w-5 h-5" aria-hidden="true" />
        <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 font-medium">
            Or sign in with email
          </span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            disabled={isLoading || isGoogleLoading}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none dark:bg-slate-800 dark:text-white ${
              fieldErrors.email
                ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={isLoading || isGoogleLoading}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none dark:bg-slate-800 dark:text-white ${
              fieldErrors.password
                ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
            }`}
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Footer Link */}
      <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading sign-in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
