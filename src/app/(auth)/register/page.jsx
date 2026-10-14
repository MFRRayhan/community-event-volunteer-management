"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FiHeart, FiUsers, FiCalendar, FiAlertCircle } from "react-icons/fi";
import { registerUserAction } from "@/actions/auth.actions";
import { validateRegister } from "@/validators/auth.validator";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "volunteer", // Default role
  });

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

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
    if (fieldErrors.role) {
      setFieldErrors((prev) => ({ ...prev, role: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    // 1. Client-side validation check
    const validation = validateRegister(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      // 2. Call Server Action to register user
      const result = await registerUserAction(formData);

      if (!result?.success) {
        if (result?.errors) {
          setFieldErrors(result.errors);
        }
        setGeneralError(
          result?.message ||
            "Registration failed. Please check your information.",
        );
        setIsLoading(false);
        return;
      }

      // 3. On success, redirect to login page with success notification query
      router.push("/login?registered=true");
    } catch (err) {
      console.error("Register submission error:", err);
      setGeneralError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xl font-bold text-emerald-600 dark:text-emerald-400"
            >
              <FiHeart
                className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              <span>Community Connect</span>
            </Link>
            <ThemeToggle />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Create an Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Join as a Community Organizer or an eager Volunteer
          </p>
        </div>

        {/* General Error Alert */}
        {generalError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
            <FiAlertCircle
              className="w-4 h-4 shrink-0 text-red-600"
              aria-hidden="true"
            />
            <span>{generalError}</span>
          </div>
        )}

        {/* Google Sign In / Register */}

        <button
          type="button"
          disabled={isLoading || isGoogleLoading}
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FcGoogle className="w-5 h-5" aria-hidden="true" />

          <span>
            {isGoogleLoading
              ? "Connecting to Google..."
              : "Continue with Google (Volunteer)"}
          </span>
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 font-medium">
              Or register with email
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selector Cards */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Volunteer Option */}
              <button
                type="button"
                onClick={() => handleRoleSelect("volunteer")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  formData.role === "volunteer"
                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <FiUsers
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  <span
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      formData.role === "volunteer"
                        ? "border-emerald-600 bg-emerald-600"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {formData.role === "volunteer" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                    )}
                  </span>
                </div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  Volunteer
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Explore & join events
                </div>
              </button>

              {/* Organizer Option */}
              <button
                type="button"
                onClick={() => handleRoleSelect("organizer")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  formData.role === "organizer"
                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <FiCalendar
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  <span
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      formData.role === "organizer"
                        ? "border-emerald-600 bg-emerald-600"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {formData.role === "organizer" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                    )}
                  </span>
                </div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  Organizer
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Create & manage events
                </div>
              </button>
            </div>
            {fieldErrors.role && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrors.role}
              </p>
            )}
          </div>

          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Alex Johnson"
              disabled={isLoading || isGoogleLoading}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none dark:bg-slate-800 dark:text-white ${
                fieldErrors.name
                  ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                  : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrors.name}
              </p>
            )}
          </div>

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
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrors.email}
              </p>
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
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Must be at least 6 characters with a letter and a number.
            </p>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrors.password}
              </p>
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
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
