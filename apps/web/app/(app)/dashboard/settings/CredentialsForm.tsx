"use client";

import { useState } from "react";
import { Lock, Check, Save } from "lucide-react";
import Loader from "@/components/ui/aevr/loader";
import { Button } from "@/components/ui/aevr/button";

interface CredentialsFormProps {
  initialHasGithubToken?: boolean;
}

export default function CredentialsForm({
  initialHasGithubToken = false,
  initialGroqKeysCount = 0,
}: CredentialsFormProps & { initialGroqKeysCount?: number }) {
  const [githubToken, setGithubToken] = useState("");
  const [groqKeyInput, setGroqKeyInput] = useState("");
  const [groqKeysCount, setGroqKeysCount] = useState(initialGroqKeysCount);
  // We only send NEW keys or replacement list.
  // For security, we don't fetch back the actual keys, just the count or masked versions if we had them.
  // Actually, for rotation, we might want to allow appending.
  // Simplest MVP: User manages a list. We can't show them back.
  // So we just allow adding new ones. If they want to rotate, they can maybe "Reset All" or we just append?
  // Let's go with: "Update/Replace" for simplicity or just "Set Keys".
  // Actually the requirement is "support multiple keys".
  // Let's allow pasting comma separated or multiple fields?
  // Let's stick to the plan: List masked (if we had them returned, but we don't yet).
  // For now: Input for NEW keys. We'll store them.
  // To allow managing, we'd need to fetch them.
  // Let's assume the user just provides a list of keys to *replace* the current set or *append*.
  // Let's implemented a UI where they can add multiple keys to a list *client side* and then save.
  const [newGroqKeys, setNewGroqKeys] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasToken, setHasToken] = useState(initialHasGithubToken);
  const [message, setMessage] = useState("");

  const addGroqKey = () => {
    if (groqKeyInput.trim()) {
      setNewGroqKeys([...newGroqKeys, groqKeyInput.trim()]);
      setGroqKeyInput("");
    }
  };

  const removeNewKey = (index: number) => {
    setNewGroqKeys(newGroqKeys.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const payload: {
        credentials: { github?: string; groqApiKeys?: string[] };
      } = { credentials: {} };
      if (githubToken) payload.credentials.github = githubToken;
      if (newGroqKeys.length > 0) payload.credentials.groqApiKeys = newGroqKeys;

      // If nothing to update
      if (!githubToken && newGroqKeys.length === 0) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update credentials");
      }

      setMessage("Credentials updated successfully");
      setTimeout(() => setMessage(""), 3000);

      setGithubToken(""); // Clear input
      setNewGroqKeys([]); // Clear new keys
      if (githubToken) setHasToken(true);
      if (newGroqKeys.length > 0)
        setGroqKeysCount((prev) => prev + newGroqKeys.length);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Something went wrong";
      setMessage("Error: " + msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
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

      <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
        {/* GitHub Token Section */}
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
            Required for the agent to access your repositories.
            {hasToken && (
              <span className="ml-2 inline-flex items-center text-green-600 font-medium">
                <Check className="mr-1 h-3 w-3" /> Configured
              </span>
            )}
          </p>
        </div>

        {/* Groq API Keys Section */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Groq API Keys (BYOK)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Add multiple keys to enable rotation and handle rate limits.
            {groqKeysCount > 0 && (
              <span className="ml-2 inline-flex items-center text-green-600 font-medium">
                <Check className="mr-1 h-3 w-3" /> {groqKeysCount} keys
                configured
              </span>
            )}
          </p>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="password"
                value={groqKeyInput}
                onChange={(e) => setGroqKeyInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                placeholder="gsk_..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addGroqKey();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addGroqKey}
                variant="secondary"
                className="shrink-0"
              >
                Add
              </Button>
            </div>

            {/* List of keys to be added */}
            {newGroqKeys.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To be saved:
                </p>
                {newGroqKeys.map((key, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm bg-white border border-gray-200 p-2 rounded"
                  >
                    <span className="font-mono text-gray-600">
                      {key.substring(0, 8)}...{key.substring(key.length - 4)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewKey(idx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <span className="sr-only">Remove</span>×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <Button
            type="submit"
            disabled={isLoading || (!githubToken && newGroqKeys.length === 0)}
            variant="default"
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <Loader loading={isLoading} className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Credentials
          </Button>
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
