import { Entity } from '@jupiterone/integration-sdk-core';

/**
 * A convenience type to communicate properties referenced across
 * steps/converters.
 */
export type FindingEntity = Entity & {
  id: string;
  cve?: string[];
  cwe?: string[];
  targets: string[];
  score: number;
};

export interface CVEEntity {
  _class: string | string[];
  _key: string;
  _type: string;
  name: string;
  displayName: string;
  cvssScore: string | number;
  references: string[];
  webLink: string;
  [k: string]: string | string[] | number;
}

export interface CWEEntity {
  _class: string | string[];
  _key: string;
  _type: string;
  name: string;
  displayName: string;
  references: string[];
  webLink: string;
  [k: string]: string | string[];
}

/**
 * These properties were manually written based on Snyk API docs.
 * See https://snyk.docs.apiary.io/#reference/projects/aggregated-project-issues/list-all-aggregated-issues
 */
export interface AggregatedIssue {
  id: string;
  issueType: 'vuln' | 'license';
  pkgName: string;
  pkgVersions: string[];
  issueData: {
    id: string;
    title: string;
    severity: string;
    originalSeverity: string;
    url: string;
    description?: string;
    identifiers?: {
      CVE?: string[];
      CWE?: string[];
      OSVDB?: string[];
    };
    credit?: string[];
    exploitMaturity: string;
    semver?: {
      vulnerable?: string;
      unaffected?: string;
    };
    publicationTime?: string;
    disclosureTime?: string;
    CVSSv3?: string;
    cvssScore?: string;
    language?: string;
    patches?: {
      id?: string;
      urls?: string[];
      version?: string;
      comments?: string[];
      modificationTime?: string;
    }[];
    nearestFixedInVersion?: string;
  };
  introducedThrough?: {
    kind: string;
    data: any;
  }[];
  isPatched: boolean;
  isIgnored: boolean;
  ignoreReasons?: {
    reason?: string;
    expires?: string;
    source?: 'cli' | 'api' | string;
  }[];
  fixInfo?: {
    isUpgradable?: boolean;
    isPinnable?: boolean;
    isPatchable?: boolean;
    isPartiallyFixable?: boolean;
    nearestFixedInVersion?: string;
    fixedIn?: string[];
  };
  priority?: {
    score?: number;
    factors?: {
      name?: string;
      description?: string;
    }[];
  };
  links?: {
    paths?: string;
  };
}

export interface Group {
  id: string;
  name: string;
  url: string;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  url?: string;
  created?: string;
}

export interface Project {
  id: string;
  name: string;
  created: string;
  origin: string;
  type: string;
  readOnly: boolean;
  testFrequency: string;
  isMonitored: boolean;
  totalDependencies: number;
  issueCountsBySeverity: {
    low: number;
    high: number;
    medium: number;
    critical: number;
  };
  imageTag: string;
  imagePlatform: string;
  imageBaseImage: string;
  lastTestedDate: string;
  browseUrl: string;
  owner: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
  importingUser: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
  tags: {
    key: string;
    value: string;
  }[];
  branch: string;
  targetReference: string;
}

export interface Role {
  name: string;
  description?: string;
  publicId?: string;
  created?: string;
  modified?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

export interface Account {
  id: string;
  name: string;
  description: string | undefined;
}

export interface Service {
  name: string;
}
