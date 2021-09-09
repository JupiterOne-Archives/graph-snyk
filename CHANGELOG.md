# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added Snyk integration spec - see `./docs/spec/index.ts`

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
