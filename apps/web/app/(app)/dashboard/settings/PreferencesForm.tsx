"use client";

import { useState } from "react";
import Loader from "@/components/ui/aevr/loader";
import { Button } from "@/components/ui/aevr/button";
import { Save2 } from "iconsax-react";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";

interface Preferences {
  aiSummary: boolean;
  allowedSources: string[];
  featureFlags?: {
    sidebarNavigation: boolean;
  };
}

interface PreferencesFormProps {
  initialPreferences: Preferences;
}

export default function PreferencesForm({
  initialPreferences,
}: PreferencesFormProps) {
  const [preferences, setPreferences] =
    useState<Preferences>(initialPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [newSource, setNewSource] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            aiSummary: preferences.aiSummary,
            allowedSources: preferences.allowedSources,
          },
          featureFlags: preferences.featureFlags,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setMessage("Preferences savedsuccessfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error saving preferences: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSource = () => {
    if (newSource && !preferences.allowedSources.includes(newSource)) {
      setPreferences({
        ...preferences,
        allowedSources: [...preferences.allowedSources, newSource],
      });
      setNewSource("");
    }
  };

  const removeSource = (source: string) => {
    setPreferences({
      ...preferences,
      allowedSources: preferences.allowedSources.filter((s) => s !== source),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Field
          orientation="horizontal"
          className="justify-between items-center"
        >
          <FieldContent>
            <FieldLabel>AI-Generated Summaries</FieldLabel>
            <FieldDescription>
              Get concise summaries of notifications instead of raw data
            </FieldDescription>
          </FieldContent>
          <Switch
            checked={preferences.aiSummary}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, aiSummary: checked })
            }
          />
        </Field>

        <Field>
          <FieldLabel>Allowed Sources</FieldLabel>
          <FieldDescription>
            Leave empty to receive notifications from all sources. Add specific
            sources to filter.
          </FieldDescription>

          <div className="space-y-2 pt-2">
            {preferences.allowedSources.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {preferences.allowedSources.map((source) => (
                  <span
                    key={source}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full"
                  >
                    {source}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSource(source)}
                      className="hover:bg-white/20 rounded-full p-0.5 h-auto w-auto min-h-0 min-w-0"
                    >
                      ×
                    </Button>
                  </span>
                ))}
              </div>
            )}

            <div className="pt-2">
              <InputGroup>
                <InputGroupInput
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="e.g., github, vercel, render"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSource();
                    }
                  }}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    variant="secondary"
                    onClick={addSource}
                  >
                    Add
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </Field>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">
            Example Feature
          </h4>
          <Field
            orientation="horizontal"
            className="justify-between items-center"
          >
            <FieldContent>
              <FieldLabel>Sidebar Navigation (Beta)</FieldLabel>
              <FieldDescription>
                Try the new collapsible sidebar navigation experience
              </FieldDescription>
            </FieldContent>
            <Switch
              checked={preferences.featureFlags?.sidebarNavigation || false}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  featureFlags: {
                    ...preferences.featureFlags,
                    sidebarNavigation: checked,
                  },
                })
              }
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t">
        <Button
          type="submit"
          disabled={isLoading}
          variant="default"
          className="bg-black text-white hover:bg-gray-800"
        >
          {isLoading ? (
            <Loader loading className="w-4 h-4" />
          ) : (
            <Save2 variant="Bulk" color="currentColor" className="w-4 h-4" />
          )}
          Save Preferences
        </Button>
        {message && (
          <span
            className={
              message.includes("Error") ? "text-red-600" : "text-green-600"
            }
          >
            {message}
          </span>
        )}
      </div>
    </form>
  );
}
