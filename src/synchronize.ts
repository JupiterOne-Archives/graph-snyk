import {
  IntegrationExecutionContext,
  PersisterOperationsResult,
} from "@jupiterone/jupiter-managed-integration-sdk";
import SnykClient from "@jupiterone/snyk-client";
import { SNYK_SERVICE_ENTITY_TYPE } from "./constants";
import {
  Project,
  SnykVulnIssue,
  toCVEEntities,
  toCWEEntities,
  toFindingEntity,
  toFindingVulnerabilityRelationship,
  toFindingWeaknessRelationship,
  toServiceFindingRelationship,
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
    category: "code dependency scan",
    displayName: `snyk/${config.snykOrgId}`,
  };
  const serviceFindingRelationships: ServiceFindingRelationship[] = [];

  const findingVulnerabilityRelationships: FindingVulnerabilityRelationship[] = [];
  const findingCWERelationships: FindingCWERelationship[] = [];
  const serviceEntities: ServiceEntity[] = [service];
  const findingEntities: FindingEntity[] = [];

  type FindingsMap = {
    [key: string]: FindingEntity;
  };

  const findingsById: FindingsMap = {};

  const allProjects: Project[] = (await Snyk.listAllProjects(config.snykOrgId))
    .projects;

  for (const project of allProjects) {
    const name: string[] = project.name.split(":");
    const projectName = name[0];
    const packageName = name[1];

    const vulnerabilities: SnykVulnIssue[] = (await Snyk.listIssues(
      config.snykOrgId,
      project.id,
      {},
    )).issues.vulnerabilities;

    const licenses: SnykVulnIssue[] = (await Snyk.listIssues(
      config.snykOrgId,
      project.id,
      {},
    )).issues.licenses;

    vulnerabilities.forEach((vuln: SnykVulnIssue) => {
      vuln.type = "vulnerability";
    });

    licenses.forEach((license: SnykVulnIssue) => {
      license.type = "license";
      license.identifiers = { CVE: [], CWE: [] };
    });

    const snykIssues: SnykVulnIssue[] = vulnerabilities.concat(licenses);

    snykIssues.forEach((issue: SnykVulnIssue) => {
      const finding = toFindingEntity(issue);
      if (findingsById[finding.id]) {
        if (!findingsById[finding.id].targets.includes(projectName)) {
          findingsById[finding.id].targets.push(projectName);
        }
      } else {
        finding.targets.push(projectName);
        finding.identifiedInFile = packageName;
        findingsById[finding.id] = finding;
        findingEntities.push(finding);
      }
    });
  }

  findingEntities.forEach((finding: FindingEntity) => {
    const cveList = toCVEEntities(finding);
    for (const cve of cveList) {
      findingVulnerabilityRelationships.push(
        toFindingVulnerabilityRelationship(finding, cve),
      );
    }

    const cweList = toCWEEntities(finding);
    for (const cwe of cweList) {
      findingCWERelationships.push(toFindingWeaknessRelationship(finding, cwe));
    }

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
