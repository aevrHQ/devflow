import { Session } from "./client.js";

// Global registry for persistent sessions
export class SessionRegistry {
  private static sessions: Map<string, Session> = new Map();
  private static lastAccessed: Map<string, number> = new Map();
  private static TTL_MS = 30 * 60 * 1000; // 30 minutes

  static register(sessionId: string, session: Session) {
    this.sessions.set(sessionId, session);
    this.lastAccessed.set(sessionId, Date.now());
    console.log(`[SessionRegistry] Registered session: ${sessionId}`);
    this.cleanup();
  }

  static get(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.lastAccessed.set(sessionId, Date.now());
      console.log(`[SessionRegistry] Reusing session: ${sessionId}`);
    }
    return session;
  }

  static has(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  static delete(sessionId: string) {
    this.sessions.delete(sessionId);
    this.lastAccessed.delete(sessionId);
  }

  private static cleanup() {
    // Simple garbage collection
    const now = Date.now();
    for (const [id, lastTime] of this.lastAccessed.entries()) {
      if (now - lastTime > this.TTL_MS) {
        console.log(`[SessionRegistry] Expiring session: ${id}`);
        this.sessions.delete(id);
        this.lastAccessed.delete(id);
      }
    }
  }
}
