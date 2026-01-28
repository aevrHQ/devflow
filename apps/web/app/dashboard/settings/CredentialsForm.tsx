"use client";

import { useState } from "react";
import { Loader2, Lock, Check, Save } from "lucide-react";
import Loader from "@/components/ui/aevr/loader";

interface CredentialsFormProps {
  initialHasGithubToken?: boolean;
}

export default function CredentialsForm({
  initialHasGithubToken = false,
}: CredentialsFormProps) {
  const [githubToken, setGithubToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasToken, setHasToken] = useState(initialHasGithubToken);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credentials: {
            github: githubToken,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update credentials");
      }

      setMessage("Credentials updated successfully");
      setTimeout(() => setMessage(""), 3000);

      setGithubToken(""); // Clear input for security
      setHasToken(true);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Something went wrong";
      setMessage("Error: " + msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-5 w-5 text-gray-400" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">Credentials</h3>
          <p className="text-sm text-gray-500">
            Manage sensitive credentials for your agents. These are encrypted
            before storage.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GitHub Personal Access Token
          </label>
          <div className="space-y-2">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              placeholder={
                hasToken
                  ? "•••••••••••••••••••••••••••••••• (Configured)"
                  : "ghp_..."
              }
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Required for the agent to access your repositories and create pull
            requests in Managed SaaS mode.
            {hasToken && (
              <span className="ml-2 inline-flex items-center text-green-600 font-medium">
                <Check className="mr-1 h-3 w-3" /> Configured
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isLoading || !githubToken}
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <Loader loading={isLoading} className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Credentials
          </button>
          {message && (
            <span
              className={`text-sm ${
                message.includes("Error") ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
