import {
  IntegrationExecutionContext,
  PersisterOperationsResult,
} from "@jupiterone/jupiter-managed-integration-sdk";
import SnykClient from "@jupiterone/snyk-client";
import { SNYK_SERVICE_ENTITY_TYPE } from "./constants";
import {
  Project,
  toCVEEntities,
  toCWEEntities,
  toFindingEntity,
  toFindingVulnerabilityRelationship,
  toFindingWeaknessRelationship,
  toServiceFindingRelationship,
  Vulnerability,
} from "./converters";
import { createOperationsFromFindings } from "./createOperations";
import {
  FindingCWERelationship,
  FindingEntity,
  FindingVulnerabilityRelationship,
  ServiceEntity,
  ServiceFindingRelationship,
  SnykIntegrationInstanceConfig,
} from "./types";

export default async function synchronize(
  context: IntegrationExecutionContext,
): Promise<PersisterOperationsResult> {
  const { persister } = context.clients.getClients();
  const config = context.instance.config as SnykIntegrationInstanceConfig;
  const Snyk = new SnykClient(config.snykApiKey, config.snykOrgId);
  const service: ServiceEntity = {
    _key: `snyk:${config.snykOrgId}`,
    _type: SNYK_SERVICE_ENTITY_TYPE,
    _class: ["Service", "Account"],
    category: "third party vulnerability scanning",
    displayName: `Snyk Scanner for Bitbucket Projects`,
  };

  const serviceFindingRelationships: ServiceFindingRelationship[] = [];
  const findingVulnerabilityRelationships: FindingVulnerabilityRelationship[] = [];
  const findingCWERelationships: FindingCWERelationship[] = [];
  const serviceEntities: ServiceEntity[] = [service];
  const findingEntities: FindingEntity[] = [];
  let dup: boolean = false;

  let allProjects: Project[] = (await Snyk.listAllProjects(config.snykOrgId))
    .projects;
  allProjects = allProjects.filter(
    project => project.origin === "bitbucket-cloud",
  );
  allProjects = allProjects.slice(10, 15); // shorten for testing purposes

  for (const project of allProjects) {
    dup = false;
    const fullProjectName: string = project.name;
    const piecedName: string[] = fullProjectName.split(":");
    const projectName: string = piecedName[0];
    const packageFileName = piecedName[1];

    const vulnerabilities: Vulnerability[] = (await Snyk.listIssues(
      config.snykOrgId,
      project.id,
      {},
    )).issues.vulnerabilities;

    vulnerabilities.forEach((vulnerability: Vulnerability) => {
      const finding: FindingEntity = toFindingEntity(vulnerability);

      const cveList = toCVEEntities(vulnerability);
      for (const cve of cveList) {
        findingVulnerabilityRelationships.push(
          toFindingVulnerabilityRelationship(finding, cve),
        );
      }

      const cweList = toCWEEntities(vulnerability);
      for (const cwe of cweList) {
        findingCWERelationships.push(
          toFindingWeaknessRelationship(finding, cwe),
        );
      }

      findingEntities.forEach((part, index, list) => {
        if (
          list[index].id === finding.id &&
          list[index].targets.includes(projectName) === false
        ) {
          list[index].targets.push(projectName);
          list[index].identifiedInFile = packageFileName;
          dup = true;
        } else if (list[index].id === finding.id) {
          dup = true;
        }
      });

      if (dup === false) {
        finding.targets.push(projectName);
        finding.identifiedInFile = packageFileName;
        findingEntities.push(finding);
      }
    });
  }

  findingEntities.forEach((finding: FindingEntity) => {
    // console.log(finding.targets);
    serviceFindingRelationships.push(
      toServiceFindingRelationship(service, finding),
    );
  });

  return persister.publishPersisterOperations(
    await createOperationsFromFindings(
      context,
      serviceEntities,
      findingEntities,
      serviceFindingRelationships,
      findingVulnerabilityRelationships,
      findingCWERelationships,
    ),
  );
}
