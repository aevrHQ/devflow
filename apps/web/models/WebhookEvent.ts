import { Schema, model, models, Document, Model } from "mongoose";

export interface IWebhookEvent {
  source: string;
  event: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  status: "pending" | "processed" | "failed" | "ignored";
  error?: string;
  createdAt: Date;
}

export interface WebhookEventDocument extends IWebhookEvent, Document {}

const WebhookEventSchema = new Schema<WebhookEventDocument>(
  {
    source: { type: String, required: true },
    event: { type: String, required: true },
    // Payload is now stored as an encrypted string (AES-256-GCM)
    // Legacy data might be Mixed, but new writes will be String.
    // We use Mixed here to support both during migration, but conceptually it's a string.
    payload: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["pending", "processed", "failed", "ignored"],
      default: "pending",
    },
    error: { type: String },
  },
  {
    timestamps: true,
    expireAfterSeconds: 60 * 60 * 24 * 7, // Auto-delete after 7 days
  },
);

const WebhookEvent =
  (models.WebhookEvent as Model<WebhookEventDocument>) ||
  model<WebhookEventDocument>("WebhookEvent", WebhookEventSchema);

export default WebhookEvent;
