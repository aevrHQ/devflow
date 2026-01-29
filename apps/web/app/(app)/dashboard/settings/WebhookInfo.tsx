"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function WebhookInfo({ userId }: { userId: string }) {
  const [copied, setCopied] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // eslint-disable-next-line
    setOrigin(window.location.origin);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const renderWebhookUrl = origin
    ? `${origin}/api/webhook/render?userId=${userId}`
    : "...";

  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        Developer Information
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Use these details to set up custom integrations or connect services like
        Render.
      </p>

      <div className="space-y-6">
        {/* User ID */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Your User ID
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 bg-muted p-3 rounded-lg border border-border text-sm font-mono overflow-x-auto flex items-center text-foreground">
              {userId}
            </code>
            <button
              onClick={() => copyToClipboard(userId, "id")}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-accent active:bg-muted transition-colors min-w-[80px]"
            >
              {copied === "id" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Render Webhook URL */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Render / Custom Webhook URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 bg-muted p-3 rounded-lg border border-border text-sm font-mono overflow-x-auto whitespace-nowrap flex items-center text-foreground scrollbar-hide">
              {renderWebhookUrl}
            </code>
            <button
              onClick={() => copyToClipboard(renderWebhookUrl, "url")}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-accent active:bg-muted transition-colors min-w-[80px]"
              disabled={!origin}
            >
              {copied === "url" ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Use this URL for{" "}
            <Link
              href="/help/render"
              className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
            >
              Render email forwarding
            </Link>{" "}
            or generic webhooks.
          </p>
        </div>
      </div>
    </div>
  );
}
