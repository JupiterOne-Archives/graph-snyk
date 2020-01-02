import {
  IntegrationError,
  IntegrationExecutionContext,
  IntegrationExecutionResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import synchronize from "./synchronize";

export default async function executionHandler(
  context: IntegrationExecutionContext,
): Promise<IntegrationExecutionResult> {
  try {
    const operations = await synchronize(context);
    return { operations };
  } catch (err) {
    if (err.code === "ETIMEDOUT") {
      throw new IntegrationError({
        cause: err,
        expose: true,
        message: "Failed to synchronize on connection timeout",
      });
    } else {
      throw err;
    }
  }
}
