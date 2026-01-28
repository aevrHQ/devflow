// Workflow factory and orchestration
import { FixBugWorkflow } from "./fix-bug.js";
import { FeatureWorkflow } from "./feature.js";
import { ExplainWorkflow } from "./explain.js";
import { ReviewPRWorkflow } from "./review-pr.js";
import { WorkflowExecutor } from "./base.js";
import type { WorkflowContext, WorkflowResult } from "./base.js";

export type WorkflowIntent =
  | "fix-bug"
  | "feature"
  | "explain"
  | "review-pr"
  | "deploy";

export class WorkflowFactory {
  static getWorkflow(
    intent: WorkflowIntent,
  ): new (platformUrl: string, platformSecret: string) => WorkflowExecutor {
    switch (intent) {
      case "fix-bug":
        return FixBugWorkflow;
      case "feature":
        return FeatureWorkflow;
      case "explain":
        return ExplainWorkflow;
      case "review-pr":
        return ReviewPRWorkflow;
      case "deploy":
        // TODO: Implement deploy workflow
        throw new Error("Deploy workflow not yet implemented");
      default:
        // Fallback to FeatureWorkflow for any unrecognized intents (e.g., "update readme", custom tasks)
        console.log(
          `[WorkflowFactory] Unknown intent "${intent}", falling back to FeatureWorkflow`,
        );
        return FeatureWorkflow;
    }
  }

  static async executeWorkflow(
    context: WorkflowContext,
    platformUrl?: string,
    token?: string,
  ): Promise<WorkflowResult> {
    const WorkflowClass = this.getWorkflow(context.intent as WorkflowIntent);

    const devflowUrl =
      platformUrl || process.env.DEVFLOW_API_URL || "http://localhost:3000";
    const devflowToken = token || process.env.DEVFLOW_API_SECRET || "";

    const workflow = new WorkflowClass(devflowUrl, devflowToken);
    return await workflow.execute(context);
  }
}

// Export all workflow classes and base
export { WorkflowExecutor, WorkflowContext, WorkflowResult };
export { FixBugWorkflow };
export { FeatureWorkflow };
export { ExplainWorkflow };
export { ReviewPRWorkflow };
