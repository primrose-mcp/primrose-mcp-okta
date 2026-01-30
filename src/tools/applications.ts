/**
 * Application Tools
 *
 * MCP tools for Okta application management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all application-related tools
 */
export function registerApplicationTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List Applications
  // ===========================================================================
  server.tool(
    'okta_list_applications',
    `List applications from Okta with pagination and filtering.

Args:
  - limit: Number of apps to return (1-200, default: 20)
  - after: Pagination cursor
  - filter: Filter expression (e.g., 'status eq "ACTIVE"')
  - q: Search query for app name
  - format: Response format

Returns:
  Paginated list of applications.`,
    {
      limit: z.number().int().min(1).max(200).default(20).describe('Number of apps to return'),
      after: z.string().optional().describe('Pagination cursor'),
      filter: z.string().optional().describe('Filter expression'),
      q: z.string().optional().describe('Search query'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, after, filter, q, format }) => {
      try {
        const result = await client.listApplications({ limit, after, filter, q });
        return formatResponse(result, format, 'applications');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Application
  // ===========================================================================
  server.tool(
    'okta_get_application',
    `Get a single application by ID.

Args:
  - appId: Application ID

Returns:
  The application record with settings and credentials.`,
    {
      appId: z.string().describe('Application ID'),
    },
    async ({ appId }) => {
      try {
        const app = await client.getApplication(appId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(app, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Activate Application
  // ===========================================================================
  server.tool(
    'okta_activate_application',
    `Activate an inactive application.

Args:
  - appId: Application ID

Returns:
  Confirmation of activation.`,
    {
      appId: z.string().describe('Application ID'),
    },
    async ({ appId }) => {
      try {
        await client.activateApplication(appId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Application ${appId} activated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Deactivate Application
  // ===========================================================================
  server.tool(
    'okta_deactivate_application',
    `Deactivate an active application.

Args:
  - appId: Application ID

Returns:
  Confirmation of deactivation.`,
    {
      appId: z.string().describe('Application ID'),
    },
    async ({ appId }) => {
      try {
        await client.deactivateApplication(appId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Application ${appId} deactivated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Application
  // ===========================================================================
  server.tool(
    'okta_delete_application',
    `Delete an application. Must be deactivated first.

Args:
  - appId: Application ID

Returns:
  Confirmation of deletion.`,
    {
      appId: z.string().describe('Application ID'),
    },
    async ({ appId }) => {
      try {
        await client.deleteApplication(appId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Application ${appId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Application Users
  // ===========================================================================
  server.tool(
    'okta_list_app_users',
    `List users assigned to an application.

Args:
  - appId: Application ID
  - limit: Number of users to return
  - after: Pagination cursor
  - format: Response format

Returns:
  Paginated list of app users.`,
    {
      appId: z.string().describe('Application ID'),
      limit: z.number().int().min(1).max(200).default(20).describe('Number of users to return'),
      after: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ appId, limit, after, format }) => {
      try {
        const result = await client.listAppUsers(appId, limit, after);
        return formatResponse(result, format, 'appUsers');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Assign User to Application
  // ===========================================================================
  server.tool(
    'okta_assign_user_to_app',
    `Assign a user to an application.

Args:
  - appId: Application ID
  - userId: User ID
  - profile: Optional app-specific user profile

Returns:
  The app user assignment.`,
    {
      appId: z.string().describe('Application ID'),
      userId: z.string().describe('User ID'),
      profile: z.record(z.string(), z.unknown()).optional().describe('App-specific profile'),
    },
    async ({ appId, userId, profile }) => {
      try {
        const appUser = await client.assignUserToApp(appId, userId, profile);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'User assigned to app', appUser }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove User from Application
  // ===========================================================================
  server.tool(
    'okta_remove_user_from_app',
    `Remove a user from an application.

Args:
  - appId: Application ID
  - userId: User ID

Returns:
  Confirmation of removal.`,
    {
      appId: z.string().describe('Application ID'),
      userId: z.string().describe('User ID'),
    },
    async ({ appId, userId }) => {
      try {
        await client.removeUserFromApp(appId, userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User ${userId} removed from app ${appId}` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Application Groups
  // ===========================================================================
  server.tool(
    'okta_list_app_groups',
    `List groups assigned to an application.

Args:
  - appId: Application ID

Returns:
  Array of groups assigned to the app.`,
    {
      appId: z.string().describe('Application ID'),
    },
    async ({ appId }) => {
      try {
        const groups = await client.listAppGroups(appId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ groups, count: groups.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Assign Group to Application
  // ===========================================================================
  server.tool(
    'okta_assign_group_to_app',
    `Assign a group to an application.

Args:
  - appId: Application ID
  - groupId: Group ID

Returns:
  Confirmation of assignment.`,
    {
      appId: z.string().describe('Application ID'),
      groupId: z.string().describe('Group ID'),
    },
    async ({ appId, groupId }) => {
      try {
        await client.assignGroupToApp(appId, groupId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Group ${groupId} assigned to app ${appId}` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Group from Application
  // ===========================================================================
  server.tool(
    'okta_remove_group_from_app',
    `Remove a group from an application.

Args:
  - appId: Application ID
  - groupId: Group ID

Returns:
  Confirmation of removal.`,
    {
      appId: z.string().describe('Application ID'),
      groupId: z.string().describe('Group ID'),
    },
    async ({ appId, groupId }) => {
      try {
        await client.removeGroupFromApp(appId, groupId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Group ${groupId} removed from app ${appId}` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
