"use client";

import { useState } from "react";
import { Lock1, Save2 } from "iconsax-react";
import Loader from "@/components/ui/aevr/loader";
import { Button } from "@/components/ui/aevr/button";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";

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

  async function saveCredentials(
    updates: Partial<{ github: string; groqApiKeys: string[] }>,
  ) {
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentials: updates }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update credentials");
      }

      if (updates.github !== undefined) {
        setHasToken(updates.github !== ""); // If empty string, it's cleared
      }
      if (updates.groqApiKeys !== undefined) {
        setGroqKeysCount(updates.groqApiKeys.length);
      }

      setMessage("Credentials updated successfully");
      setTimeout(() => setMessage(""), 3000);

      // If clearing, show specific message
      if (
        updates.github === "" ||
        (updates.groqApiKeys && updates.groqApiKeys.length === 0)
      ) {
        // handled by state updates above
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Something went wrong";
      setMessage("Error: " + msg);
    } finally {
      setIsLoading(false);
    }
  }

  const handleClearGithub = () => {
    if (confirm("Are you sure you want to remove your GitHub token?")) {
      setGithubToken("");
      saveCredentials({ github: "" });
    }
  };

  const handleClearGroq = () => {
    if (confirm("Are you sure you want to remove ALL Groq API keys?")) {
      setGroqKeyInput("");
      setNewGroqKeys([]);
      saveCredentials({ groqApiKeys: [] });
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: {
      github?: string;
      groqApiKeys?: string[];
    } = {};

    if (githubToken) payload.github = githubToken;
    if (newGroqKeys.length > 0) payload.groqApiKeys = newGroqKeys;

    // If nothing to update, return
    if (!githubToken && newGroqKeys.length === 0) {
      return;
    }

    await saveCredentials(payload);

    setGithubToken(""); // Clear input
    setNewGroqKeys([]); // Clear new keys
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-4">
        <Lock1
          size={20}
          color="currentColor"
          variant="TwoTone"
          className="text-gray-400"
        />
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
        <Field>
          <FieldLabel>GitHub Personal Access Token</FieldLabel>
          <Input
            type="password"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            disabled={isLoading}
            placeholder={
              hasToken
                ? "•••••••••••••••••••••••••••••••• (Configured)"
                : "ghp_..."
            }
          />
          <FieldDescription>
            Required for the agent to access your repositories.
            {hasToken && (
              <span className="text-green-600 dark:text-green-400 flex items-center mt-2">
                <span className="mr-1">✓</span> Configured
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="ml-4 h-6 px-2 text-xs"
                  onClick={handleClearGithub}
                >
                  Clear Token
                </Button>
              </span>
            )}
          </FieldDescription>
        </Field>

        {/* Groq API Keys Section */}
        <div className="pt-4 border-t border-gray-100">
          <Field>
            <FieldLabel>Groq API Keys (BYOK)</FieldLabel>
            <FieldDescription className="mb-3">
              Add multiple keys to enable rotation and handle rate limits.
              {groqKeysCount > 0 && (
                <div className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center justify-between">
                  <span>✓ {groqKeysCount} keys configured (rotating)</span>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={handleClearGroq}
                  >
                    Clear All Keys
                  </Button>
                </div>
              )}
            </FieldDescription>

            <div className="space-y-3">
              <InputGroup>
                <InputGroupInput
                  type="password"
                  value={groqKeyInput}
                  onChange={(e) => setGroqKeyInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="gsk_..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGroqKey();
                    }
                  }}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    onClick={addGroqKey}
                    variant="secondary"
                  >
                    Add
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              {/* List of keys to be added */}
              {newGroqKeys.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
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
          </Field>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <Button
            type="submit"
            disabled={isLoading || (!githubToken && newGroqKeys.length === 0)}
            variant="default"
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <Loader loading={isLoading} className="w-4 h-4" />
            ) : (
              <Save2 size={16} color="currentColor" variant="Bulk" />
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
