
import {
  //EntityFromIntegration,
  RelationshipDirection,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  // SNYK_SERVICE_ENTITY_TYPE,
  SNYK_CODEREPO_ENTITY_TYPE,
  SNYK_CODEREPO_FINDING_RELATIONSHIP_TYPE,
  SNYK_SERVICE_CODEREPO_RELATIONSHIP_TYPE,
  SNYK_FINDING_VULNERABILITY_RELATIONSHIP_TYPE,
  SNYK_FINDING_ENTITY_TYPE
} from "./constants";

import {
  CodeRepoEntity,
  CodeRepoFindingRelationship,
  ServiceCodeRepoRelationship,
  FindingVulnerabilityRelationship,
  ServiceEntity,
  FindingEntity
  //VulnerabilityEntity
} from "./types";

import { CVE } from "./util/getCVE";

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
  // semver: thing,
  publicationTime: Date; // string,
  disclosureTime: Date; // string,
  isUpgradable: string;
  isPatchable: string;
  identifiers: Identifier;
  // credit: string[],
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
  modificationTime: Date; // string
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
    origin: project.origin
  };
}

export function toFindingEntity(
  vuln: Vulnerability,
): FindingEntity {
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



/*
export function toVulnerabilityEntity(
  cveId: string,
): VulnerabilityEntity {
  return {
    _key: cveId.toLowerCase(),
    _type: "cve",
    _class: "Vulnerability",
    displayName: cveId.toUpperCase(),
    webLink: `https://nvd.nist.gov/vuln/detail/${cveId}`,
  };
}
*/


export function toVulnerabilityRelationship(
  finding: FindingEntity,
  cve: CVE
): FindingVulnerabilityRelationship {
  return {
    _key: `${finding._key}|is|${cve._key}`,
    _class: "IS",
    _type: SNYK_FINDING_VULNERABILITY_RELATIONSHIP_TYPE,
    _mapping: {
      sourceEntityKey: finding._key,
      relationshipDirection: RelationshipDirection.FORWARD,
      targetFilterKeys: [["_type", "_key"]],
      targetEntity: {
        ...cve,
      }
    },
    displayName: "IS",
  };
}








// ---------------------------------------------------------------------------------------------
/*
import { Account, Device, User } from "./ProviderClient";
import {
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  AccountEntity,
  DEVICE_ENTITY_CLASS,
  DEVICE_ENTITY_TYPE,
  DeviceEntity,
  USER_DEVICE_RELATIONSHIP_CLASS,
  USER_DEVICE_RELATIONSHIP_TYPE,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  UserEntity,
} from "./types";

export function createAccountEntity(data: Account): AccountEntity {
  return {
    _class: ACCOUNT_ENTITY_CLASS,
    _key: `provider-account-${data.id}`,
    _type: ACCOUNT_ENTITY_TYPE,
    accountId: data.id,
    displayName: data.name,
  };
}

export function createUserEntities(data: User[]): UserEntity[] {
  return data.map(d => ({
    _class: USER_ENTITY_CLASS,
    _key: `provider-user-${d.id}`,
    _type: USER_ENTITY_TYPE,
    displayName: `${d.firstName} ${d.lastName}`,
    userId: d.id,
  }));
}

export function createDeviceEntities(data: Device[]): DeviceEntity[] {
  return data.map(d => ({
    _class: DEVICE_ENTITY_CLASS,
    _key: `provider-device-id-${d.id}`,
    _type: DEVICE_ENTITY_TYPE,
    deviceId: d.id,
    displayName: d.manufacturer,
    ownerId: d.ownerId,
  }));
}

export function createAccountRelationships(
  account: AccountEntity,
  entities: EntityFromIntegration[],
  type: string,
) {
  const relationships = [];
  for (const entity of entities) {
    relationships.push(createAccountRelationship(account, entity, type));
  }

  return relationships;
}

export function createAccountRelationship(
  account: AccountEntity,
  entity: EntityFromIntegration,
  type: string,
): RelationshipFromIntegration {
  return {
    _class: "HAS",
    _fromEntityKey: account._key,
    _key: `${account._key}_has_${entity._key}`,
    _toEntityKey: entity._key,
    _type: type,
  };
}

export function createUserDeviceRelationships(
  users: UserEntity[],
  devices: DeviceEntity[],
) {
  const usersById: { [id: string]: UserEntity } = {};
  for (const user of users) {
    usersById[user.userId] = user;
  }

  const relationships = [];
  for (const device of devices) {
    const user = usersById[device.ownerId];
    relationships.push(createUserDeviceRelationship(user, device));
  }

  return relationships;
}

function createUserDeviceRelationship(
  user: UserEntity,
  device: DeviceEntity,
): RelationshipFromIntegration {
  return {
    _class: USER_DEVICE_RELATIONSHIP_CLASS,
    _fromEntityKey: user._key,
    _key: `${user._key}_has_${device._key}`,
    _toEntityKey: device._key,
    _type: USER_DEVICE_RELATIONSHIP_TYPE,
  };
}
*/
