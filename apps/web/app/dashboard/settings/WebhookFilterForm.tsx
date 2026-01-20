"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Filter, Plus, X } from "lucide-react";

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
    <div className="mt-4 border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-sm">Webhook Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              {getActiveFilterCount()} source
              {getActiveFilterCount() > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 border-t space-y-6">
          <p className="text-xs text-gray-500">
            Configure which webhooks trigger notifications on this channel.
            Leave empty to receive all events.
          </p>

          {/* GitHub Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`github-enabled`}
                  checked={githubSource?.enabled || false}
                  onChange={(e) =>
                    updateSourceFilter("github", { enabled: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor={`github-enabled`}
                  className="font-medium text-sm"
                >
                  GitHub
                </label>
              </div>
              {githubSource && (
                <button
                  type="button"
                  onClick={() => removeSource("github")}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            {githubSource?.enabled && (
              <div className="ml-6 space-y-3">
                {/* Repositories */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Repositories (leave empty for all)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newRepo}
                      onChange={(e) => setNewRepo(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRepository("github");
                        }
                      }}
                      placeholder="owner/repo"
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <button
                      type="button"
                      onClick={() => addRepository("github")}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {githubSource.filters.repositories?.map((repo) => (
                      <div
                        key={repo}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                      >
                        <span>{repo}</span>
                        <button
                          type="button"
                          onClick={() => removeRepository("github", repo)}
                          className="hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Types */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Event Types (leave empty for all)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GITHUB_EVENTS.map((event) => (
                      <label
                        key={event}
                        className="flex items-center gap-2 text-xs cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            githubSource.filters.eventTypes?.includes(event) ||
                            false
                          }
                          onChange={() => toggleEventType("github", event)}
                          className="rounded border-gray-300"
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
                <input
                  type="checkbox"
                  id={`render-enabled`}
                  checked={renderSource?.enabled || false}
                  onChange={(e) =>
                    updateSourceFilter("render", { enabled: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor={`render-enabled`}
                  className="font-medium text-sm"
                >
                  Render
                </label>
              </div>
              {renderSource && (
                <button
                  type="button"
                  onClick={() => removeSource("render")}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            {renderSource?.enabled && (
              <div className="ml-6 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {RENDER_EVENTS.map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          renderSource.filters.eventTypes?.includes(event) ||
                          false
                        }
                        onChange={() => toggleEventType("render", event)}
                        className="rounded border-gray-300"
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
                <input
                  type="checkbox"
                  id={`vercel-enabled`}
                  checked={vercelSource?.enabled || false}
                  onChange={(e) =>
                    updateSourceFilter("vercel", { enabled: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor={`vercel-enabled`}
                  className="font-medium text-sm"
                >
                  Vercel
                </label>
              </div>
              {vercelSource && (
                <button
                  type="button"
                  onClick={() => removeSource("vercel")}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            {vercelSource?.enabled && (
              <div className="ml-6 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {VERCEL_EVENTS.map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          vercelSource.filters.eventTypes?.includes(event) ||
                          false
                        }
                        onChange={() => toggleEventType("vercel", event)}
                        className="rounded border-gray-300"
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
