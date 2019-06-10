import {
  EntityFromIntegration,
  RelationshipFromIntegration,
  MappedRelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { PersistedObjectAssignable } from "@jupiterone/jupiter-managed-integration-sdk/jupiter-types";

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

export interface CVEEntity extends PersistedObjectAssignable {
  name: string;
  references: string[];
}

export interface CWEEntity extends PersistedObjectAssignable {
  name: string;
  references: string[];
}


export type FindingVulnerabilityRelationship = MappedRelationshipFromIntegration;

export type FindingCWERelationship = MappedRelationshipFromIntegration;