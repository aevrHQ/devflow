"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Filter, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/aevr/button";
import { Switch } from "@/components/ui/switch";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";

interface WebhookFilter {
  type: string;
  enabled: boolean;
  filters: {
    repositories?: string[];
    eventTypes?: string[];
    services?: string[];
    [key: string]: unknown;
  };
}

interface WebhookRules {
  sources: WebhookFilter[];
}

interface WebhookFilterFormProps {
  channelIndex: number;
  currentRules?: WebhookRules;
  onUpdate: (rules: WebhookRules) => void;
}

const GITHUB_EVENTS = [
  "push",
  "pull_request",
  "issues",
  "issue_comment",
  "pull_request_review",
  "deployment",
  "deployment_status",
  "release",
  "star",
  "fork",
  "watch",
];

const RENDER_EVENTS = ["deploy.succeeded", "deploy.failed", "deploy.started"];

const VERCEL_EVENTS = [
  "deployment.created",
  "deployment.succeeded",
  "deployment.failed",
  "deployment.ready",
];

export default function WebhookFilterForm({
  currentRules,
  onUpdate,
}: WebhookFilterFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sources, setSources] = useState<WebhookFilter[]>(
    currentRules?.sources || [],
  );

  const [newRepo, setNewRepo] = useState("");

  const getSourceFilter = (type: string): WebhookFilter | undefined => {
    return sources.find((s) => s.type === type);
  };

  const updateSourceFilter = (
    type: string,
    updates: Partial<WebhookFilter>,
  ) => {
    const newSources = [...sources];
    const index = newSources.findIndex((s) => s.type === type);

    if (index >= 0) {
      newSources[index] = { ...newSources[index], ...updates };
    } else {
      newSources.push({
        type,
        enabled: true,
        filters: {},
        ...updates,
      });
    }

    setSources(newSources);
    onUpdate({ sources: newSources });
  };

  const removeSource = (type: string) => {
    const newSources = sources.filter((s) => s.type !== type);
    setSources(newSources);
    onUpdate({ sources: newSources });
  };

  const addRepository = (sourceType: string) => {
    if (!newRepo.trim()) return;

    const source = getSourceFilter(sourceType);
    const repos = source?.filters.repositories || [];

    updateSourceFilter(sourceType, {
      filters: {
        ...source?.filters,
        repositories: [...repos, newRepo.trim()],
      },
    });

    setNewRepo("");
  };

  const removeRepository = (sourceType: string, repo: string) => {
    const source = getSourceFilter(sourceType);
    const repos = source?.filters.repositories || [];

    updateSourceFilter(sourceType, {
      filters: {
        ...source?.filters,
        repositories: repos.filter((r) => r !== repo),
      },
    });
  };

  const toggleEventType = (sourceType: string, event: string) => {
    const source = getSourceFilter(sourceType);
    const eventTypes = source?.filters.eventTypes || [];

    const newEventTypes = eventTypes.includes(event)
      ? eventTypes.filter((e) => e !== event)
      : [...eventTypes, event];

    updateSourceFilter(sourceType, {
      filters: {
        ...source?.filters,
        eventTypes: newEventTypes,
      },
    });
  };

  const getActiveFilterCount = () => {
    return sources.filter((s) => s.enabled).length;
  };

  const githubSource = getSourceFilter("github");
  const renderSource = getSourceFilter("render");
  const vercelSource = getSourceFilter("vercel");

  return (
    <div className="mt-4 border border-border rounded-lg">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent rounded-lg transition-colors h-auto"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm text-foreground">
            Webhook Filters
          </span>
          {getActiveFilterCount() > 0 && (
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs rounded-full">
              {getActiveFilterCount()} source
              {getActiveFilterCount() > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>

      {isExpanded && (
        <div className="p-4 border-t border-border space-y-6">
          <p className="text-xs text-muted-foreground">
            Configure which webhooks trigger notifications on this channel.
            Leave empty to receive all events.
          </p>

          {/* GitHub Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Field orientation="horizontal">
                  <Switch
                    id={`github-enabled`}
                    checked={githubSource?.enabled || false}
                    onCheckedChange={(checked) =>
                      updateSourceFilter("github", {
                        enabled: checked,
                      })
                    }
                  />
                  <FieldLabel htmlFor={`github-enabled`}>GitHub</FieldLabel>
                </Field>
              </div>
              {githubSource && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSource("github")}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 h-auto min-h-0"
                >
                  Remove
                </Button>
              )}
            </div>

            {githubSource?.enabled && (
              <div className="ml-6 space-y-3">
                <div>
                  <Field>
                    <FieldLabel>Repositories</FieldLabel>
                    <InputGroup className="mb-2">
                      <InputGroupInput
                        type="text"
                        value={newRepo}
                        onChange={(e) => setNewRepo(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addRepository("github");
                          }
                        }}
                        placeholder="owner/repo"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          type="button"
                          variant="secondary"
                          onClick={() => addRepository("github")}
                        >
                          <Plus className="w-4 h-4" />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>Leave empty for all</FieldDescription>
                  </Field>
                  {/* Tags Container moved outside or below description */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {githubSource.filters.repositories?.map((repo) => (
                      <div
                        key={repo}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs rounded-md"
                      >
                        <span>{repo}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRepository("github", repo)}
                          className="hover:text-blue-800 dark:hover:text-blue-300 h-auto w-auto min-h-0 min-w-0 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Types */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Event Types (leave empty for all)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GITHUB_EVENTS.map((event) => (
                      <label
                        key={event}
                        className="flex items-center gap-2 text-xs cursor-pointer text-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={
                            githubSource.filters.eventTypes?.includes(event) ||
                            false
                          }
                          onChange={() => toggleEventType("github", event)}
                          className="rounded border-input bg-background"
                        />
                        <span>{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Render Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Field orientation="horizontal">
                  <Switch
                    id={`render-enabled`}
                    checked={renderSource?.enabled || false}
                    onCheckedChange={(checked) =>
                      updateSourceFilter("render", {
                        enabled: checked,
                      })
                    }
                  />
                  <FieldLabel htmlFor={`render-enabled`}>Render</FieldLabel>
                </Field>
              </div>
              {renderSource && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSource("render")}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 h-auto min-h-0"
                >
                  Remove
                </Button>
              )}
            </div>

            {renderSource?.enabled && (
              <div className="ml-6 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {RENDER_EVENTS.map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-2 text-xs cursor-pointer text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={
                          renderSource.filters.eventTypes?.includes(event) ||
                          false
                        }
                        onChange={() => toggleEventType("render", event)}
                        className="rounded border-input bg-background"
                      />
                      <span>{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vercel Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Field orientation="horizontal">
                  <Switch
                    id={`vercel-enabled`}
                    checked={vercelSource?.enabled || false}
                    onCheckedChange={(checked) =>
                      updateSourceFilter("vercel", {
                        enabled: checked,
                      })
                    }
                  />
                  <FieldLabel htmlFor={`vercel-enabled`}>Vercel</FieldLabel>
                </Field>
              </div>
              {vercelSource && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSource("vercel")}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 h-auto min-h-0"
                >
                  Remove
                </Button>
              )}
            </div>

            {vercelSource?.enabled && (
              <div className="ml-6 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {VERCEL_EVENTS.map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-2 text-xs cursor-pointer text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={
                          vercelSource.filters.eventTypes?.includes(event) ||
                          false
                        }
                        onChange={() => toggleEventType("vercel", event)}
                        className="rounded border-input bg-background"
                      />
                      <span>{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
