import {
  Entity,
  IntegrationInstanceConfig,
} from '@jupiterone/integration-sdk-core';

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  snykOrgId: string;
  snykApiKey: string;
}

/**
 * A convenience type to communicate properties referenced across
 * steps/converters.
 */
export type FindingEntity = Entity & {
  id: string;
  cve?: string[];
  cwe?: string[];
  targets: string[];
};

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

export interface Project {
  name: string;
  id: string;
  createdOn: Date;
  origin: string;
  totalDependencies: number;
  issueCountsBySeverity: IssueCount;
}

interface IssueCount {
  low: number;
  medium: number;
  high: number;
}
