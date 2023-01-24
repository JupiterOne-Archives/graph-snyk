export interface SnykFinding {
  id: string;
  issueType: string;
  pkgName: string;
  pkgVersions: string[];
  priorityScore: number;
  priority: Priority;
  issueData: IssueData;
  isPatched: boolean;
  isIgnored: boolean;
  fixInfo?: FixInfo;
  links: Links;
}

export interface FixInfo {
  isUpgradable: boolean;
  isPinnable: boolean;
  isPatchable: boolean;
  isFixable: boolean;
  isPartiallyFixable: boolean;
  fixedIn: string;
  nearestFixedInVersion: string;
}

export interface IssueData {
  id: string;
  title: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  originalSeverity: string;
  description?: string;
  url: string;
  identifiers: { [key: string]: string[] };
  credit: string[];
  exploitMaturity: string;
  semver: Semver;
  publicationTime: Date;
  disclosureTime: Date;
  CVSSv3: string;
  cvssScore: number;
  cvssDetails: CvssDetail[];
  language: string;
  patches: any[];
  nearestFixedInVersion: string;
  violatedPolicyPublicId?: string;
  isMaliciousPackage: boolean;
  path: string;
}

export interface CvssDetail {
  assigner: string;
  severity: string;
  cvssV3Vector: string;
  cvssV3BaseScore: number;
  modificationTime: Date;
}

export interface Semver {
  vulnerable: string[];
}

export interface Links {
  paths: string;
}

export interface Priority {
  score: number;
  factors?: Factor[];
}

export interface Factor {
  name: string;
  description: string;
}
