import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";

import mockSnykClient from "../test/mockSnykClient";
import executionHandler from "./executionHandler";
// import getTime from "./converters";

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

/*
test("getTime gets the time", async() => {
  const result = await getTime(new Date("2016-04-02T04:05:06.000Z"));
  expect(result.toBe(45));
});
*/
