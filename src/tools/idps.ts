/**
 * Identity Provider Tools
 *
 * MCP tools for Okta identity provider management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all identity provider-related tools
 */
export function registerIdpTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List Identity Providers
  // ===========================================================================
  server.tool(
    'okta_list_identity_providers',
    `List configured identity providers.

Args:
  - limit: Number to return (1-200, default: 20)
  - after: Pagination cursor
  - type: Filter by IdP type (SAML2, OIDC, GOOGLE, FACEBOOK, etc.)
  - format: Response format

Returns:
  Paginated list of identity providers.`,
    {
      limit: z.number().int().min(1).max(200).default(20).describe('Number to return'),
      after: z.string().optional().describe('Pagination cursor'),
      type: z.string().optional().describe('IdP type filter'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, after, type, format }) => {
      try {
        const result = await client.listIdentityProviders({ limit, after, type });
        return formatResponse(result, format, 'identityProviders');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Identity Provider
  // ===========================================================================
  server.tool(
    'okta_get_identity_provider',
    `Get an identity provider by ID.

Args:
  - idpId: Identity provider ID

Returns:
  The identity provider record with protocol and policy configuration.`,
    {
      idpId: z.string().describe('Identity provider ID'),
    },
    async ({ idpId }) => {
      try {
        const idp = await client.getIdentityProvider(idpId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(idp, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Activate Identity Provider
  // ===========================================================================
  server.tool(
    'okta_activate_identity_provider',
    `Activate an identity provider.

Args:
  - idpId: Identity provider ID

Returns:
  Confirmation of activation.`,
    {
      idpId: z.string().describe('Identity provider ID'),
    },
    async ({ idpId }) => {
      try {
        await client.activateIdentityProvider(idpId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Identity provider ${idpId} activated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Deactivate Identity Provider
  // ===========================================================================
  server.tool(
    'okta_deactivate_identity_provider',
    `Deactivate an identity provider.

Args:
  - idpId: Identity provider ID

Returns:
  Confirmation of deactivation.`,
    {
      idpId: z.string().describe('Identity provider ID'),
    },
    async ({ idpId }) => {
      try {
        await client.deactivateIdentityProvider(idpId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Identity provider ${idpId} deactivated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Identity Provider
  // ===========================================================================
  server.tool(
    'okta_delete_identity_provider',
    `Delete an identity provider.

Args:
  - idpId: Identity provider ID

Returns:
  Confirmation of deletion.`,
    {
      idpId: z.string().describe('Identity provider ID'),
    },
    async ({ idpId }) => {
      try {
        await client.deleteIdentityProvider(idpId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Identity provider ${idpId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
