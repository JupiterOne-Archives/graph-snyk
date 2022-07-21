import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
  Relationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { Entities, Relationships } from './constants';

import { CVEEntity, CWEEntity } from './types';

const CVE_URL_BASE = 'https://nvd.nist.gov/vuln/detail/';

export function createServiceEntity(orgId: string, orgName?: string): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _key: `snyk:${orgId}`,
        _type: Entities.SNYK_ACCOUNT._type,
        _class: Entities.SNYK_ACCOUNT._class,
        id: orgId,
        category: ['security'],
        name: orgName,
        displayName: orgName || `snyk/${orgId}`,
        function: ['scanning'],
      },
    },
  });
}

const SEVERITY_TO_NUMERIC_SEVERITY_MAP = new Map<string, number>([
  ['low', 2],
  ['medium', 5],
  ['high', 7],
  ['critical', 10],
]);

export function getNumericSeverityFromIssueSeverity(
  issueSeverity?: 'low' | 'medium' | 'high' | 'critical',
): number {
  if (!issueSeverity) return 0;

  const numericSeverity = SEVERITY_TO_NUMERIC_SEVERITY_MAP.get(issueSeverity);
  return numericSeverity === undefined ? 0 : numericSeverity;
}

export function createFindingEntity(vuln: any) {
  return createIntegrationEntity({
    entityData: {
      source: vuln,
      assign: {
        _class: Entities.SNYK_FINDING._class,
        _key: `snyk-project-${vuln.projectId}-vuln-${vuln.id}`,
        _type: Entities.SNYK_FINDING._type,
        category: 'application',
        score: vuln.issueData.cvssScore || undefined,
        cvssScore: vuln.issueData.cvssScore,
        cwe: vuln.issueData.identifiers?.CWE,
        cve: vuln.issueData.identifiers?.CVE,
        description: vuln.issueData.description,
        name: vuln.issueData.title,
        displayName: vuln.issueData.title,
        webLink: vuln.issueData.url,
        id: vuln.id,
        numericSeverity: getNumericSeverityFromIssueSeverity(
          vuln.issueData.severity,
        ),
        severity: vuln.issueData.severity, // Severity after policies have been applied
        originalSeverity: vuln.issueData.originalSeverity, // Severity as seen in snyk DB, before policies have been applied
        pkgName: vuln.pkgName,
        pkgVersions: vuln.pkgVersions,
        language: vuln.issueData.language,
        isUpgradable: vuln.fixInfo?.isUpgradable,
        isPatchable: vuln.fixInfo?.isPatchable,
        isPinnable: vuln.fixInfo?.isPinnable,
        isFixable: vuln.fixInfo?.isFixable,
        isPartiallyFixable: vuln.fixInfo?.isPartiallyFixable,

        publicationTime: parseTimePropertyValue(vuln.issueData.publicationTime),
        disclosureTime: parseTimePropertyValue(vuln.issueData.disclosureTime),
        open: true,
        targets: [],
        issueType: vuln.issueType,
        identifiedInFile: '',

        priorityScore: vuln.priorityScore,
        exploitMaturity: vuln.exploitMaturity,
        nearestFixedInVersion: vuln.nearestFixedInVersion,
        isMaliciousPackage: vuln.isMaliciousPackage,
        isPatched: vuln.isPatched,
        isIgnored: vuln.isIgnored,
        violatedPolicyPublicId: vuln.issueData.violatedPolicyPublicId,

        path: vuln.issueData.path,
      },
    },
  });
}

export function createCVEEntity(
  cve: string,
  cvssScore: number | string,
): CVEEntity {
  const cveLowerCase = cve.toLowerCase();
  const cveUpperCase = cve.toUpperCase();
  const link = CVE_URL_BASE + cveUpperCase;
  return {
    _class: Entities.CVE._class,
    _key: cveLowerCase,
    _type: Entities.CVE._type,
    name: cveUpperCase,
    displayName: cveUpperCase,
    cvssScore: cvssScore,
    references: [link],
    webLink: link,
  };
}

export function createCWEEntity(cwe: string): CWEEntity {
  const cweLowerCase = cwe.toLowerCase();
  const cweUpperCase = cwe.toUpperCase();
  const link = `https://cwe.mitre.org/data/definitions/${
    cwe.split('-')[1]
  }.html`;
  return {
    _class: Entities.CWE._class,
    _key: cweLowerCase,
    _type: Entities.CWE._type,
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
    _type: Relationships.SERVICE_IDENTIFIED_FINDING._type,
    _fromEntityKey: service._key,
    _toEntityKey: finding._key,
    displayName: 'IDENTIFIED',
  };
}

export function createFindingVulnerabilityRelationship(
  finding: Entity,
  cve: CVEEntity,
): Relationship {
  return {
    _key: `${finding._key}|is|${cve._key}`,
    _class: 'IS',
    _type: Relationships.FINDING_IS_CVE._type,
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
  cwe: CWEEntity,
): Relationship {
  return {
    _key: `${finding._key}|is|${cwe._key}`,
    _class: 'EXPLOITS',
    _type: Relationships.FINDING_EXPLOITS_CWE._type,
    _mapping: {
      sourceEntityKey: finding._key,
      relationshipDirection: RelationshipDirection.FORWARD,
      targetFilterKeys: [['_type', '_key']],
      targetEntity: cwe,
    },
    displayName: 'EXPLOITS',
  };
}
