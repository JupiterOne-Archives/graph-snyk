import { PersistedObjectAssignable } from "@jupiterone/jupiter-managed-integration-sdk/jupiter-types";

const cveLink = "https://nvd.nist.gov/vuln/detail/";

export interface CVEProperties {
  severity?: string;
  vendor?: string;
  package?: string;
  product?: string;
  version?: string;
  vector?: string;
  findings?: string | string[];
  CVSSv3Score?: number;
  CVSSv3Vector?: number;
  CVSSv2Score?: number;
  CVSSv2Vector?: number;
  references?: string[];
  targets?: string[];
}

export interface CVE extends PersistedObjectAssignable, CVEProperties {
  _class: "Vulnerability";
  _type: "cve";
  name: string;
}

export function getCVE(
  cveNumber: string,
  properties?: CVEProperties,
): CVE {
  const cveLowerCase = cveNumber.toLowerCase();
  const cveUpperCase = cveNumber.toUpperCase();
  return {
    ...properties,
    _class: "Vulnerability",
    _key: cveLowerCase,
    _type: "cve",
    name: cveUpperCase,
    displayName: cveUpperCase,
    webLink: cveLink + cveUpperCase,
  };
}

