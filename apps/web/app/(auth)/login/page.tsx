"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, CheckCircle2, Lock, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "@/components/ui/aevr/loader";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return_to");

  // Modes:
  // 'magic-link': Email input for Magic Link
  // 'otp-verify': OTP input after link sent
  // 'pin-login': Email + PIN input
  const [mode, setMode] = useState<"magic-link" | "otp-verify" | "pin-login">(
    "magic-link",
  );

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. Request Magic Link (and OTP)
  const handleRequestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/magic-link/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, returnTo }),
      });

      if (!res.ok) throw new Error("Failed to send magic link");

      setMode("otp-verify");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) throw new Error("Invalid code");

      // Success - Redirect
      router.push(returnTo || "/dashboard");
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Login with PIN
  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/pin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });

      if (!res.ok) {
        if (res.status === 401)
          throw new Error("Invalid PIN or account not found");
        throw new Error("Failed to login");
      }

      setIsSuccess(true);
      router.push(returnTo || "/dashboard");
    } catch (err) {
      setError((err as Error).message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-xl overflow-hidden border border-border">
      <div className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "pin-login"
              ? "Enter your PIN to access your account"
              : "Sign in to manage your Devflow bot"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* VIEW 1: Request Magic Link */}
          {mode === "magic-link" && (
            <motion.form
              key="magic-link-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRequestMagicLink}
              className="space-y-4"
            >
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <InputGroup>
                  <InputGroupAddon className="pointer-events-none z-10">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </InputGroup>
              </Field>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <Loader loading className="w-4 h-4" />
                ) : (
                  "Send Magic Link"
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode("pin-login")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Login with PIN instead
                </button>
              </div>
            </motion.form>
          )}

          {/* VIEW 2: OTP / Check Email */}
          {mode === "otp-verify" && (
            <motion.div
              key="otp-verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-foreground">
                  Check your email
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  We sent a code to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="otp">Enter 6-digit Code</FieldLabel>
                  <Input
                    id="otp"
                    type="text" // numeric
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // numbers only
                    className="text-center text-lg tracking-widest font-mono"
                    placeholder="123456"
                  />
                </Field>

                {error && (
                  <p className="text-destructive text-sm text-center">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <Loader loading className="w-4 h-4" />
                  ) : (
                    "Verify Code"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("magic-link");
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground mt-2"
                >
                  Use a different email
                </button>
              </form>
            </motion.div>
          )}

          {/* VIEW 3: PIN Login */}
          {mode === "pin-login" && (
            <motion.form
              key="pin-login-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handlePinLogin}
              className="space-y-4"
            >
              <Field>
                <FieldLabel htmlFor="pin-email">Email Address</FieldLabel>
                <InputGroup>
                  <InputGroupAddon className="pointer-events-none z-10">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="pin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="pin">4-digit PIN</FieldLabel>
                <InputGroup>
                  <InputGroupAddon className="pointer-events-none z-10">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="pin"
                    type="password"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="****"
                  />
                </InputGroup>
              </Field>

              {error && <p className="text-destructive text-sm">{error}</p>}

              {isSuccess ? (
                <Link
                  href={returnTo || "/dashboard"}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Continue to App
                </Link>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <Loader loading className="w-4 h-4" />
                  ) : (
                    "Login with PIN"
                  )}
                </button>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode("magic-link")}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Magic Link
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
      <div className="bg-muted/50 px-8 py-4 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">
          Secure authentication powered by Devflow
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 text-foreground p-4">
      <Suspense
        fallback={
          <div className="p-8 bg-card rounded-2xl shadow-xl">
            <Loader loading className="w-8 h-8 mx-auto" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
