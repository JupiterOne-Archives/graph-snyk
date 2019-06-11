import {
  IntegrationInstanceAuthenticationError,
  IntegrationInstanceConfigError,
  IntegrationValidationContext,
} from "@jupiterone/jupiter-managed-integration-sdk";
import SnykClient from "@jupiterone/snyk-client";
import { SnykIntegrationInstanceConfig } from "./types";

export default async function invocationValidator(
  context: IntegrationValidationContext,
) {
  const config = context.instance.config as SnykIntegrationInstanceConfig;

  if (!config) {
    throw new IntegrationInstanceConfigError("Missing configuration");
  } else if (!config.SnykApiKey) {
    throw new IntegrationInstanceConfigError("snykApiKey is required");
  } else if (!config.SnykOrgId) {
    throw new IntegrationInstanceConfigError("snykOrgId is required");
  }

  const provider = new SnykClient(config.SnykApiKey);

  try {
    await provider.verifyAccess(config.SnykOrgId);
  } catch (err) {
    throw new IntegrationInstanceAuthenticationError(err);
  }
}
