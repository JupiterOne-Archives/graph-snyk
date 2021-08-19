import {
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

export const SetDataKeys = {
  ACCOUNT_ENTITY: 'ACCOUNT_ENTITY',
};

export const StepIds = {
  FETCH_ACCOUNT: 'fetch-account',
  FETCH_FINDINGS: 'fetch-findings',
  BUILD_FINDING_CVE_CWE_RELATIONSHIPS: 'build-issue-cve-cwe-relationships',
};

export const Entities = {
  SNYK_ACCOUNT: {
    _type: 'snyk_account',
    _class: ['Service', 'Account'],
    resourceName: 'Snyk Account',
  },
  SNYK_FINDING: {
    _type: 'snyk_finding',
    _class: 'Finding',
    resourceName: 'Snyk Issue',
  },
};

export const TargetEntities = {
  CVE: {
    _type: 'cve',
    _class: 'Vulnerability',
    resourceName: 'CVE',
  },
  CWE: {
    _type: 'cwe',
    _class: 'Weakness',
    resourceName: 'CWE',
  },
};

export const Relationships = {
  SERVICE_IDENTIFIED_FINDING: {
    _type: 'snyk_service_identified_snyk_finding',
    sourceType: Entities.SNYK_ACCOUNT._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: Entities.SNYK_FINDING._type,
  },
};

export const MappedRelationships = {
  FINDING_IS_CVE: {
    _type: 'snyk_finding_is_cve',
    sourceType: Entities.SNYK_FINDING._type,
    _class: RelationshipClass.IS,
    targetType: TargetEntities.CVE._type,
    direction: RelationshipDirection.FORWARD,
  },
  FINDING_EXPLOITS_CWE: {
    _type: 'snyk_finding_exploits_cwe',
    sourceType: Entities.SNYK_FINDING._type,
    _class: RelationshipClass.EXPLOITS,
    targetType: TargetEntities.CWE._type,
    direction: RelationshipDirection.FORWARD,
  },
};
