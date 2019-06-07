import {
  EntityFromIntegration,
  RelationshipFromIntegration,
  //MappedRelationshipFromIntegration
  // GraphClient,
  // IntegrationExecutionContext,
  // PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

export interface ServiceEntity extends EntityFromIntegration {
  category: string;
  handle: string;
}

export interface CodeRepoEntity extends EntityFromIntegration {
  name: string;
  id: string;
  created?: number; // string,
  totalDependencies: number;
  low_vulnerabilities: number;
  medium_vulnerabilities: number;
  high_vulnerabilities: number;
  origin: string
}

export interface FindingEntity extends EntityFromIntegration {
  // patches: Patch[], upgradePath: string[]??
  category: string;
  cvss: number;
  cwe: string[];
  cve: string[];
  description: string;
  displayName: string;
  webLink: string;
  id: string;
  severity: string;
  from: string[];
  package: string;
  version: string;
  language: string;
  packageManager: string;
  isUpgradable: string;
  isPatchable: string;
  publicationTime?: number; // string,
  disclosureTime?: number; // string
}

export type ServiceCodeRepoRelationship = RelationshipFromIntegration;

export type CodeRepoFindingRelationship = RelationshipFromIntegration;

export interface SnykIntegrationInstanceConfig {
  SnykApiKey: string;
  SnykOrgId: string;
}

/*
export interface VulnerabilityEntity extends EntityFromIntegration {
  name?: string;
  description?: string;
}
*/

export type FindingVulnerabilityRelationship = RelationshipFromIntegration; //MappedRelationshipFromIntegration;
