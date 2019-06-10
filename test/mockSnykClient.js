const project1 = {
  origin: "bitbucket-cloud",
  name: "proj1",
  id: "asdf23aqwervf",
  created: new Date("2016-04-02T04:05:06.000Z"),
  totalDependencies: 3,
  issueCountsBySeverity: { low: 0, medium: 1, high: 2 },
};

const project2 = {
  origin: "something else",
  name: "proj2",
  id: "asdf23asdf",
  totalDependencies: 17,
  issueCountsBySeverity: { low: 17, medium: 0, high: 0 },
};

const project3 = {
  origin: "bitbucket-cloud",
  name: "proj3",
  id: "asdf23asdf",
  created: new Date("2016-02-17T04:05:06.000Z"),
  totalDependencies: 0,
  issueCountsBySeverity: { low: 0, medium: 0, high: 0 },
};

const projArr = [project1, project2, project3];

const snykProjects = {
  projects: projArr,
};

const vuln1 = {
  id: "bad vuln",
  url: "apps.snyk.io/vulnerability/badvuln",
  title: "Not Good",
  type: "vulnerability",
  description: "this vulnerability ruins everything",
  from: ["package1", "package2"],
  package: "random package",
  version: "1.1",
  severity: "medium",
  language: "Python",
  packageManager: "Pip",
  publicationTime: new Date("2016-02-17T04:05:06.000Z"),
  disclosureTime: new Date("2016-02-17T04:05:06.000Z"),
  isUpgradable: false,
  isPatchable: false,
  identifiers: { CVE: [], CWE: ["CWE-400"] },
  cvssScore: 8.0,
  patches: [],
  upgradePath: ["none"],
};

const vuln2 = {
  id: "really bad vuln",
  url: "apps.snyk.io/vulnerability/reallybadvuln",
  title: "Not Good At All",
  type: "vulnerability",
  description: "this vulnerability ruins everything",
  from: ["package12", "package23"],
  package: "random package",
  version: "1.5",
  severity: "high",
  language: "Python",
  packageManager: "Pip",
  publicationTime: new Date("2016-01-17T04:05:06.000Z"),
  disclosureTime: new Date("2017-02-17T04:05:06.000Z"),
  isUpgradable: false,
  isPatchable: false,
  identifiers: { CVE: ["CVE-5000"], CWE: ["CWE-400", "CWE-30"] },
  cvssScore: 9.1,
  patches: [],
  upgradePath: ["none"],
};

const vuln3 = {
  id: "low vuln",
  url: "apps.snyk.io/vulnerability/lowvuln",
  title: "Dont worry",
  type: "vulnerability",
  description: "this vulnerability wont ruin everything",
  from: ["package100"],
  package: "random package",
  version: "1.1",
  severity: "low",
  language: "Python",
  packageManager: "Pip",
  publicationTime: new Date("2016-02-27T04:05:06.000Z"),
  disclosureTime: new Date("2016-02-27T04:05:06.000Z"),
  isUpgradable: false,
  isPatchable: false,
  identifiers: { CVE: [], CWE: ["CWE-200"] },
  cvssScore: 1.0,
  patches: [],
  upgradePath: ["none"],
};

const vulnArr = [vuln1, vuln2, vuln3];

const vulnObj = {
  vulnerabilities: vulnArr,
};

const snykIssues = {
  issues: vulnObj,
};

module.exports = {
  listAllProjects: jest.fn().mockResolvedValue(snykProjects),
  listIssues: jest.fn().mockResolvedValue(snykIssues),
  importProject: jest.fn(),
  verifyAccess: jest.fn(),
};
