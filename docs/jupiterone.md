# Integration with JupiterOne

## Snyk + JupiterOne Integration Benefits

- Visualize Snyk code repositories and findings in the JupiterOne graph.
- Monitor Snyk findings within the alerts app.
- Monitor changes to Snyk code repositories using JupiterOne
  alerts.

## How it Works

- JupiterOne periodically fetches Snyk repositories and findings to update the graph.
- Write JupiterOne queries to review and monitor updates to the graph.
- Configure alerts to reduce the noise of findings.
- Configure alerts to take action when the JupiterOne graph changes.

## Requirements

- JupiterOne requires the organization id where your Snyk projects reside as well as the 
API Key configured to authenticate with Snyk.
- You must have permission in JupiterOne to install new integrations.

## Overview

JupiterOne provides a managed integration with Snyk. The integration connects
directly to Snyk APIs to obtain account metadata and analyze resource
relationships. Customers authorize access by creating an API token in their
target Snyk account and providing that credential to JupiterOne.

## Integration Instance Configuration

The integration is triggered by an event containing the information for a
specific integration instance.

The integration instance configurations requires the following two parameters:

- **Snyk API Key** (`snykApiKey`) In Snyk: In the upper right hand corner mouse
  over your account name, where a drop down will appear. Click on
  `account settings` and your API token will appear in a hidden form in the
  middle of the page. Click show and copy your key.

- **Snyk Organisation ID** (`snykOrgId`) In Snyk: Go to the dashboard. Click on
  `manage organisation` on the far right of the screen across from `Dashboard`.
  Here, your organisation ID is displayed.

## Entities

The following entity resources are ingested when the integration runs:

| Entity Resource | \_type : \_class of the Entity |
| --------------- | ------------------------------ |
| Snyk Scanner    | `snyk_scan`:`Service`          |
| Project         | `code_repo` : `CodeRepo`       |
| Finding         | `snyk_finding` : `Finding`     |

## Relationships

The following relationships are created/mapped:

| From           | Type          | To             |
| -------------- | ------------- | -------------- |
| `snyk_scan`    | **EVALUATES** | `code_repo`    |
| `code_repo`    | **HAS**       | `snyk_finding` |
| `snyk_finding` | **IS**        | `cve`          |
| `snyk_finding` | **EXPLOITS**  | `cwe`          |
