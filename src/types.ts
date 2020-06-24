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
  cve: string[];
  cwe: string[];
  targets: string[];
};
