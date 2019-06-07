import SnykClient from "snyk-client";
import {
  IntegrationExecutionContext,
  PersisterOperationsResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { SNYK_SERVICE_ENTITY_TYPE } from "./constants";
import {
  Project,
  toCodeRepoEntity,
  toCodeRepoFindingRelationship,
  toServiceCodeRepoRelationship,
  toVulnerabilityRelationship,
  toFindingEntity,
  Vulnerability,
  //toVulnerabilityEntity,
} from "./converters";
import { createOperationsFromFindings } from "./createOperations";
import {
  CodeRepoEntity,
  CodeRepoFindingRelationship,
  ServiceCodeRepoRelationship,
  ServiceEntity,
  SnykIntegrationInstanceConfig,
  FindingVulnerabilityRelationship,
  FindingEntity,
} from "./types";

import { 
  getCVE, 
  CVE 
} from "./util/getCVE";

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
  const codeRepoFindingRelationships: CodeRepoFindingRelationship[] = [];
  const findingVulnerabilityRelationships: FindingVulnerabilityRelationship[] = [];
  const serviceEntities: ServiceEntity[] = [service];
  const codeRepoEntities: CodeRepoEntity[] = [];
  const findingEntities: FindingEntity[] = [];
  const cveEntities: CVE[] = [];

  let vulnerabilities: Vulnerability[];
  let allProjects: Project[] = (await Snyk.listAllProjects(config.SnykOrgId))
    .projects;
  allProjects = allProjects.filter(
    project => project.origin === "bitbucket-cloud",
  ); // only use projects imported through bitbucket cloud

  allProjects = allProjects.slice(10, 15); // shorten for testing purposes

  for (const project of allProjects) {
    const proj: CodeRepoEntity = toCodeRepoEntity(project);
    codeRepoEntities.push(proj);
    serviceCodeRepoRelationships.push(
      toServiceCodeRepoRelationship(service, proj),
    );

    vulnerabilities = (await Snyk.listIssues(config.SnykOrgId, project.id, {})).issues.vulnerabilities;
    vulnerabilities = vulnerabilities.filter(  // FOR TESTING
      vuln => vuln.identifiers.CVE.length >= 1, // FOR TESTING
    ); // FOR TESTING
  

    vulnerabilities.forEach((vulnerability: Vulnerability) => {
      console.log(vulnerability.identifiers.CVE);
      const finding: FindingEntity = toFindingEntity(vulnerability);
      findingEntities.push(finding);
      codeRepoFindingRelationships.push(
        toCodeRepoFindingRelationship(proj, finding),
      );

      for (const cve of vulnerability.identifiers.CVE) {
        const snykCVE: CVE = getCVE(cve);
        cveEntities.push(snykCVE);
        findingVulnerabilityRelationships.push(toVulnerabilityRelationship(finding, snykCVE));
      }
    });
  }
  //console.log(codeRepoEntities.length);

  return persister.publishPersisterOperations(
    await createOperationsFromFindings(
      context,
      serviceEntities,
      codeRepoEntities,
      findingEntities,
      cveEntities,
      serviceCodeRepoRelationships,
      codeRepoFindingRelationships,
      findingVulnerabilityRelationships
    ),
  );
}
