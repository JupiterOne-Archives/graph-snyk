This can be used to mock the Snyk API responses when testing the integration if
you don't have access to the real API

1. Download the mock server from
   https://github.com/JupiterOne/integrations-mock-server
2. Follow the instructions in the README to set up the mock server (generate
   certs -> set up environment variables in shell)
3. Create a .env with:

```
SNYK_ORG_ID=fd2cef6d-650b-4696-8b8f-aaf443e414bd
SNYK_API_KEY=mock_api_key
SNYK_GROUP_ID=
```

4. Start the server:

From `integrations-mock-server` project

```
yarn start -u https://snyk.io/api/v1/ -c /<path-to-graph-snyk>/mocks/config.json
```

5. Execute the integration `yarn start`
