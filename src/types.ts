import {
  Entity,
  IntegrationInstanceConfig,
} from '@jupiterone/integration-sdk-core';

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  snykOrgId: string;
  snykApiKey: string;
}

/**
 * A convenience type to communicate properties referenced across
 * steps/converters.
 */
export type FindingEntity = Entity & {
  id: string;
  cve: string[];
  cwe: string[];
  targets: string[];
};

export interface CVEEntity {
  _class: string;
  _key: string;
  _type: string;
  name: string;
  displayName: string;
  cvssScore: number;
  references: string[];
  webLink: string;
  [k: string]: string | string[] | number;
};

export interface CWEEntity {
  _class: string;
  _key: string;
  _type: string;
  name: string;
  displayName: string;
  references: string[];
  webLink: string;
  [k: string]: string | string[];
};

export interface SnykVulnIssue {
  id: string;
  url: string;
  title: string;
  type: string;
  description: string;
  from: string[];
  package: string;
  version: string;
  severity: string;
  language: string;
  packageManager: string;
  publicationTime: Date;
  disclosureTime: Date;
  isUpgradable: string;
  isPatchable: string;
  identifiers: Identifier;
  cvssScore: number;
  patches: Patch[];
  upgradePath: string[];
}

interface Identifier {
  CVE: string[];
  CWE: string[];
}

interface Patch {
  id: string;
  urls: string[];
  version: string;
  comments: string[];
  modificationTime: Date;
}

export interface Project {
  name: string;
  id: string;
  createdOn: Date;
  origin: string;
  totalDependencies: number;
  issueCountsBySeverity: IssueCount;
}

interface IssueCount {
  low: number;
  medium: number;
  high: number;
}
