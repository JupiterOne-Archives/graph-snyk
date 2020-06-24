import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk-core';

const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  snykOrgId: {
    type: 'string',
  },
  snykApiKey: {
    type: 'string',
    mask: true,
  },
};

export default instanceConfigFields;
