import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";

import mockSnykClient from "../test/mockSnykClient";
import invocationValidator from "./invocationValidator";
import { SnykIntegrationInstanceConfig } from "./types";

jest.mock("snyk-client", () => {
  return jest.fn().mockImplementation(() => mockSnykClient);
});

test("passes with valid config", async () => {
  const validConfig: SnykIntegrationInstanceConfig = {
    SnykApiKey: "asdf",
    SnykOrgId: "asdfasdf",
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config: validConfig,
    },
  });

  await invocationValidator(executionContext);
});

test("throws when access is denied", async () => {
  const validConfig: SnykIntegrationInstanceConfig = {
    SnykApiKey: "asdf",
    SnykOrgId: "asdfasdf",
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config: validConfig,
    },
  });

  mockSnykClient.verifyAccess.mockRejectedValue(
    new Error("verifyAccess failure of any kind"),
  );

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    /not be verified/,
  );
});

test("throws error if no api key is provided", async () => {
  const invalidConfig: SnykIntegrationInstanceConfig = {
    SnykApiKey: "",
    SnykOrgId: "asdfasdf",
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config: invalidConfig,
    },
  });
  await expect(invocationValidator(executionContext)).rejects.toThrow(
    "snykApiKey is required",
  );
});

test("throws error if no program handle is provided", async () => {
  const invalidConfig: SnykIntegrationInstanceConfig = {
    SnykApiKey: "asdf",
    SnykOrgId: "",
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config: invalidConfig,
    },
  });
  await expect(invocationValidator(executionContext)).rejects.toThrow(
    "snykOrgId is required",
  );
});

test("throws error if config not provided", async () => {
  const executionContext = createTestIntegrationExecutionContext();
  await expect(invocationValidator(executionContext)).rejects.toThrow(
    "Missing configuration",
  );
});
