import SnykClient from "snyk-client";
import {
  IntegrationExecutionContext,
  PersisterOperationsResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { SNYK_SERVICE_ENTITY_TYPE } from "./constants";
import {
  Project,
  toCodeRepoEntity,
  toCodeRepoVulnerabilityRelationship,
  toServiceCodeRepoRelationship,
  toVulnerabilityEntity,
  Vulnerability,
} from "./converters";
import { createOperationsFromFindings } from "./createOperations";
import {
  CodeRepoEntity,
  CodeRepoVulnerabilityRelationship,
  ServiceCodeRepoRelationship,
  ServiceEntity,
  SnykIntegrationInstanceConfig,
  VulnerabilityEntity,
} from "./types";

export default async function synchronize(
  context: IntegrationExecutionContext,
): Promise<PersisterOperationsResult> {
  const { persister } = context.clients.getClients();

  const config = context.instance.config as SnykIntegrationInstanceConfig;
  const Snyk = new SnykClient(config.SnykApiKey, config.SnykOrgId);

  const service: ServiceEntity = {
    _key: `hackerone:${config.SnykOrgId}`,
    _type: SNYK_SERVICE_ENTITY_TYPE,
    _class: ["Service", "Assessment"],
    displayName: `Snyk Scanner for ${config.SnykOrgId}`,
    category: "snyk", // ?
    handle: config.SnykApiKey, // ?
  };
  const serviceCodeRepoRelationships: ServiceCodeRepoRelationship[] = [];
  const codeRepoVulnerabilityRelationships: CodeRepoVulnerabilityRelationship[] = [];
  const serviceEntities: ServiceEntity[] = [service];
  const codeRepoEntities: CodeRepoEntity[] = [];
  const vulnerabilityEntities: VulnerabilityEntity[] = [];

  let vulnerabilities: Vulnerability[];
  let allProjects: Project[] = (await Snyk.listAllProjects(config.SnykOrgId))
    .projects;
  allProjects = allProjects.filter(
    project => project.origin === "bitbucket-cloud",
  ); // only use projects imported through bitbucket cloud

  allProjects = allProjects.slice(10, 20); // shorten for testing purposes

  for (const project of allProjects) {
    const proj: CodeRepoEntity = toCodeRepoEntity(project);
    codeRepoEntities.push(proj);
    serviceCodeRepoRelationships.push(
      toServiceCodeRepoRelationship(service, proj),
    );

    vulnerabilities = (await Snyk.listIssues(config.SnykOrgId, project.id, {}))
      .issues.vulnerabilities;
    vulnerabilities.forEach((vulnerability: Vulnerability) => {
      const vuln: VulnerabilityEntity = toVulnerabilityEntity(vulnerability);
      vulnerabilityEntities.push(vuln);
      codeRepoVulnerabilityRelationships.push(
        toCodeRepoVulnerabilityRelationship(proj, vuln),
      );
    });
  }

  return persister.publishPersisterOperations(
    await createOperationsFromFindings(
      context,
      serviceEntities,
      codeRepoEntities,
      vulnerabilityEntities,
      serviceCodeRepoRelationships,
      codeRepoVulnerabilityRelationships,
    ),
  );
}
