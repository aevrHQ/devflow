// Feature Implementation Workflow
// Automatically implements new features in a repository
import { WorkflowExecutor, WorkflowContext, WorkflowResult } from "./base.js";

export class FeatureWorkflow extends WorkflowExecutor {
  async execute(context: WorkflowContext): Promise<WorkflowResult> {
    try {
      await this.sendProgress(
        context.taskId,
        "Starting feature implementation workflow",
        0.05,
        `Repository: ${context.repo}`,
      );

      const systemPrompt = this.buildSystemPrompt("feature", context);

      const isLocal = !!context.localPath;
      const steps = isLocal
        ? `
1. Explore the repository structure in ${context.localPath}
2. List relevant files and understand the architecture
3. Identify the files that need to be created or modified
4. Implement the feature:
   - Create new files as needed
   - Modify existing files
   - Follow the existing code patterns and style
5. Run tests if available to ensure nothing is broken
6. Send final progress update with a summary of changes`
        : `
1. Clone the repository to a temporary location
2. Explore the repository structure
3. List relevant files and understand the architecture
4. Create a feature branch: feature/<feature-name>
5. Identify the files that need to be created or modified
6. Implement the feature:
   - Create new files as needed
   - Modify existing files
   - Follow the existing code patterns and style
7. Add appropriate tests for the new feature
8. Run tests to ensure nothing is broken
9. Commit the changes with a clear, descriptive message
10. Push the branch
11. Create a pull request
12. Send final progress update with the PR URL`;

      const userPrompt = `
You are tasked with implementing the following feature:

${context.naturalLanguage}

${context.context?.requirements ? `Requirements:\n${context.context.requirements}` : ""}
${context.context?.acceptance ? `Acceptance criteria:\n${context.context.acceptance}` : ""}
${context.context?.files ? `Related files:\n${context.context.files}` : ""}

Follow these steps:
${steps}

Guidelines:
- Ask for clarification if requirements are ambiguous
- Ensure code follows repository conventions
- Use send_progress_update frequently to keep user informed
- For local modifications, simply write the files.
- ${isLocal ? "DO NOT create a PR or push unless explicitly asked." : "Always create a PR."} 

After each major step, send a progress update to the user.
`;

      const result = await this.executeWorkflow(
        `${systemPrompt}\n\n${userPrompt}`,
        context,
      );

      if (result.success) {
        await this.sendProgress(
          context.taskId,
          "Feature implementation complete",
          1.0,
          result.summary,
        );

        // Send completion notification to platform
        await this.sendCompletion(context.taskId, result);
      } else {
        // Send error notification
        await this.sendCompletion(context.taskId, result);
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      await this.sendCompletion(context.taskId, {
        success: false,
        error: errorMsg,
      });

      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}
