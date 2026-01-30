/**
 * Session Tools
 *
 * MCP tools for Okta session management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register all session-related tools
 */
export function registerSessionTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // Get Session
  // ===========================================================================
  server.tool(
    'okta_get_session',
    `Get a session by ID.

Args:
  - sessionId: Session ID

Returns:
  The session record with login, expiration, and MFA status.`,
    {
      sessionId: z.string().describe('Session ID'),
    },
    async ({ sessionId }) => {
      try {
        const session = await client.getSession(sessionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(session, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // End Session
  // ===========================================================================
  server.tool(
    'okta_end_session',
    `End/revoke a user session.

Args:
  - sessionId: Session ID to end

Returns:
  Confirmation of session termination.`,
    {
      sessionId: z.string().describe('Session ID'),
    },
    async ({ sessionId }) => {
      try {
        await client.endSession(sessionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Session ${sessionId} ended` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Refresh Session
  // ===========================================================================
  server.tool(
    'okta_refresh_session',
    `Refresh/extend a session.

Args:
  - sessionId: Session ID to refresh

Returns:
  The refreshed session with new expiration.`,
    {
      sessionId: z.string().describe('Session ID'),
    },
    async ({ sessionId }) => {
      try {
        const session = await client.refreshSession(sessionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Session refreshed', session }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
