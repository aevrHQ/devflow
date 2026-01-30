"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

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
    <div className="bg-card p-6 rounded-2xl border border-border">
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        Developer Information
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Use these details to set up custom integrations or connect services like
        Render.
      </p>

      <div className="space-y-6">
        {/* User ID */}
        <Field>
          <FieldLabel>Your User ID</FieldLabel>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 bg-muted p-3 rounded-xl border border-border text-sm font-mono overflow-x-auto flex items-center text-foreground">
              {userId}
            </code>
            <button
              onClick={() => copyToClipboard(userId, "id")}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-foreground bg-background border border-border rounded-xl hover:bg-accent active:bg-muted transition-colors min-w-[80px]"
            >
              {copied === "id" ? "Copied!" : "Copy"}
            </button>
          </div>
        </Field>

        {/* Render Webhook URL */}
        <Field>
          <FieldLabel>Render / Custom Webhook URL</FieldLabel>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 bg-muted p-3 rounded-xl border border-border text-sm font-mono overflow-x-auto whitespace-nowrap flex items-center text-foreground scrollbar-hide">
              {renderWebhookUrl}
            </code>
            <button
              onClick={() => copyToClipboard(renderWebhookUrl, "url")}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-foreground bg-background border border-border rounded-xl hover:bg-accent active:bg-muted transition-colors min-w-[80px]"
              disabled={!origin}
            >
              {copied === "url" ? "Copied!" : "Copy"}
            </button>
          </div>
          <FieldDescription className="mt-2">
            Use this URL for{" "}
            <Link
              href="/help/render"
              className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
            >
              Render email forwarding
            </Link>{" "}
            or generic webhooks.
          </FieldDescription>
        </Field>
      </div>
    </div>
  );
}
