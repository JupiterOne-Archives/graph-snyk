import { RelationshipClass } from '@jupiterone/integration-sdk-core';

export const Entities = {
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

export const Relationships = {
  FINDING_IS_CVE: {
    _type: 'snyk_finding_is_cve',
    sourceType: Entities.SNYK_FINDING._type,
    _class: RelationshipClass.IS,
    targetType: Entities.CVE._type,
  },
  FINDING_EXPLOITS_CWE: {
    _type: 'snyk_finding_exploits_cwe',
    sourceType: Entities.SNYK_FINDING._type,
    _class: RelationshipClass.EXPLOITS,
    targetType: Entities.CWE._type,
  },
  SERVICE_IDENTIFIED_FINDING: {
    _type: 'snyk_service_identified_snyk_finding',
    sourceType: Entities.SNYK_ACCOUNT._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: Entities.SNYK_FINDING._type,
  },
};
