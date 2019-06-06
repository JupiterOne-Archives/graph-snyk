import {
  EntityFromIntegration,
  RelationshipFromIntegration,
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
}

export interface VulnerabilityEntity extends EntityFromIntegration {
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

export type CodeRepoVulnerabilityRelationship = RelationshipFromIntegration;

export interface SnykIntegrationInstanceConfig {
  SnykApiKey: string;
  SnykOrgId: string;
}
