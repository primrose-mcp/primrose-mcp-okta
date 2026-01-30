/**
 * Authenticator Tools
 *
 * MCP tools for Okta authenticator management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register all authenticator-related tools
 */
export function registerAuthenticatorTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List Authenticators
  // ===========================================================================
  server.tool(
    'okta_list_authenticators',
    `List all authenticators configured in the org.

Returns:
  Array of authenticators with their status and settings.`,
    {},
    async () => {
      try {
        const authenticators = await client.listAuthenticators();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ authenticators, count: authenticators.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Authenticator
  // ===========================================================================
  server.tool(
    'okta_get_authenticator',
    `Get an authenticator by ID.

Args:
  - authenticatorId: Authenticator ID

Returns:
  The authenticator record.`,
    {
      authenticatorId: z.string().describe('Authenticator ID'),
    },
    async ({ authenticatorId }) => {
      try {
        const authenticator = await client.getAuthenticator(authenticatorId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(authenticator, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Activate Authenticator
  // ===========================================================================
  server.tool(
    'okta_activate_authenticator',
    `Activate an authenticator.

Args:
  - authenticatorId: Authenticator ID

Returns:
  The activated authenticator.`,
    {
      authenticatorId: z.string().describe('Authenticator ID'),
    },
    async ({ authenticatorId }) => {
      try {
        const authenticator = await client.activateAuthenticator(authenticatorId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Authenticator activated', authenticator }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Deactivate Authenticator
  // ===========================================================================
  server.tool(
    'okta_deactivate_authenticator',
    `Deactivate an authenticator.

Args:
  - authenticatorId: Authenticator ID

Returns:
  The deactivated authenticator.`,
    {
      authenticatorId: z.string().describe('Authenticator ID'),
    },
    async ({ authenticatorId }) => {
      try {
        const authenticator = await client.deactivateAuthenticator(authenticatorId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Authenticator deactivated', authenticator }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
