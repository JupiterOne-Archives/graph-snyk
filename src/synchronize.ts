import {
  IntegrationExecutionContext,
  PersisterOperationsResult,
} from "@jupiterone/jupiter-managed-integration-sdk";
import SnykClient from "@jupiterone/snyk-client";
import { SNYK_SERVICE_ENTITY_TYPE } from "./constants";
import {
  Project,
  //toCodeRepoEntity,
  //toCodeRepoFindingRelationship,
  toCVEEntities,
  toCWEEntities,
  toFindingEntity,
  toFindingVulnerabilityRelationship,
  toFindingWeaknessRelationship,
  //toServiceCodeRepoRelationship,
  Vulnerability,
  toServiceFindingRelationship,
} from "./converters";
import { createOperationsFromFindings } from "./createOperations";
import {
  //CodeRepoEntity,
  //CodeRepoFindingRelationship,
  FindingCWERelationship,
  FindingEntity,
  FindingVulnerabilityRelationship,
  //ServiceCodeRepoRelationship,
  ServiceEntity,
  SnykIntegrationInstanceConfig,
  ServiceFindingRelationship,
} from "./types";

export default async function synchronize(
  context: IntegrationExecutionContext,
): Promise<PersisterOperationsResult> {
  const { persister } = context.clients.getClients();
  const config = context.instance.config as SnykIntegrationInstanceConfig;
  const Snyk = new SnykClient(config.snykApiKey, config.snykOrgId);
  const service: ServiceEntity = {
    _key: `hackerone:${config.snykOrgId}`,
    _type: SNYK_SERVICE_ENTITY_TYPE,
    _class: ["Service", "Account"],
    displayName: `Snyk Scanner for Bitbucket Projects`,
  };

  //const serviceCodeRepoRelationships: ServiceCodeRepoRelationship[] = [];
  //const codeRepoFindingRelationships: CodeRepoFindingRelationship[] = [];
  const serviceFindingRelationships: ServiceFindingRelationship[] = [];
  const findingVulnerabilityRelationships: FindingVulnerabilityRelationship[] = [];
  const findingCWERelationships: FindingCWERelationship[] = [];
  const serviceEntities: ServiceEntity[] = [service];
  //const codeRepoEntities: CodeRepoEntity[] = [];
  const findingEntities: FindingEntity[] = [];
  //////const findingIds: String[] = [];

  let allProjects: Project[] = (await Snyk.listAllProjects(config.snykOrgId))
    .projects;
  allProjects = allProjects.filter(
    project => project.origin === "bitbucket-cloud",
  );
  allProjects = allProjects.slice(10, 40); // shorten for testing purposes

  for (const project of allProjects) {
    let fullProjectName: string = project.name;
    let piecedName: string[] = fullProjectName.split(":");
    let projectName: string = piecedName[0];
    let packageFileName = piecedName[1];


    const vulnerabilities: Vulnerability[] = (await Snyk.listIssues(
      config.snykOrgId,
      project.id,
      {},
    )).issues.vulnerabilities;
    
    vulnerabilities.forEach((vulnerability: Vulnerability) => {
      const finding: FindingEntity = toFindingEntity(vulnerability);
      finding.targets.push(projectName);
      finding.identifiedInFile = packageFileName
      findingEntities.push(finding);
      serviceFindingRelationships.push(toServiceFindingRelationship(service, finding));

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




      
      /*
      if (findingIds.includes(finding.id) == false) {
        findingIds.push(finding.id);
        findingEntities.push(finding);
      }

      for (let findingInList of findingEntities) {
        if (findingInList.id === finding.id) {
          finding.targets.push(projectName);
          console.log(finding.id + ": " + finding.targets.length);
          finding.identifiedInFile = packageFileName;
          break;
        }
      }
      */

    });

    
    findingEntities.forEach((finding: FindingEntity) => {
      if (finding.targets.length > 1) {
        console.log("GOT EMMMMMM");
      }
    });
    
    


  }

  return persister.publishPersisterOperations(
    await createOperationsFromFindings(
      context,
      serviceEntities,
      //codeRepoEntities,
      findingEntities,
      //serviceCodeRepoRelationships,
      //codeRepoFindingRelationships,
      serviceFindingRelationships, //
      findingVulnerabilityRelationships,
      findingCWERelationships,
    ),
  );
}
