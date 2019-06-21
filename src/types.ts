import {
  EntityFromIntegration,
  MappedRelationshipFromIntegration,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { PersistedObjectAssignable } from "@jupiterone/jupiter-managed-integration-sdk/jupiter-types";

export interface SnykIntegrationInstanceConfig {
  snykApiKey: string;
  snykOrgId: string;
}

export interface ServiceEntity extends EntityFromIntegration {
  category: string;
}

export interface FindingEntity extends EntityFromIntegration {
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
  publicationTime?: number;
  disclosureTime?: number;
  open: boolean;
  targets: string[];
  identifiedInFile: string;
}

export interface CVEEntity extends PersistedObjectAssignable {
  name: string;
  references: string[];
}

export interface CWEEntity extends PersistedObjectAssignable {
  name: string;
  references: string[];
}

export type ServiceFindingRelationship = RelationshipFromIntegration;

export type FindingVulnerabilityRelationship = MappedRelationshipFromIntegration;

export type FindingCWERelationship = MappedRelationshipFromIntegration;
