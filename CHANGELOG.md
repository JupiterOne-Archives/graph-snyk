# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 2.0.1 - 2020-06-24

### Fixed

- Build action misconfigured, did not match `package.json` so that NPM publish
  would fail with `no such file or directory, open 'dist/package.json'`.

## 2.0.0 - 2020-06-24

Migrated to new integration SDK. 🎉

### Fixed

- Collected data will not be lost in the face of a `504` response from Snyk API,
  a very common occurence.