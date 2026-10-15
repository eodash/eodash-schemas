# eodash-schemas

JSON Schemas and validation tooling for EODash catalog metadata, indicators, collections and auxiliary layers.

## Repository Overview

This repository maintains the schema definitions used across the EODash ecosystem to define and validate STAC catalogs, indicator collections, data collections, and auxiliary layer definitions.

- `catalog/`: Source schema files for catalogs, indicators, collections, and auxiliary layers.
- `race/`: RACE (Rapid Action on Coronavirus and Earth Observation) specific schema extensions (partnerships, providers, resources, themes).

## Scripts

### Build Schemas

```bash
npm run build:schemas
```

### Validate Schemas

Runs Ajv schema validation checks across the definitions:

```bash
npm run validate
```

## Deployed MCP (https://eodash.mcp.eox.at)

The EODash MCP is deployed at `https://eodash.mcp.eox.at`.

The server provides intelligent tooling for AI coding assistants and automated workflows interacting with the EODash ecosystem.

### Relevance to eodash-schemas

- **Catalog Validation**: The MCP tool `validate_catalog_config` directly consumes these schemas in the built versions deployed in the github pages: [collection-schema.json](https://eodash.github.io/eodash-schemas/catalog/collection-schema.json), [indicator-schema.json](https://eodash.github.io/eodash-schemas/catalog/indicator-schema.json) along with domain rules.
- **Rule Verification**: Developers and AI agents modifying schemas can test configurations against the updated schema rules.
- **Reference Examples**: The `find_examples` tool indexes verified collection and indicator configurations conforming to these schemas.

### Client Configuration

To connect an MCP client to the deployed endpoint, add the server configuration:

```json
{
    "mcpServers": {
        "eodash": {
            "url": "https://eodash.mcp.eox.at"
        }
    }
}
```
