import {
  Entity,
  Relationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

import { FindingEntity } from './types';

export const SNYK_SERVICE_ENTITY_TYPE = 'snyk_account';
export const SNYK_FINDING_ENTITY_TYPE = 'snyk_finding';
export const SNYK_CVE_ENTITY_TYPE = 'cve';
export const SNYK_CWE_ENTITY_TYPE = 'cwe';

export const SNYK_SERVICE_SNYK_FINDING_RELATIONSHIP_TYPE =
  'snyk_service_identified_snyk_finding';
export const SNYK_FINDING_CVE_RELATIONSHIP_TYPE = 'snyk_finding_is_cve';
export const SNYK_FINDING_CWE_RELATIONSHIP_TYPE = 'snyk_finding_exploits_cwe';

const CVE_URL_BASE = 'https://nvd.nist.gov/vuln/detail/';

function getTime(time: Date | string): number {
  return new Date(time).getTime();
}

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

export interface Identifier {
  CVE: string[];
  CWE: string[];
}

export interface Patch {
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

export interface IssueCount {
  low: number;
  medium: number;
  high: number;
}

export function createServiceEntity(orgId: string): Entity {
  return {
    _key: `snyk:${orgId}`,
    _type: SNYK_SERVICE_ENTITY_TYPE,
    _class: ['Service', 'Account'],
    category: 'code dependency scan',
    displayName: `snyk/${orgId}`,
  };
}

export function createFindingEntity(vuln: SnykVulnIssue): FindingEntity {
  return {
    _class: 'Finding',
    _key: `snyk-project-finding-${vuln.id}`,
    _type: SNYK_FINDING_ENTITY_TYPE,
    category: 'application',
    score: vuln.cvssScore,
    cvssScore: vuln.cvssScore,
    cwe: vuln.identifiers.CWE,
    cve: vuln.identifiers.CVE,
    description: vuln.description,
    displayName: vuln.title,
    webLink: vuln.url,
    id: vuln.id,
    numericSeverity: vuln.cvssScore,
    severity: vuln.severity,
    from: vuln.from,
    package: vuln.package,
    version: vuln.version,
    language: vuln.language,
    packageManager: vuln.packageManager,
    isUpgradable: vuln.isUpgradable,
    isPatchable: vuln.isPatchable,
    publicationTime: getTime(vuln.publicationTime),
    disclosureTime: getTime(vuln.disclosureTime),
    open: true,
    targets: [],
    type: vuln.type,
    identifiedInFile: '',
  };
}

export function createCVEEntity(cve: string, cvssScore: number): Entity {
  const cveLowerCase = cve.toLowerCase();
  const cveUpperCase = cve.toUpperCase();
  const link = CVE_URL_BASE + cveUpperCase;
  return {
    _class: 'Vulnerability',
    _key: cveLowerCase,
    _type: SNYK_CVE_ENTITY_TYPE,
    name: cveUpperCase,
    displayName: cveUpperCase,
    cvssScore: cvssScore,
    references: [link],
    webLink: link,
  };
}

export function createCWEEntity(cwe: string): Entity {
  const cweLowerCase = cwe.toLowerCase();
  const cweUpperCase = cwe.toUpperCase();
  const link = `https://cwe.mitre.org/data/definitions/${
    cwe.split('-')[1]
  }.html`;
  return {
    _class: 'Weakness',
    _key: cweLowerCase,
    _type: SNYK_CWE_ENTITY_TYPE,
    name: cweUpperCase,
    displayName: cweUpperCase,
    references: [link],
    webLink: link,
  };
}

export function createServiceFindingRelationship(
  service: Entity,
  finding: Entity,
): Relationship {
  return {
    _class: 'IDENTIFIED',
    _key: `${service._key}|identified|${finding._key}`,
    _type: SNYK_SERVICE_SNYK_FINDING_RELATIONSHIP_TYPE,
    _fromEntityKey: service._key,
    _toEntityKey: finding._key,
    displayName: 'IDENTIFIED',
  };
}

export function createFindingVulnerabilityRelationship(
  finding: Entity,
  cve: Entity,
): Relationship {
  return {
    _key: `${finding._key}|is|${cve._key}`,
    _class: 'IS',
    _type: SNYK_FINDING_CVE_RELATIONSHIP_TYPE,
    _mapping: {
      sourceEntityKey: finding._key,
      relationshipDirection: RelationshipDirection.FORWARD,
      targetFilterKeys: [['_type', '_key']],
      targetEntity: cve,
    },
    displayName: 'IS',
  };
}

export function createFindingWeaknessRelationship(
  finding: Entity,
  cwe: Entity,
): Relationship {
  return {
    _key: `${finding._key}|is|${cwe._key}`,
    _class: 'EXPLOITS',
    _type: SNYK_FINDING_CWE_RELATIONSHIP_TYPE,
    _mapping: {
      sourceEntityKey: finding._key,
      relationshipDirection: RelationshipDirection.FORWARD,
      targetFilterKeys: [['_type', '_key']],
      targetEntity: cwe,
    },
    displayName: 'EXPLOITS',
  };
}
