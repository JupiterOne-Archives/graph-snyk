import {
  Entity,
  parseTimePropertyValue,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { Entities, Relationships } from './constants';

import { AggregatedIssue, FindingEntity } from './types';

export function createServiceEntity(orgId: string): Entity {
  return {
    _key: `snyk:${orgId}`,
    _type: Entities.SNYK_ACCOUNT._type,
    _class: Entities.SNYK_ACCOUNT._class,
    category: 'code dependency scan',
    displayName: `snyk/${orgId}`,
  };
}

export function createFindingEntity(vuln: AggregatedIssue): FindingEntity {
  return {
    _class: Entities.SNYK_FINDING._class,
    _key: `snyk-project-finding-${vuln.id}`,
    _type: Entities.SNYK_FINDING._type,
    category: 'application',
    score: vuln.issueData.cvssScore,
    cvssScore: vuln.issueData.cvssScore,
    cwe: vuln.issueData.identifiers?.CWE,
    cve: vuln.issueData.identifiers?.CVE,
    description: vuln.issueData.description,
    displayName: vuln.issueData.title,
    webLink: vuln.issueData.url,
    id: vuln.id,
    numericSeverity: vuln.issueData.cvssScore,
    severity: vuln.issueData.severity,
    pkgName: vuln.pkgName,
    pkgVersions: vuln.pkgVersions,
    language: vuln.issueData.language,
    isUpgradable: vuln.fixInfo?.isUpgradable,
    isPatchable: vuln.fixInfo?.isPatchable,
    publicationTime: parseTimePropertyValue(vuln.issueData.publicationTime),
    disclosureTime: parseTimePropertyValue(vuln.issueData.disclosureTime),
    open: true,
    targets: [],
    issueType: vuln.issueType,
    identifiedInFile: '',
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
