import { Schema, model, models, Document, Model } from "mongoose";

export interface ISession {
  sessionId: string; // Unique session identifier from GitHub Copilot or generated
  taskId: string; // Reference to TaskAssignment
  agentId: string; // Reference to Agent
  userId: string; // Reference to User
  status: "active" | "inactive" | "ended";
  createdAt: Date;
  lastActiveAt: Date;
  metadata?: Record<string, unknown>; // Extra data like capabilities used, total tokens, etc.
}

export interface SessionDocument extends ISession, Document {}

const SessionSchema = new Schema<SessionDocument>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    taskId: { type: String, required: true, index: true },
    agentId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["active", "inactive", "ended"],
      default: "active",
    },
    lastActiveAt: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  },
);

const Session =
  (models.Session as Model<SessionDocument>) ||
  model<SessionDocument>("Session", SessionSchema);

export default Session;
