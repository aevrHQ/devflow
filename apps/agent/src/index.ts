import { runCLI } from "./cli.js";

// Main entry point
runCLI().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
