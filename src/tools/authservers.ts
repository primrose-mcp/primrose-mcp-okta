/**
 * Authorization Server Tools
 *
 * MCP tools for Okta authorization server management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all authorization server-related tools
 */
export function registerAuthServerTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List Authorization Servers
  // ===========================================================================
  server.tool(
    'okta_list_auth_servers',
    `List authorization servers from Okta.

Args:
  - limit: Number of servers to return (1-200, default: 20)
  - after: Pagination cursor
  - q: Search query
  - format: Response format

Returns:
  Paginated list of authorization servers.`,
    {
      limit: z.number().int().min(1).max(200).default(20).describe('Number to return'),
      after: z.string().optional().describe('Pagination cursor'),
      q: z.string().optional().describe('Search query'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, after, q, format }) => {
      try {
        const result = await client.listAuthorizationServers({ limit, after, q });
        return formatResponse(result, format, 'authorizationServers');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Authorization Server
  // ===========================================================================
  server.tool(
    'okta_get_auth_server',
    `Get an authorization server by ID.

Args:
  - authServerId: Authorization server ID (use 'default' for the default server)

Returns:
  The authorization server record.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
    },
    async ({ authServerId }) => {
      try {
        const server = await client.getAuthorizationServer(authServerId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(server, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Authorization Server
  // ===========================================================================
  server.tool(
    'okta_create_auth_server',
    `Create a new authorization server.

Args:
  - name: Server name
  - description: Server description
  - audiences: Array of audiences (URIs)

Returns:
  The created authorization server.`,
    {
      name: z.string().describe('Server name'),
      description: z.string().describe('Server description'),
      audiences: z.array(z.string()).describe('Audience URIs'),
    },
    async ({ name, description, audiences }) => {
      try {
        const authServer = await client.createAuthorizationServer(name, description, audiences);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Authorization server created', authServer }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Authorization Server
  // ===========================================================================
  server.tool(
    'okta_update_auth_server',
    `Update an authorization server.

Args:
  - authServerId: Authorization server ID
  - name: Server name
  - description: Server description
  - audiences: Array of audiences (URIs)

Returns:
  The updated authorization server.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
      name: z.string().describe('Server name'),
      description: z.string().describe('Server description'),
      audiences: z.array(z.string()).describe('Audience URIs'),
    },
    async ({ authServerId, name, description, audiences }) => {
      try {
        const authServer = await client.updateAuthorizationServer(authServerId, name, description, audiences);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Authorization server updated', authServer }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Authorization Server
  // ===========================================================================
  server.tool(
    'okta_delete_auth_server',
    `Delete an authorization server.

Args:
  - authServerId: Authorization server ID

Returns:
  Confirmation of deletion.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
    },
    async ({ authServerId }) => {
      try {
        await client.deleteAuthorizationServer(authServerId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Authorization server ${authServerId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Activate/Deactivate Authorization Server
  // ===========================================================================
  server.tool(
    'okta_activate_auth_server',
    `Activate an authorization server.

Args:
  - authServerId: Authorization server ID

Returns:
  Confirmation of activation.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
    },
    async ({ authServerId }) => {
      try {
        await client.activateAuthorizationServer(authServerId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Authorization server ${authServerId} activated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_deactivate_auth_server',
    `Deactivate an authorization server.

Args:
  - authServerId: Authorization server ID

Returns:
  Confirmation of deactivation.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
    },
    async ({ authServerId }) => {
      try {
        await client.deactivateAuthorizationServer(authServerId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Authorization server ${authServerId} deactivated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Scopes
  // ===========================================================================
  server.tool(
    'okta_list_auth_server_scopes',
    `List scopes for an authorization server.

Args:
  - authServerId: Authorization server ID

Returns:
  Array of scopes.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
    },
    async ({ authServerId }) => {
      try {
        const scopes = await client.listAuthServerScopes(authServerId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ scopes, count: scopes.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_create_auth_server_scope',
    `Create a scope for an authorization server.

Args:
  - authServerId: Authorization server ID
  - name: Scope name
  - description: Scope description
  - consent: Consent mode (IMPLICIT or REQUIRED)
  - metadataPublish: Publish to metadata (NO_CLIENTS or ALL_CLIENTS)

Returns:
  The created scope.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
      name: z.string().describe('Scope name'),
      description: z.string().optional().describe('Scope description'),
      consent: z.enum(['IMPLICIT', 'REQUIRED']).default('IMPLICIT').describe('Consent mode'),
      metadataPublish: z.enum(['NO_CLIENTS', 'ALL_CLIENTS']).default('NO_CLIENTS').describe('Metadata publish'),
    },
    async ({ authServerId, name, description, consent, metadataPublish }) => {
      try {
        const scope = await client.createAuthServerScope(authServerId, name, description, consent, metadataPublish);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Scope created', scope }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_delete_auth_server_scope',
    `Delete a scope from an authorization server.

Args:
  - authServerId: Authorization server ID
  - scopeId: Scope ID

Returns:
  Confirmation of deletion.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
      scopeId: z.string().describe('Scope ID'),
    },
    async ({ authServerId, scopeId }) => {
      try {
        await client.deleteAuthServerScope(authServerId, scopeId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Scope ${scopeId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Claims
  // ===========================================================================
  server.tool(
    'okta_list_auth_server_claims',
    `List claims for an authorization server.

Args:
  - authServerId: Authorization server ID

Returns:
  Array of claims.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
    },
    async ({ authServerId }) => {
      try {
        const claims = await client.listAuthServerClaims(authServerId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ claims, count: claims.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_create_auth_server_claim',
    `Create a claim for an authorization server.

Args:
  - authServerId: Authorization server ID
  - name: Claim name
  - claimType: RESOURCE or IDENTITY
  - valueType: EXPRESSION or GROUPS
  - value: Claim value expression

Returns:
  The created claim.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
      name: z.string().describe('Claim name'),
      claimType: z.enum(['RESOURCE', 'IDENTITY']).describe('Claim type'),
      valueType: z.enum(['EXPRESSION', 'GROUPS']).describe('Value type'),
      value: z.string().describe('Claim value expression'),
    },
    async ({ authServerId, name, claimType, valueType, value }) => {
      try {
        const claim = await client.createAuthServerClaim(authServerId, name, claimType, valueType, value);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Claim created', claim }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_delete_auth_server_claim',
    `Delete a claim from an authorization server.

Args:
  - authServerId: Authorization server ID
  - claimId: Claim ID

Returns:
  Confirmation of deletion.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
      claimId: z.string().describe('Claim ID'),
    },
    async ({ authServerId, claimId }) => {
      try {
        await client.deleteAuthServerClaim(authServerId, claimId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Claim ${claimId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Policies
  // ===========================================================================
  server.tool(
    'okta_list_auth_server_policies',
    `List policies for an authorization server.

Args:
  - authServerId: Authorization server ID

Returns:
  Array of policies.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
    },
    async ({ authServerId }) => {
      try {
        const policies = await client.listAuthServerPolicies(authServerId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ policies, count: policies.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_get_auth_server_policy',
    `Get a policy from an authorization server.

Args:
  - authServerId: Authorization server ID
  - policyId: Policy ID

Returns:
  The policy record.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
      policyId: z.string().describe('Policy ID'),
    },
    async ({ authServerId, policyId }) => {
      try {
        const policy = await client.getAuthServerPolicy(authServerId, policyId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(policy, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_create_auth_server_policy',
    `Create a policy for an authorization server.

Args:
  - authServerId: Authorization server ID
  - name: Policy name
  - description: Policy description
  - priority: Policy priority (1 is highest)
  - clientIds: Array of client IDs or ['ALL_CLIENTS']

Returns:
  The created policy.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
      name: z.string().describe('Policy name'),
      description: z.string().describe('Policy description'),
      priority: z.number().int().min(1).describe('Policy priority'),
      clientIds: z.array(z.string()).describe('Client IDs'),
    },
    async ({ authServerId, name, description, priority, clientIds }) => {
      try {
        const policy = await client.createAuthServerPolicy(authServerId, name, description, priority, clientIds);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Policy created', policy }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_delete_auth_server_policy',
    `Delete a policy from an authorization server.

Args:
  - authServerId: Authorization server ID
  - policyId: Policy ID

Returns:
  Confirmation of deletion.`,
    {
      authServerId: z.string().describe('Authorization server ID'),
      policyId: z.string().describe('Policy ID'),
    },
    async ({ authServerId, policyId }) => {
      try {
        await client.deleteAuthServerPolicy(authServerId, policyId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Policy ${policyId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
