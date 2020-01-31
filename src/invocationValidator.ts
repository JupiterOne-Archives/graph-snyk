import {
  IntegrationInstanceAuthenticationError,
  IntegrationInstanceConfigError,
  IntegrationValidationContext,
} from "@jupiterone/jupiter-managed-integration-sdk";
import SnykClient from "@jupiterone/snyk-client";
import { SnykIntegrationInstanceConfig } from "./types";

export default async function invocationValidator(
  context: IntegrationValidationContext,
): Promise<void> {
  const config = context.instance.config as SnykIntegrationInstanceConfig;

  if (!config) {
    throw new IntegrationInstanceConfigError("Missing configuration");
  } else if (!config.snykApiKey) {
    throw new IntegrationInstanceConfigError("snykApiKey is required");
  } else if (!config.snykOrgId) {
    throw new IntegrationInstanceConfigError("snykOrgId is required");
  }

  const provider = new SnykClient(config.snykApiKey);

  try {
    await provider.verifyAccess(config.snykOrgId);
  } catch (err) {
    throw new IntegrationInstanceAuthenticationError(err);
  }
}
