"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import {
  FiHeart,
  FiAlertCircle,
  FiCheckCircle,
  FiUsers,
  FiCalendar,
} from "react-icons/fi";
import { validateLogin } from "@/validators/auth.validator";
import ThemeToggle from "@/components/theme/ThemeToggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();

  const callbackUrl =
    searchParams.get("callbackUrl") ||
    (session?.user?.role === "organizer"
      ? "/dashboard/organizer"
      : "/dashboard/volunteer");
  const justRegistered = searchParams.get("registered") === "true";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [demoRole, setDemoRole] = useState("");

  // Clear errors when the user changes an input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (generalError) {
      setGeneralError("");
    }
  };

  // Regular email and password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    const validation = validateLogin(formData);

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (!result?.ok || result.error) {
        setGeneralError(
          result?.error === "CredentialsSignin"
            ? "Invalid email or password."
            : result?.error || "Invalid email or password.",
        );

        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Login submission error:", error);

      setGeneralError("An unexpected error occurred. Please try again.");

      setIsLoading(false);
    }
  };

  // Quick login for demo accounts
  const handleDemoLogin = async (role) => {
    if (isLoading || isGoogleLoading || demoRole) {
      return;
    }

    setGeneralError("");
    setFieldErrors({});
    setDemoRole(role);

    const demoCredentials = {
      volunteer: {
        email: "volunteer@community.org",
        password: "Volunteer@123",
      },
      organizer: {
        email: "organizer@community.org",
        password: "Organizer@123",
      },
    };

    try {
      const result = await signIn("credentials", {
        ...demoCredentials[role],
        redirect: false,
      });

      if (!result?.ok || result.error) {
        setGeneralError(
          `Demo ${role} login failed. Please make sure the demo account exists and its password is correct.`,
        );

        setDemoRole("");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Demo login error:", error);

      setGeneralError(
        "Unable to log in with the demo account. Please try again.",
      );

      setDemoRole("");
    }
  };

  // Google OAuth login
  const handleGoogleSignIn = async () => {
    if (isLoading || isGoogleLoading || demoRole) {
      return;
    }

    setGeneralError("");
    setIsGoogleLoading(true);

    try {
      await signIn("google", {
        callbackUrl,
      });
    } catch (error) {
      console.error("Google sign-in error:", error);

      setGeneralError("Unable to connect to Google. Please try again.");

      setIsGoogleLoading(false);
    }
  };

  const isBusy = isLoading || isGoogleLoading || Boolean(demoRole);

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xl font-bold text-emerald-600 dark:text-emerald-400"
          >
            <FiHeart className="w-5 h-5" aria-hidden="true" />
            <span>Community Connect</span>
          </Link>

          <ThemeToggle />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Welcome Back
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Sign in to access your events and volunteer dashboard
        </p>
      </div>

      {/* Registration Success Alert */}
      {justRegistered && (
        <div
          role="status"
          className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-2"
        >
          <FiCheckCircle
            className="w-4 h-4 shrink-0 text-emerald-600"
            aria-hidden="true"
          />

          <span>
            Account created successfully! Please sign in with your credentials.
          </span>
        </div>
      )}

      {/* General Error Alert */}
      {generalError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-center gap-2"
        >
          <FiAlertCircle
            className="w-4 h-4 shrink-0 text-red-600"
            aria-hidden="true"
          />

          <span>{generalError}</span>
        </div>
      )}

      {/* Demo Login Section */}
      <div className="mb-6 space-y-3">
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Quick Demo Access
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Explore the platform without creating an account
          </p>
        </div>

        {/* Volunteer Demo Login */}
        <button
          type="button"
          onClick={() => handleDemoLogin("volunteer")}
          disabled={isBusy}
          className="w-full py-3 px-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          <FiUsers className="w-5 h-5" aria-hidden="true" />

          <span>
            {demoRole === "volunteer"
              ? "Logging in as Volunteer..."
              : "Login as Volunteer"}
          </span>
        </button>

        {/* Organizer Demo Login */}
        <button
          type="button"
          onClick={() => handleDemoLogin("organizer")}
          disabled={isBusy}
          className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          <FiCalendar className="w-5 h-5" aria-hidden="true" />

          <span>
            {demoRole === "organizer"
              ? "Logging in as Organizer..."
              : "Login as Organizer"}
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 font-medium">
            Or sign in with
          </span>
        </div>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        disabled={isBusy}
        onClick={handleGoogleSignIn}
        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <FcGoogle className="w-5 h-5" aria-hidden="true" />

        <span>
          {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
        </span>
      </button>

      {/* Email Login Form */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 font-medium">
            Or use your credentials
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Email Address
          </label>

          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            disabled={isBusy}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none dark:bg-slate-800 dark:text-white ${
              fieldErrors.email
                ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
            }`}
          />

          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Password
          </label>

          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={isBusy}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none dark:bg-slate-800 dark:text-white ${
              fieldErrors.password
                ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
            }`}
          />

          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isBusy}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />

                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>

              <span>Signing in...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Register here
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <Suspense
        fallback={
          <div className="text-slate-400 text-sm">Loading sign-in...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
