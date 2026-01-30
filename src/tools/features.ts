/**
 * Feature and Schema Tools
 *
 * MCP tools for Okta feature management and user schema customization.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register all feature and schema-related tools
 */
export function registerFeatureTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List Features
  // ===========================================================================
  server.tool(
    'okta_list_features',
    `List all self-service features and their status.

Returns:
  Array of features with their status.`,
    {},
    async () => {
      try {
        const features = await client.listFeatures();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ features, count: features.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Feature
  // ===========================================================================
  server.tool(
    'okta_get_feature',
    `Get a feature by ID.

Args:
  - featureId: Feature ID

Returns:
  The feature record.`,
    {
      featureId: z.string().describe('Feature ID'),
    },
    async ({ featureId }) => {
      try {
        const feature = await client.getFeature(featureId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(feature, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Enable/Disable Feature
  // ===========================================================================
  server.tool(
    'okta_enable_feature',
    `Enable a self-service feature.

Args:
  - featureId: Feature ID

Returns:
  The enabled feature.`,
    {
      featureId: z.string().describe('Feature ID'),
    },
    async ({ featureId }) => {
      try {
        const feature = await client.updateFeatureLifecycle(featureId, 'enable');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Feature enabled', feature }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_disable_feature',
    `Disable a self-service feature.

Args:
  - featureId: Feature ID

Returns:
  The disabled feature.`,
    {
      featureId: z.string().describe('Feature ID'),
    },
    async ({ featureId }) => {
      try {
        const feature = await client.updateFeatureLifecycle(featureId, 'disable');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Feature disabled', feature }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Linked Objects
  // ===========================================================================
  server.tool(
    'okta_list_linked_object_definitions',
    `List all linked object definitions (user relationships).

Returns:
  Array of linked object definitions.`,
    {},
    async () => {
      try {
        const definitions = await client.listLinkedObjectDefinitions();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ definitions, count: definitions.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_get_linked_object_definition',
    `Get a linked object definition by name.

Args:
  - linkedObjectName: Linked object name (primary relationship name)

Returns:
  The linked object definition.`,
    {
      linkedObjectName: z.string().describe('Linked object name'),
    },
    async ({ linkedObjectName }) => {
      try {
        const definition = await client.getLinkedObjectDefinition(linkedObjectName);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(definition, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_create_linked_object_definition',
    `Create a linked object definition for user relationships.

Args:
  - primaryName: Primary relationship name (e.g., "manager")
  - primaryTitle: Primary display title
  - primaryDescription: Primary description
  - associatedName: Associated relationship name (e.g., "directReports")
  - associatedTitle: Associated display title
  - associatedDescription: Associated description

Returns:
  The created linked object definition.`,
    {
      primaryName: z.string().describe('Primary relationship name'),
      primaryTitle: z.string().describe('Primary display title'),
      primaryDescription: z.string().describe('Primary description'),
      associatedName: z.string().describe('Associated relationship name'),
      associatedTitle: z.string().describe('Associated display title'),
      associatedDescription: z.string().describe('Associated description'),
    },
    async ({ primaryName, primaryTitle, primaryDescription, associatedName, associatedTitle, associatedDescription }) => {
      try {
        const definition = await client.createLinkedObjectDefinition(
          { name: primaryName, title: primaryTitle, description: primaryDescription },
          { name: associatedName, title: associatedTitle, description: associatedDescription }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Linked object definition created', definition }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_delete_linked_object_definition',
    `Delete a linked object definition.

Args:
  - linkedObjectName: Linked object name

Returns:
  Confirmation of deletion.`,
    {
      linkedObjectName: z.string().describe('Linked object name'),
    },
    async ({ linkedObjectName }) => {
      try {
        await client.deleteLinkedObjectDefinition(linkedObjectName);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Linked object definition ${linkedObjectName} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_set_linked_object_value',
    `Set a linked object relationship between users.

Args:
  - primaryUserId: Primary user ID (e.g., manager)
  - relationshipName: Primary relationship name
  - associatedUserId: Associated user ID (e.g., direct report)

Returns:
  Confirmation of relationship set.`,
    {
      primaryUserId: z.string().describe('Primary user ID'),
      relationshipName: z.string().describe('Primary relationship name'),
      associatedUserId: z.string().describe('Associated user ID'),
    },
    async ({ primaryUserId, relationshipName, associatedUserId }) => {
      try {
        await client.setLinkedObjectValue(primaryUserId, relationshipName, associatedUserId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Linked object value set' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_get_linked_object_values',
    `Get linked object values for a user.

Args:
  - userId: User ID
  - relationshipName: Relationship name to query

Returns:
  Array of linked users.`,
    {
      userId: z.string().describe('User ID'),
      relationshipName: z.string().describe('Relationship name'),
    },
    async ({ userId, relationshipName }) => {
      try {
        const users = await client.getLinkedObjectValues(userId, relationshipName);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ users, count: users.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // User Schema
  // ===========================================================================
  server.tool(
    'okta_get_user_schema',
    `Get the user schema (profile attributes).

Args:
  - schemaId: Schema ID (use "default" for the default schema)

Returns:
  The user schema with all properties.`,
    {
      schemaId: z.string().default('default').describe('Schema ID'),
    },
    async ({ schemaId }) => {
      try {
        const schema = await client.getUserSchema(schemaId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(schema, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_update_user_schema',
    `Add custom properties to the user schema.

Args:
  - schemaId: Schema ID
  - customProperties: Object with custom property definitions

Returns:
  The updated user schema.`,
    {
      schemaId: z.string().describe('Schema ID'),
      customProperties: z.record(z.string(), z.unknown()).describe('Custom property definitions'),
    },
    async ({ schemaId, customProperties }) => {
      try {
        const schema = await client.updateUserSchema(schemaId, customProperties);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'User schema updated', schema }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
