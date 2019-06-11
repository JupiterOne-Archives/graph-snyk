# Snyk

## Overview

JupiterOne provides a managed integration with Snyk. The integration connects
directly to Snyk APIs to obtain account metadata and analyze resource
relationships. Customers authorize access by creating an API token in their
target Snyk account and providing that credential to JupiterOne.

## Integration Instance Configuration

The integration is triggered by an event containing the information for a
specific integration instance.

Snyk provides [detailed instructions on creating an API token][1] within your
Snyk account.

## Entities

The following entity resources are ingested when the integration runs:

| Entity Resource | \_type : \_class of the Entity |
| --------------- | ------------------------------ |
| Scanner         | `snyk_scan`:`Service`          |
| Project         | `code_repo` : `CodeRepo`       |
| Finding         | `snyk_finding` : `Finding`     |

## Relationships

The following relationships are created/mapped:

| From        | Type          | To             |
| ----------- | ------------- | -------------- |
| `snyk_scan` | **EVALUATES** | `code_repo`    |
| `code_repo` | **HAS**       | `snyk_finding` |

[1]: https://jupiterone.io/
