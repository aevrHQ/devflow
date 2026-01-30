"use client";

import { useState, useEffect, useRef } from "react";
import { Add, Trash, TickCircle } from "iconsax-react";
import WebhookFilterForm from "./WebhookFilterForm";
import Loader from "@/components/ui/aevr/loader";
import { Button } from "@/components/ui/aevr/button";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import ResponsiveDialog from "@/components/ui/aevr/responsive-dialog";

export interface Channel {
  type: string;
  config: Record<string, unknown>;
  enabled: boolean;
  name?: string;
  webhookRules?: {
    sources: {
      type: string;
      enabled: boolean;
      filters: {
        repositories?: string[];
        eventTypes?: string[];
        services?: string[];
        [key: string]: unknown;
      };
    }[];
  };
}

interface NotificationChannelsFormProps {
  initialChannels: Channel[];
  userId: string;
}

export default function NotificationChannelsForm({
  initialChannels,
  userId,
}: NotificationChannelsFormProps) {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [origin, setOrigin] = useState("");
  const autoSaveTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Auto-save when channels change
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Don't auto-save on initial mount
    if (JSON.stringify(channels) === JSON.stringify(initialChannels)) {
      return;
    }

    // Set new timer for auto-save (1 second debounce)
    autoSaveTimer.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const res = await fetch("/api/user/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channels }),
        });

        if (res.ok) {
          setMessage("✓ Auto-saved");
          setTimeout(() => setMessage(""), 2000);
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [channels, initialChannels]);

  const addChannel = (type: string) => {
    const newChannel: Channel = {
      type,
      config:
        type === "telegram"
          ? { chatId: "", botToken: "" }
          : type === "discord"
            ? { webhookUrl: "" }
            : type === "slack"
              ? { webhookUrl: "" }
              : {},
      enabled: true,
      name: `My ${type.charAt(0).toUpperCase() + type.slice(1)} Channel`,
    };
    setChannels([...channels, newChannel]);
  };

  const removeChannel = (index: number) => {
    setChannels(channels.filter((_, i) => i !== index));
  };

  const updateChannel = (index: number, updates: Partial<Channel>) => {
    const updated = [...channels];
    updated[index] = { ...updated[index], ...updates };
    setChannels(updated);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {channels.map((channel, index) => (
          <div
            key={index}
            className="p-4 border border-border rounded-xl bg-card/50 dark:bg-zinc-900/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Field>
                  <FieldLabel className="sr-only">Channel Name</FieldLabel>
                  <Input
                    type="text"
                    value={channel.name || ""}
                    onChange={(e) =>
                      updateChannel(index, { name: e.target.value })
                    }
                    placeholder="Channel name"
                  />
                  <FieldDescription className="text-xs capitalize mt-0">
                    {channel.type}
                  </FieldDescription>
                </Field>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={channel.enabled}
                  onCheckedChange={(checked) =>
                    updateChannel(index, { enabled: checked })
                  }
                />
                <Button
                  type="button"
                  onClick={() => removeChannel(index)}
                  variant="ghost"
                  size="sm"
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl h-auto w-auto min-h-0 min-w-0"
                >
                  <Trash
                    className="w-4 h-4"
                    variant="TwoTone"
                    color="currentColor"
                  />
                </Button>
              </div>
            </div>

            {channel.type === "telegram" && (
              <div className="space-y-3">
                <Field>
                  <FieldLabel>Chat Type</FieldLabel>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`chat-type-${index}`}
                        checked={
                          !(channel.config as Record<string, unknown>)
                            .isGroupChat
                        }
                        onChange={() =>
                          updateChannel(index, {
                            config: {
                              ...channel.config,
                              isGroupChat: false,
                            },
                          })
                        }
                        className="rounded-full border-input bg-background"
                      />
                      <span className="text-sm text-foreground">
                        Personal DM
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`chat-type-${index}`}
                        checked={
                          !!(channel.config as Record<string, unknown>)
                            .isGroupChat
                        }
                        onChange={() =>
                          updateChannel(index, {
                            config: {
                              ...channel.config,
                              isGroupChat: true,
                            },
                          })
                        }
                        className="rounded-full border-input bg-background"
                      />
                      <span className="text-sm text-foreground">
                        Group Chat
                      </span>
                    </label>
                  </div>
                </Field>

                {!(channel.config as Record<string, unknown>).chatId ? (
                  (channel.config as Record<string, unknown>).isGroupChat ? (
                    // Group Chat Instructions
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-3">
                      <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                        📋 Steps to connect group chat:
                      </p>
                      <ol className="text-sm text-blue-600 dark:text-blue-300 space-y-2 list-decimal list-inside">
                        <li>
                          Add @
                          {process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ||
                            "thedevflowbot"}{" "}
                          to your Telegram group
                        </li>
                        <li>In the group, send this command:</li>
                      </ol>
                      <div className="bg-background p-3 rounded border border-border font-mono text-xs break-all text-foreground">
                        /start channel_{userId}_{index}
                      </div>
                      <ResponsiveDialog
                        title="Command Copied!"
                        description="The command has been copied to your clipboard. Paste it in your Telegram group chat to connect."
                        trigger={
                          <Button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `/start channel_${userId}_${index}`,
                              );
                            }}
                            variant="primary"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                          >
                            📋 Copy Command
                          </Button>
                        }
                      >
                        <div className="flex justify-end">
                          <Button
                            variant="secondary"
                            className="w-full sm:w-auto"
                          >
                            Got it
                          </Button>
                        </div>
                      </ResponsiveDialog>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        💡 The bot will confirm when connected successfully
                      </p>
                    </div>
                  ) : (
                    // Personal DM Button
                    <div className="space-y-2">
                      <a
                        href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "thedevflowbot"}?start=channel_${userId}_${index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        Connect with Telegram
                      </a>
                      <p className="text-xs text-muted-foreground">
                        Click to open Telegram and connect this channel
                      </p>
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-2 rounded-xl">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Connected to{" "}
                      {(channel.config as Record<string, unknown>).isGroupChat
                        ? "Group"
                        : "DM"}
                      :{" "}
                      {String(
                        (channel.config as Record<string, unknown>).chatId ||
                          "",
                      )}
                    </div>
                    <Field>
                      <FieldLabel>Bot Token</FieldLabel>
                      <Input
                        type="password"
                        value={
                          ((channel.config as Record<string, unknown>)
                            .botToken as string) || ""
                        }
                        onChange={(e) =>
                          updateChannel(index, {
                            config: {
                              ...channel.config,
                              botToken: e.target.value,
                            },
                          })
                        }
                        placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      />
                      <FieldDescription>
                        Optional if using the official bot
                      </FieldDescription>
                    </Field>
                  </div>
                )}

                {/* Webhook Filtering */}
                <WebhookFilterForm
                  channelIndex={index}
                  currentRules={channel.webhookRules}
                  onUpdate={(rules) =>
                    updateChannel(index, { webhookRules: rules })
                  }
                />
              </div>
            )}

            {channel.type === "discord" && (
              <Field>
                <FieldLabel>Webhook URL</FieldLabel>
                <Input
                  type="text"
                  value={
                    ((channel.config as Record<string, unknown>)
                      .webhookUrl as string) || ""
                  }
                  onChange={(e) =>
                    updateChannel(index, {
                      config: { ...channel.config, webhookUrl: e.target.value },
                    })
                  }
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </Field>
            )}

            {channel.type === "slack" && (
              <div className="space-y-4">
                {(channel.config as Record<string, unknown>).webhookUrl ? (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-2 rounded-xl border border-green-500/20">
                    <TickCircle
                      className="w-4 h-4"
                      variant="Bulk"
                      color="currentColor"
                    />
                    Connected to{" "}
                    <span className="font-medium">
                      {String(
                        (channel.config as Record<string, unknown>).teamName ||
                          "Workspace",
                      )}
                    </span>
                    {String(
                      (channel.config as Record<string, unknown>).channelName ||
                        "",
                    )
                      ? ` (#${String((channel.config as Record<string, unknown>).channelName)})`
                      : ""}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <a
                      href={`https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=incoming-webhook,commands,chat:write&redirect_uri=${origin}/api/auth/slack/callback&state=channel_${userId}_${index}`}
                      className="w-full text-center px-4 py-2.5 bg-[#4A154B] hover:bg-[#361139] text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.527 2.527 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.52v-6.315zm8.833-2.52a2.528 2.528 0 0 1 2.521-2.521 2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521h-2.521v-2.521zm-1.26 2.521a2.527 2.527 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521V6.315a2.528 2.528 0 0 1 2.521-2.521 2.528 2.528 0 0 1 2.521 2.521v6.315zm6.311-8.835a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.52H17.687v-2.52a2.528 2.528 0 0 1-2.52-2.521zm-2.521 1.26a2.528 2.528 0 0 1-2.521-2.52 2.528 2.528 0 0 1-2.521-2.52v-2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.521 2.522v2.522z" />
                      </svg>
                      Connect Slack
                    </a>
                    <p className="text-xs text-muted-foreground text-center">
                      You&apos;ll be redirected to Slack to authorize Devflow
                    </p>
                  </div>
                )}
                {/* Webhook Filtering for Slack */}
                <WebhookFilterForm
                  channelIndex={index}
                  currentRules={channel.webhookRules}
                  onUpdate={(rules) =>
                    updateChannel(index, { webhookRules: rules })
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => addChannel("telegram")}
          variant="secondary"
          className="flex items-center gap-2 px-4 py-2 text-sm bg-background border border-border rounded-xl hover:bg-accent text-foreground"
        >
          <Add className="w-4 h-4" color="currentColor" />
          Add Telegram
        </Button>
        <Button
          type="button"
          onClick={() => addChannel("discord")}
          variant="secondary"
          className="flex items-center gap-2 px-4 py-2 text-sm bg-background border border-border rounded-xl hover:bg-accent text-foreground"
        >
          <Add className="w-4 h-4" color="currentColor" />
          Add Discord
        </Button>
        <Button
          type="button"
          onClick={() => addChannel("slack")}
          variant="secondary"
          className="flex items-center gap-2 px-4 py-2 text-sm bg-background border border-border rounded-xl hover:bg-accent text-foreground"
        >
          <Add className="w-4 h-4" color="currentColor" />
          Add Slack
        </Button>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-border">
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader loading={isSaving} className="w-4 h-4" />
            Saving...
          </div>
        )}
        {message && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <TickCircle
              className="w-4 h-4"
              variant="Bulk"
              color="currentColor"
            />
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
