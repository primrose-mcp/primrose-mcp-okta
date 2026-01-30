/**
 * Trusted Origin Tools
 *
 * MCP tools for Okta trusted origins management (CORS and redirect).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all trusted origin-related tools
 */
export function registerTrustedOriginTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List Trusted Origins
  // ===========================================================================
  server.tool(
    'okta_list_trusted_origins',
    `List trusted origins for CORS and redirect.

Args:
  - limit: Number to return (1-200, default: 20)
  - after: Pagination cursor
  - filter: Filter expression
  - format: Response format

Returns:
  Paginated list of trusted origins.`,
    {
      limit: z.number().int().min(1).max(200).default(20).describe('Number to return'),
      after: z.string().optional().describe('Pagination cursor'),
      filter: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, after, filter, format }) => {
      try {
        const result = await client.listTrustedOrigins({ limit, after, filter });
        return formatResponse(result, format, 'trustedOrigins');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Trusted Origin
  // ===========================================================================
  server.tool(
    'okta_get_trusted_origin',
    `Get a trusted origin by ID.

Args:
  - trustedOriginId: Trusted origin ID

Returns:
  The trusted origin record.`,
    {
      trustedOriginId: z.string().describe('Trusted origin ID'),
    },
    async ({ trustedOriginId }) => {
      try {
        const origin = await client.getTrustedOrigin(trustedOriginId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(origin, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Trusted Origin
  // ===========================================================================
  server.tool(
    'okta_create_trusted_origin',
    `Create a trusted origin for CORS/redirect.

Args:
  - name: Origin name
  - origin: Origin URL (e.g., "https://example.com")
  - scopes: Array of scope types - CORS, REDIRECT, or both

Returns:
  The created trusted origin.`,
    {
      name: z.string().describe('Origin name'),
      origin: z.string().url().describe('Origin URL'),
      scopes: z.array(z.enum(['CORS', 'REDIRECT'])).min(1).describe('Scope types'),
    },
    async ({ name, origin, scopes }) => {
      try {
        const scopeObjects = scopes.map((type) => ({ type }));
        const trustedOrigin = await client.createTrustedOrigin(name, origin, scopeObjects);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Trusted origin created', trustedOrigin }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Trusted Origin
  // ===========================================================================
  server.tool(
    'okta_update_trusted_origin',
    `Update a trusted origin.

Args:
  - trustedOriginId: Trusted origin ID
  - name: Origin name
  - origin: Origin URL
  - scopes: Array of scope types

Returns:
  The updated trusted origin.`,
    {
      trustedOriginId: z.string().describe('Trusted origin ID'),
      name: z.string().describe('Origin name'),
      origin: z.string().url().describe('Origin URL'),
      scopes: z.array(z.enum(['CORS', 'REDIRECT'])).min(1).describe('Scope types'),
    },
    async ({ trustedOriginId, name, origin, scopes }) => {
      try {
        const scopeObjects = scopes.map((type) => ({ type }));
        const trustedOrigin = await client.updateTrustedOrigin(trustedOriginId, name, origin, scopeObjects);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Trusted origin updated', trustedOrigin }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Trusted Origin
  // ===========================================================================
  server.tool(
    'okta_delete_trusted_origin',
    `Delete a trusted origin.

Args:
  - trustedOriginId: Trusted origin ID

Returns:
  Confirmation of deletion.`,
    {
      trustedOriginId: z.string().describe('Trusted origin ID'),
    },
    async ({ trustedOriginId }) => {
      try {
        await client.deleteTrustedOrigin(trustedOriginId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Trusted origin ${trustedOriginId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Activate/Deactivate Trusted Origin
  // ===========================================================================
  server.tool(
    'okta_activate_trusted_origin',
    `Activate a trusted origin.

Args:
  - trustedOriginId: Trusted origin ID

Returns:
  Confirmation of activation.`,
    {
      trustedOriginId: z.string().describe('Trusted origin ID'),
    },
    async ({ trustedOriginId }) => {
      try {
        await client.activateTrustedOrigin(trustedOriginId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Trusted origin ${trustedOriginId} activated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_deactivate_trusted_origin',
    `Deactivate a trusted origin.

Args:
  - trustedOriginId: Trusted origin ID

Returns:
  Confirmation of deactivation.`,
    {
      trustedOriginId: z.string().describe('Trusted origin ID'),
    },
    async ({ trustedOriginId }) => {
      try {
        await client.deactivateTrustedOrigin(trustedOriginId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Trusted origin ${trustedOriginId} deactivated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
