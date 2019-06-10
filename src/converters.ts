import { RelationshipDirection } from "@jupiterone/jupiter-managed-integration-sdk";

import {
  SNYK_CODEREPO_ENTITY_TYPE,
  SNYK_CODEREPO_FINDING_RELATIONSHIP_TYPE,
  SNYK_CVE_ENTITY_TYPE,
  SNYK_CWE_ENTITY_TYPE,
  SNYK_FINDING_CVE_RELATIONSHIP_TYPE,
  SNYK_FINDING_CWE_RELATIONSHIP_TYPE,
  SNYK_FINDING_ENTITY_TYPE,
  SNYK_SERVICE_CODEREPO_RELATIONSHIP_TYPE,
} from "./constants";

import {
  CodeRepoEntity,
  CodeRepoFindingRelationship,
  CVEEntity,
  CWEEntity,
  FindingCWERelationship,
  FindingEntity,
  FindingVulnerabilityRelationship,
  ServiceCodeRepoRelationship,
  ServiceEntity,
} from "./types";

const cveLink = "https://nvd.nist.gov/vuln/detail/";

export interface Vulnerability {
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
  publicationTime: Date; // string,
  disclosureTime: Date; // string,
  isUpgradable: string;
  isPatchable: string;
  identifiers: Identifier;
  // CVSSv3: string,
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
  created: Date; // string,
  origin: string;
  // type: string,
  // readOnly: string,
  // testFrequency: string,
  totalDependencies: number;
  issueCountsBySeverity: IssueCount;
}

export interface IssueCount {
  low: number;
  medium: number;
  high: number;
}

export function toCodeRepoEntity(project: Project): CodeRepoEntity {
  return {
    _class: "CodeRepo",
    _key: `snyk-project-${project.name}`,
    _type: SNYK_CODEREPO_ENTITY_TYPE,
    name: project.name,
    id: project.id,
    created: getTime(project.created),
    totalDependencies: project.totalDependencies,
    low_vulnerabilities: project.issueCountsBySeverity.low,
    medium_vulnerabilities: project.issueCountsBySeverity.medium,
    high_vulnerabilities: project.issueCountsBySeverity.high,
    origin: project.origin,
  };
}

export function toFindingEntity(vuln: Vulnerability): FindingEntity {
  return {
    _class: "Finding",
    _key: `snyk-project-finding-${vuln.id}`,
    _type: SNYK_FINDING_ENTITY_TYPE,
    category: "snyk scan finding",
    cvss: vuln.cvssScore,
    cwe: vuln.identifiers.CWE,
    cve: vuln.identifiers.CVE,
    description: vuln.description,
    displayName: vuln.title,
    webLink: vuln.url,
    id: vuln.id,
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
  };
}

export function toServiceCodeRepoRelationship(
  service: ServiceEntity,
  project: CodeRepoEntity,
): ServiceCodeRepoRelationship {
  return {
    _class: "EVALUATES",
    _key: `${service._key}|evaluates|${project._key}`,
    _type: SNYK_SERVICE_CODEREPO_RELATIONSHIP_TYPE,
    _fromEntityKey: service._key,
    _toEntityKey: project._key,
    displayName: "EVALUATES",
  };
}

export function toCodeRepoFindingRelationship(
  project: CodeRepoEntity,
  find: FindingEntity,
): CodeRepoFindingRelationship {
  return {
    _class: "HAS",
    _key: `${project._key}|has|${find._key}`,
    _type: SNYK_CODEREPO_FINDING_RELATIONSHIP_TYPE,
    _fromEntityKey: project._key,
    _toEntityKey: find._key,
    displayName: "HAS",
  };
}

function getTime(time: Date | string | undefined | null): number | undefined {
  return time ? new Date(time).getTime() : undefined;
}

export function toCVEEntities(vuln: Vulnerability): CVEEntity[] {
  const cveEntities: CVEEntity[] = [];

  for (const cve of vuln.identifiers.CVE) {
    const cveLowerCase = cve.toLowerCase();
    const cveUpperCase = cve.toUpperCase();
    const link = cveLink + cveUpperCase;
    cveEntities.push({
      _class: "Vulnerability",
      _key: cveLowerCase,
      _type: SNYK_CVE_ENTITY_TYPE,
      name: cveUpperCase,
      displayName: cveUpperCase,
      references: [link],
      webLink: link,
    });
  }

  return cveEntities;
}

export function toCWEEntities(vuln: Vulnerability): CWEEntity[] {
  const cweEntities: CWEEntity[] = [];

  for (const cwe of vuln.identifiers.CWE) {
    const cweLowerCase = cwe.toLowerCase();
    const cweUpperCase = cwe.toUpperCase();
    const link = `https://capec.mitre.org/data/definitions/${
      cwe.split("-")[1]
    }.html`;
    cweEntities.push({
      _class: "Weakness",
      _key: cweLowerCase,
      _type: SNYK_CWE_ENTITY_TYPE,
      name: cweUpperCase,
      displayName: cweUpperCase,
      references: [link],
      webLink: link,
    });
  }

  return cweEntities;
}

export function toFindingVulnerabilityRelationship(
  finding: FindingEntity,
  cve: CVEEntity,
): FindingVulnerabilityRelationship {
  return {
    _key: `${finding._key}|is|${cve._key}`,
    _class: "IS",
    _type: SNYK_FINDING_CVE_RELATIONSHIP_TYPE,
    _mapping: {
      sourceEntityKey: finding._key,
      relationshipDirection: RelationshipDirection.FORWARD,
      targetFilterKeys: [["_type", "_key"]],
      targetEntity: { ...cve },
    },
    displayName: "IS",
  };
}

export function toFindingWeaknessRelationship(
  finding: FindingEntity,
  cwe: CWEEntity,
): FindingCWERelationship {
  return {
    _key: `${finding._key}|is|${cwe._key}`,
    _class: "EXPLOITS",
    _type: SNYK_FINDING_CWE_RELATIONSHIP_TYPE,
    _mapping: {
      sourceEntityKey: finding._key,
      relationshipDirection: RelationshipDirection.FORWARD,
      targetFilterKeys: [["_type", "_key"]],
      targetEntity: { ...cwe },
    },
    displayName: "EXPLOITS",
  };
}
