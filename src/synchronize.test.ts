import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";

import executionHandler from "./executionHandler";

import mockSnykClient from "../test/mockSnykClient";

jest.mock("snyk-client", () => {
  return jest.fn().mockImplementation(() => mockSnykClient);
});

const persisterOperations = {
  created: 1,
  deleted: 0,
  updated: 0,
};

test("compiles and runs", async () => {
  const executionContext = createTestIntegrationExecutionContext();

  executionContext.instance.config = {
    hackeroneApiKey: "api-key",
    hackeroneApiKeyName: "api-key-name",
  };

  jest
    .spyOn(executionContext.clients.getClients().graph, "findEntities")
    .mockResolvedValue([]);

  jest
    .spyOn(executionContext.clients.getClients().graph, "findRelationships")
    .mockResolvedValue([]);

  jest
    .spyOn(
      executionContext.clients.getClients().persister,
      "publishPersisterOperations",
    )
    .mockResolvedValue(persisterOperations);

  const result = await executionHandler(executionContext);
  expect(result).toEqual({ operations: persisterOperations });
});
