import {
  createIntegrationEntity,
  Entity,
  IntegrationLogger,
  parseTimePropertyValue,
  Relationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { Entities, mappedRelationships, Relationships } from '../../constants';
import { Priority, SnykFinding } from '../../types/finding';

import { AggregatedIssue, CVEEntity, CWEEntity } from '../../types/types';

import { deconstructDesc } from '../../util/deconstructDesc';

const CVE_URL_BASE = 'https://nvd.nist.gov/vuln/detail/';

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

function factorSeverityToDisplaySeverity(sev: string) {
  // We expect data to look like:
  // 'Low severity'
  const lowerSev = sev.toLowerCase().split(' ');
  if (lowerSev.length >= 1) {
    if (lowerSev[0] === 'low') return 'low';
    if (lowerSev[0] === 'medium') return 'medium';
    if (lowerSev[0] === 'high') return 'high';
    if (lowerSev[0] === 'critical') return 'critical';
  }
  return undefined;
}

function getSeverityFromPriorities(s: Priority | undefined) {
  for (const factor of s?.factors ?? []) {
    if (factor.name === 'severity') {
      return factorSeverityToDisplaySeverity(factor.description);
    }
  }
  return undefined;
}

export function createFindingEntity(
  projectId: string,
  vuln: SnykFinding,
  projectEntity: Entity,
  logger: IntegrationLogger,
) {
  const targets = projectEntity.repoName
    ? [projectEntity.repoName as string]
    : [];

  // TODO: severity calculation can be cleaned up and simplified. This is here for
  // debugging purposes.
  let severity = getSeverityFromPriorities(vuln.priority);
  if (severity) {
    logger.info({}, 'Got severity from priorities');
  } else {
    logger.info({}, 'Was not able to get severity from priorities');
    severity = vuln.issueData.severity;
  }

  const numericSeverity = getNumericSeverityFromIssueSeverity(severity as any);

  return createIntegrationEntity({
    entityData: {
      source: vuln,
      assign: {
        _class: Entities.SNYK_FINDING._class,
        _key: `snyk-project-${projectId}-vuln-${vuln.id}`,
        _type: Entities.SNYK_FINDING._type,
        category: 'application',
        score: vuln.issueData.cvssScore || undefined,
        cvssScore: vuln.issueData.cvssScore,
        cwe: vuln.issueData.identifiers?.CWE,
        cve: vuln.issueData.identifiers?.CVE,
        name: vuln.issueData.title,
        displayName: vuln.pkgName,
        webLink: vuln.issueData.url,
        id: vuln.id,
        numericSeverity,
        severity,
        originalSeverity: vuln.issueData.originalSeverity,
        pkgName: vuln.pkgName,
        pkgVersions: vuln.pkgVersions,
        language: vuln.issueData.language,
        isUpgradable: vuln.fixInfo?.isUpgradable,
        isPatchable: vuln.fixInfo?.isPatchable,
        isPinnable: vuln.fixInfo?.isPinnable,
        isFixable: vuln.fixInfo?.isFixable,
        isPartiallyFixable: vuln.fixInfo?.isPartiallyFixable,
        fixedIn: vuln.fixInfo?.fixedIn,

        publicationTime: parseTimePropertyValue(vuln.issueData.publicationTime),
        disclosureTime: parseTimePropertyValue(vuln.issueData.disclosureTime),
        open: true,
        targets,
        issueType: vuln.issueType,
        identifiedInFile: '',

        priorityScore: vuln.priorityScore,
        exploitMaturity: vuln.issueData.exploitMaturity,
        nearestFixedInVersion: vuln.issueData.nearestFixedInVersion,
        isMaliciousPackage: vuln.issueData.isMaliciousPackage,
        isPatched: vuln.isPatched,
        isIgnored: vuln.isIgnored,
        violatedPolicyPublicId: vuln.issueData.violatedPolicyPublicId,

        path: vuln.issueData.path,
        ...deconstructDesc({ desc: vuln.issueData.description }),
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

export function createOrganizationFindingRelationship(
  organization: Entity,
  finding: Entity,
): Relationship {
  return {
    _class: 'IDENTIFIED',
    _key: `${organization._key}|identified|${finding._key}`,
    _type: Relationships.ORGANIZATION_IDENTIFIED_FINDING._type,
    _fromEntityKey: organization._key,
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
    _type: mappedRelationships.FINDING_IS_CVE._type,
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
    _type: mappedRelationships.FINDING_EXPLOITS_CWE._type,
    _mapping: {
      sourceEntityKey: finding._key,
      relationshipDirection: RelationshipDirection.FORWARD,
      targetFilterKeys: [['_type', '_key']],
      targetEntity: cwe,
    },
    displayName: 'EXPLOITS',
  };
}
