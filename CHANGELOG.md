# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.4.1] - 2022-09-03

### Added

- New properties added to entities:

  | Entity         | Properties              |
  | -------------- | ----------------------- |
  | `snyk_project` | `fullDirectoryPath`     |
  | `snyk_project` | `topLevelDirectoryName` |

### Fixed

- Update Snyk project name parsing to properly extract the top-level directory
  name and the full directory path to the scanned file

## [2.4.0] - 2022-08-15

### Added

- New properties added to entities:

  | Entity         | Properties         |
  | -------------- | ------------------ |
  | `snyk_project` | `repoFullName`     |
  | `snyk_project` | `repoOrganization` |
  | `snyk_project` | `repoName`         |
  | `snyk_project` | `directoryName`    |
  | `snyk_project` | `fileName`         |

## [2.3.0] - 2022-08-12

### Added

- New property added to entity:

  | Entity         | Properties              |
  | -------------- | ----------------------- |
  | `snyk_project` | `environmentAttributes` |

### Added

- New property added to entity:

  | Entity         | Properties |
  | -------------- | ---------- |
  | `snyk_finding` | `fixedIn`  |

### Changed

- Findings are no longer aggregated by vulnerability ID. This change will allow
  the finding entities created in J1 to be in parity with the findings in Snyk

- CWE and CVE entities will be mapped to but we will no longer create these
  entities from within this integration

## [2.2.2] - 2022-07-20

### Added

- New property added to entity:

  | Entity         | Properties         |
  | -------------- | ------------------ |
  | `snyk_finding` | `originalSeverity` |

## [2.2.1] - 2022-07-19

### Fixed

- Create relationship between finding and project even when a finding entity has
  already been seen and created. Findings are being aggregated and only being
  added to the first project it was seen in

## [2.2.0] - 2022-07-19

### Added

- Added debug logs that show a summary of findings that were encountered and
  findings that would be created

- Support for ingesting the following **new** entities:

  | Resources                 | Entity `_type` | Entity `_class` |
  | ------------------------- | -------------- | --------------- |
  | Snyk Project              | `snyk_project` | `Project`       |
  | Snyk Organization Members | `snyk_user`    | `User`          |

- Added support for ingesting the following **new** relationships:

  | Source         | class   | Target         |
  | -------------- | ------- | -------------- |
  | `snyk_account` | **HAS** | `snyk_project` |
  | `snyk_account` | **HAS** | `snyk_user`    |
  | `snyk_project` | **HAS** | `snyk_finding` |

- Added support for ingesting the following **new** mapped relationships:

  | Source         | class     | Target     |
  | -------------- | --------- | ---------- |
  | `snyk_project` | **SCANS** | `CodeRepo` |

- New properties added to entities:

  | Entity         | Properties               |
  | -------------- | ------------------------ |
  | `snyk_account` | `id`                     |
  | `snyk_account` | `name`                   |
  | `snyk_account` | `function`               |
  | `snyk_finding` | `isPinnable`             |
  | `snyk_finding` | `isFixable`              |
  | `snyk_finding` | `isPartiallyFixable`     |
  | `snyk_finding` | `name`                   |
  | `snyk_finding` | `violatedPolicyPublicId` |

### Fixed

- Fix value of `numericSeverity` by converting the string severity value to a
  number

## [2.1.2] - 2022-03-08

### Fixed

- Incorrect mapping of `_type` and `_class` properties for `CVEEntity`

### Added

- Added Snyk integration spec - see `./docs/spec/index.ts`

### Changed

- Isolated `fetch-account` step

## [2.1.1] - 2021-08-23

### Fixed

- Bump `@jupiterone/graph-snyk@^1.1.2` to retry 5xx errors.

## [2.1.0] - 2021-08-19

### Changed

- Use the `/aggregated-issues` endpoint to list issues, which is recommended by
  Snyk, rather than the deprecated `/issues` endpoint.

## 2.0.5 - 2021-08-18

### Fixed

- Automatically retry `503` errors by bumping `@jupiterone/snyk-client`

## 2.0.4 - 2020-06-26

### Fixed

- Removed dupliate CWE/CVE entities.
- Handle no issues on response error.

## 2.0.3 - 2020-06-26

### Fixed

- Add entities to job state. 🤦🏼‍♂️

## 2.0.2 - 2020-06-24

### Changed

- Upgrade to `@jupiterone/integration-sdk-core@2.2.0` etc.

## 2.0.1 - 2020-06-24

### Fixed

- Build action misconfigured, did not match `package.json` so that NPM publish
  would fail with `no such file or directory, open 'dist/package.json'`.

## 2.0.0 - 2020-06-24

Migrated to new integration SDK. 🎉

### Fixed

- Collected data will not be lost in the face of a `504` response from Snyk API,
  a very common occurence.
