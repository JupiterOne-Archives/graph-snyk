import { RelationshipDirection } from "@jupiterone/jupiter-managed-integration-sdk";
import {
  SNYK_CVE_ENTITY_TYPE,
  SNYK_CWE_ENTITY_TYPE,
  SNYK_FINDING_CVE_RELATIONSHIP_TYPE,
  SNYK_FINDING_CWE_RELATIONSHIP_TYPE,
  SNYK_FINDING_ENTITY_TYPE,
  SNYK_SERVICE_SNYK_FINDING_RELATIONSHIP_TYPE,
} from "./constants";
import {
  CVEEntity,
  CWEEntity,
  FindingCWERelationship,
  FindingEntity,
  FindingVulnerabilityRelationship,
  ServiceEntity,
  ServiceFindingRelationship,
} from "./types";

const cveLink = "https://nvd.nist.gov/vuln/detail/";

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

export function toFindingEntity(vuln: SnykVulnIssue): FindingEntity {
  return {
    _class: "Finding",
    _key: `snyk-project-finding-${vuln.id}`,
    _type: SNYK_FINDING_ENTITY_TYPE,
    category: "application",
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
    open: true,
    targets: [],
    type: vuln.type,
    identifiedInFile: "",
  };
}

export function toCVEEntities(finding: FindingEntity): CVEEntity[] {
  const cveEntities: CVEEntity[] = [];

  for (const cve of finding.cve) {
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

export function toCWEEntities(finding: FindingEntity): CWEEntity[] {
  const cweEntities: CWEEntity[] = [];

  for (const cwe of finding.cwe) {
    const cweLowerCase = cwe.toLowerCase();
    const cweUpperCase = cwe.toUpperCase();
    const link = `https://cwe.mitre.org/data/definitions/${
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

export function toServiceFindingRelationship(
  service: ServiceEntity,
  finding: FindingEntity,
): ServiceFindingRelationship {
  return {
    _class: "IDENTIFIED",
    _key: `${service._key}|identified|${finding._key}`,
    _type: SNYK_SERVICE_SNYK_FINDING_RELATIONSHIP_TYPE,
    _fromEntityKey: service._key,
    _toEntityKey: finding._key,
    displayName: "IDENTIFIED",
  };
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
      targetEntity: cve as any,
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
      targetEntity: cwe as any,
    },
    displayName: "EXPLOITS",
  };
}
