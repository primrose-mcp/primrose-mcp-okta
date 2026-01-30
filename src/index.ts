/**
 * Okta MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It supports both stateless (McpServer) and stateful (McpAgent) modes.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (API tokens, domain) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-Okta-Domain: Your Okta domain (e.g., "dev-12345678")
 * - X-Okta-API-Token: SSWS API token for authentication
 *
 * Optional Headers:
 * - X-Okta-Base-URL: Override the default Okta API base URL
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createOktaClient } from './client.js';
import {
  registerApplicationTools,
  registerAuthenticatorTools,
  registerAuthServerTools,
  registerBrandTools,
  registerEventHookTools,
  registerFactorTools,
  registerFeatureTools,
  registerGroupTools,
  registerIdpTools,
  registerLogTools,
  registerNetworkZoneTools,
  registerPolicyTools,
  registerSessionTools,
  registerTrustedOriginTools,
  registerUserTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-okta';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode (Option 2) instead.
 * The stateful McpAgent is better suited for single-tenant deployments where
 * credentials can be stored as wrangler secrets.
 *
 * @deprecated For multi-tenant support, use stateless mode with per-request credentials
 */
export class OktaMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-Okta-API-Token header instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides credentials via headers, allowing
 * a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createOktaClient(credentials);

  // Register all tool groups
  registerUserTools(server, client);
  registerFactorTools(server, client);
  registerGroupTools(server, client);
  registerApplicationTools(server, client);
  registerAuthServerTools(server, client);
  registerPolicyTools(server, client);
  registerLogTools(server, client);
  registerSessionTools(server, client);
  registerTrustedOriginTools(server, client);
  registerIdpTools(server, client);
  registerAuthenticatorTools(server, client);
  registerNetworkZoneTools(server, client);
  registerEventHookTools(server, client);
  registerBrandTools(server, client);
  registerFeatureTools(server, client);

  // Test connection tool
  server.tool('okta_test_connection', 'Test the connection to the Okta API', {}, async () => {
    try {
      const result = await client.testConnection();
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    // ==========================================================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-Okta-Domain', 'X-Okta-API-Token'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Multi-tenant Okta MCP Server',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          required_headers: {
            'X-Okta-Domain': 'Your Okta domain (e.g., "dev-12345678" or "dev-12345678.okta.com")',
            'X-Okta-API-Token': 'SSWS API token for authentication',
          },
          optional_headers: {
            'X-Okta-Base-URL': 'Override the default Okta API base URL',
          },
        },
        tools: {
          users: [
            'okta_list_users', 'okta_get_user', 'okta_create_user', 'okta_update_user',
            'okta_delete_user', 'okta_activate_user', 'okta_deactivate_user',
            'okta_suspend_user', 'okta_unsuspend_user', 'okta_unlock_user',
            'okta_reset_password', 'okta_expire_password', 'okta_set_user_password',
            'okta_list_user_groups', 'okta_list_user_apps',
          ],
          factors: [
            'okta_list_user_factors', 'okta_get_user_factor', 'okta_enroll_factor',
            'okta_activate_factor', 'okta_reset_factors', 'okta_delete_factor',
          ],
          groups: [
            'okta_list_groups', 'okta_get_group', 'okta_create_group', 'okta_update_group',
            'okta_delete_group', 'okta_list_group_members', 'okta_add_user_to_group',
            'okta_remove_user_from_group', 'okta_list_group_apps',
            'okta_list_group_rules', 'okta_get_group_rule', 'okta_create_group_rule',
            'okta_delete_group_rule', 'okta_activate_group_rule', 'okta_deactivate_group_rule',
          ],
          applications: [
            'okta_list_applications', 'okta_get_application', 'okta_activate_application',
            'okta_deactivate_application', 'okta_delete_application',
            'okta_list_app_users', 'okta_assign_user_to_app', 'okta_remove_user_from_app',
            'okta_list_app_groups', 'okta_assign_group_to_app', 'okta_remove_group_from_app',
          ],
          authorizationServers: [
            'okta_list_auth_servers', 'okta_get_auth_server', 'okta_create_auth_server',
            'okta_update_auth_server', 'okta_delete_auth_server',
            'okta_activate_auth_server', 'okta_deactivate_auth_server',
            'okta_list_auth_server_scopes', 'okta_create_auth_server_scope', 'okta_delete_auth_server_scope',
            'okta_list_auth_server_claims', 'okta_create_auth_server_claim', 'okta_delete_auth_server_claim',
            'okta_list_auth_server_policies', 'okta_get_auth_server_policy',
            'okta_create_auth_server_policy', 'okta_delete_auth_server_policy',
          ],
          policies: [
            'okta_list_policies', 'okta_get_policy', 'okta_create_policy', 'okta_update_policy',
            'okta_delete_policy', 'okta_activate_policy', 'okta_deactivate_policy',
            'okta_list_policy_rules', 'okta_get_policy_rule', 'okta_delete_policy_rule',
            'okta_activate_policy_rule', 'okta_deactivate_policy_rule',
          ],
          systemLog: [
            'okta_get_logs', 'okta_get_login_events', 'okta_get_security_events', 'okta_get_admin_events',
          ],
          sessions: [
            'okta_get_session', 'okta_end_session', 'okta_refresh_session',
          ],
          trustedOrigins: [
            'okta_list_trusted_origins', 'okta_get_trusted_origin', 'okta_create_trusted_origin',
            'okta_update_trusted_origin', 'okta_delete_trusted_origin',
            'okta_activate_trusted_origin', 'okta_deactivate_trusted_origin',
          ],
          identityProviders: [
            'okta_list_identity_providers', 'okta_get_identity_provider',
            'okta_activate_identity_provider', 'okta_deactivate_identity_provider',
            'okta_delete_identity_provider',
          ],
          authenticators: [
            'okta_list_authenticators', 'okta_get_authenticator',
            'okta_activate_authenticator', 'okta_deactivate_authenticator',
          ],
          networkZones: [
            'okta_list_network_zones', 'okta_get_network_zone', 'okta_create_network_zone',
            'okta_update_network_zone', 'okta_delete_network_zone',
            'okta_activate_network_zone', 'okta_deactivate_network_zone',
          ],
          eventHooks: [
            'okta_list_event_hooks', 'okta_get_event_hook', 'okta_create_event_hook',
            'okta_update_event_hook', 'okta_delete_event_hook',
            'okta_activate_event_hook', 'okta_deactivate_event_hook', 'okta_verify_event_hook',
          ],
          brands: [
            'okta_list_brands', 'okta_get_brand', 'okta_update_brand',
            'okta_list_domains', 'okta_get_domain', 'okta_create_domain',
            'okta_delete_domain', 'okta_verify_domain',
          ],
          features: [
            'okta_list_features', 'okta_get_feature', 'okta_enable_feature', 'okta_disable_feature',
            'okta_list_linked_object_definitions', 'okta_get_linked_object_definition',
            'okta_create_linked_object_definition', 'okta_delete_linked_object_definition',
            'okta_set_linked_object_value', 'okta_get_linked_object_values',
            'okta_get_user_schema', 'okta_update_user_schema',
          ],
          connection: ['okta_test_connection'],
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
