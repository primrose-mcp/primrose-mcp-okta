/**
 * System Log Tools
 *
 * MCP tools for Okta system log access.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all system log-related tools
 */
export function registerLogTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // Get System Logs
  // ===========================================================================
  server.tool(
    'okta_get_logs',
    `Query the Okta system log for audit and troubleshooting.

Args:
  - since: Start date (ISO 8601 format, e.g., "2024-01-01T00:00:00Z")
  - until: End date (ISO 8601 format)
  - filter: SCIM filter expression (e.g., 'eventType eq "user.session.start"')
  - q: Keyword search query
  - limit: Number of events to return (1-1000, default: 100)
  - after: Pagination cursor
  - sortOrder: ASCENDING or DESCENDING (default: DESCENDING)
  - format: Response format

Returns:
  Paginated list of log events.`,
    {
      since: z.string().optional().describe('Start date (ISO 8601)'),
      until: z.string().optional().describe('End date (ISO 8601)'),
      filter: z.string().optional().describe('SCIM filter expression'),
      q: z.string().optional().describe('Keyword search'),
      limit: z.number().int().min(1).max(1000).default(100).describe('Number of events'),
      after: z.string().optional().describe('Pagination cursor'),
      sortOrder: z.enum(['ASCENDING', 'DESCENDING']).default('DESCENDING').describe('Sort order'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ since, until, filter, q, limit, after, sortOrder, format }) => {
      try {
        const result = await client.getLogs({ since, until, filter, q, limit, after, sortOrder });
        return formatResponse(result, format, 'logs');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Login Events
  // ===========================================================================
  server.tool(
    'okta_get_login_events',
    `Get user login/logout events from the system log.

Args:
  - since: Start date (ISO 8601 format)
  - until: End date (ISO 8601 format)
  - userId: Filter by user ID
  - limit: Number of events to return
  - format: Response format

Returns:
  List of login-related events.`,
    {
      since: z.string().optional().describe('Start date (ISO 8601)'),
      until: z.string().optional().describe('End date (ISO 8601)'),
      userId: z.string().optional().describe('Filter by user ID'),
      limit: z.number().int().min(1).max(1000).default(100).describe('Number of events'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ since, until, userId, limit, format }) => {
      try {
        let filter = 'eventType sw "user.session"';
        if (userId) {
          filter += ` and actor.id eq "${userId}"`;
        }
        const result = await client.getLogs({ since, until, filter, limit });
        return formatResponse(result, format, 'logs');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Security Events
  // ===========================================================================
  server.tool(
    'okta_get_security_events',
    `Get security-related events from the system log (suspicious activity, policy violations).

Args:
  - since: Start date (ISO 8601 format)
  - until: End date (ISO 8601 format)
  - limit: Number of events to return
  - format: Response format

Returns:
  List of security-related events.`,
    {
      since: z.string().optional().describe('Start date (ISO 8601)'),
      until: z.string().optional().describe('End date (ISO 8601)'),
      limit: z.number().int().min(1).max(1000).default(100).describe('Number of events'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ since, until, limit, format }) => {
      try {
        // Filter for security-related events
        const filter = 'eventType sw "security." or eventType sw "policy." or outcome.result eq "FAILURE"';
        const result = await client.getLogs({ since, until, filter, limit });
        return formatResponse(result, format, 'logs');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Admin Events
  // ===========================================================================
  server.tool(
    'okta_get_admin_events',
    `Get administrative events from the system log (user/group/app changes).

Args:
  - since: Start date (ISO 8601 format)
  - until: End date (ISO 8601 format)
  - limit: Number of events to return
  - format: Response format

Returns:
  List of administrative events.`,
    {
      since: z.string().optional().describe('Start date (ISO 8601)'),
      until: z.string().optional().describe('End date (ISO 8601)'),
      limit: z.number().int().min(1).max(1000).default(100).describe('Number of events'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ since, until, limit, format }) => {
      try {
        // Filter for admin/lifecycle events
        const filter = 'eventType sw "user.lifecycle" or eventType sw "group.lifecycle" or eventType sw "application.lifecycle"';
        const result = await client.getLogs({ since, until, filter, limit });
        return formatResponse(result, format, 'logs');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
