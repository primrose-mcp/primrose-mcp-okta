/**
 * User Factor Tools (MFA)
 *
 * MCP tools for Okta multi-factor authentication management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all factor-related tools
 */
export function registerFactorTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List User Factors
  // ===========================================================================
  server.tool(
    'okta_list_user_factors',
    `List all enrolled factors (MFA methods) for a user.

Args:
  - userId: User ID
  - format: Response format

Returns:
  Array of enrolled factors with their status.`,
    {
      userId: z.string().describe('User ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ userId, format }) => {
      try {
        const factors = await client.listUserFactors(userId);
        return formatResponse({ items: factors, count: factors.length, hasMore: false }, format, 'factors');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get User Factor
  // ===========================================================================
  server.tool(
    'okta_get_user_factor',
    `Get details of a specific factor for a user.

Args:
  - userId: User ID
  - factorId: Factor ID

Returns:
  Factor details including type, status, and profile.`,
    {
      userId: z.string().describe('User ID'),
      factorId: z.string().describe('Factor ID'),
    },
    async ({ userId, factorId }) => {
      try {
        const factor = await client.getUserFactor(userId, factorId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(factor, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Enroll Factor
  // ===========================================================================
  server.tool(
    'okta_enroll_factor',
    `Enroll a new factor (MFA method) for a user.

Args:
  - userId: User ID
  - factorType: Factor type (sms, call, email, push, token:software:totp, etc.)
  - provider: Provider (OKTA, GOOGLE, etc.)
  - profile: Factor-specific profile (e.g., {phoneNumber: "+1-555-415-1337"} for SMS)

Returns:
  The enrolled factor, may require activation.`,
    {
      userId: z.string().describe('User ID'),
      factorType: z.string().describe('Factor type'),
      provider: z.string().describe('Provider'),
      profile: z.record(z.string(), z.unknown()).optional().describe('Factor profile'),
    },
    async ({ userId, factorType, provider, profile }) => {
      try {
        const factor = await client.enrollFactor(userId, factorType, provider, profile);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Factor enrolled', factor }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Activate Factor
  // ===========================================================================
  server.tool(
    'okta_activate_factor',
    `Activate a pending factor with a verification code.

Args:
  - userId: User ID
  - factorId: Factor ID
  - passCode: Verification code (for factors that require it)

Returns:
  The activated factor.`,
    {
      userId: z.string().describe('User ID'),
      factorId: z.string().describe('Factor ID'),
      passCode: z.string().optional().describe('Verification code'),
    },
    async ({ userId, factorId, passCode }) => {
      try {
        const factor = await client.activateFactor(userId, factorId, passCode);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Factor activated', factor }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Reset Factors
  // ===========================================================================
  server.tool(
    'okta_reset_factors',
    `Reset all factors for a user, requiring them to re-enroll in MFA.

Args:
  - userId: User ID

Returns:
  Confirmation of reset.`,
    {
      userId: z.string().describe('User ID'),
    },
    async ({ userId }) => {
      try {
        await client.resetFactors(userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `All factors reset for user ${userId}` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Factor
  // ===========================================================================
  server.tool(
    'okta_delete_factor',
    `Delete a specific factor from a user.

Args:
  - userId: User ID
  - factorId: Factor ID to delete

Returns:
  Confirmation of deletion.`,
    {
      userId: z.string().describe('User ID'),
      factorId: z.string().describe('Factor ID'),
    },
    async ({ userId, factorId }) => {
      try {
        await client.deleteFactor(userId, factorId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Factor ${factorId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
