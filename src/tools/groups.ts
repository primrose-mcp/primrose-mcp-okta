/**
 * Group Tools
 *
 * MCP tools for Okta group management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all group-related tools
 */
export function registerGroupTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List Groups
  // ===========================================================================
  server.tool(
    'okta_list_groups',
    `List groups from Okta with pagination and filtering.

Args:
  - limit: Number of groups to return (1-200, default: 20)
  - after: Pagination cursor
  - search: Search by name (prefix match)
  - filter: Filter expression (e.g., 'type eq "OKTA_GROUP"')
  - format: Response format

Returns:
  Paginated list of groups.`,
    {
      limit: z.number().int().min(1).max(200).default(20).describe('Number of groups to return'),
      after: z.string().optional().describe('Pagination cursor'),
      search: z.string().optional().describe('Search by name'),
      filter: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, after, search, filter, format }) => {
      try {
        const result = await client.listGroups({ limit, after, search, filter });
        return formatResponse(result, format, 'groups');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Group
  // ===========================================================================
  server.tool(
    'okta_get_group',
    `Get a single group by ID.

Args:
  - groupId: Group ID

Returns:
  The group record.`,
    {
      groupId: z.string().describe('Group ID'),
    },
    async ({ groupId }) => {
      try {
        const group = await client.getGroup(groupId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(group, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Group
  // ===========================================================================
  server.tool(
    'okta_create_group',
    `Create a new Okta group.

Args:
  - name: Group name (required)
  - description: Group description

Returns:
  The created group.`,
    {
      name: z.string().describe('Group name'),
      description: z.string().optional().describe('Group description'),
    },
    async ({ name, description }) => {
      try {
        const group = await client.createGroup(name, description);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Group created', group }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Group
  // ===========================================================================
  server.tool(
    'okta_update_group',
    `Update an existing group's profile.

Args:
  - groupId: Group ID
  - name: New group name
  - description: New description

Returns:
  The updated group.`,
    {
      groupId: z.string().describe('Group ID'),
      name: z.string().describe('Group name'),
      description: z.string().optional().describe('Group description'),
    },
    async ({ groupId, name, description }) => {
      try {
        const group = await client.updateGroup(groupId, name, description);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Group updated', group }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Group
  // ===========================================================================
  server.tool(
    'okta_delete_group',
    `Delete a group. Note: Only OKTA_GROUP type groups can be deleted.

Args:
  - groupId: Group ID to delete

Returns:
  Confirmation of deletion.`,
    {
      groupId: z.string().describe('Group ID'),
    },
    async ({ groupId }) => {
      try {
        await client.deleteGroup(groupId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Group ${groupId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Group Members
  // ===========================================================================
  server.tool(
    'okta_list_group_members',
    `List all members of a group.

Args:
  - groupId: Group ID
  - limit: Number of members to return
  - after: Pagination cursor
  - format: Response format

Returns:
  Paginated list of group members.`,
    {
      groupId: z.string().describe('Group ID'),
      limit: z.number().int().min(1).max(200).default(20).describe('Number of members to return'),
      after: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ groupId, limit, after, format }) => {
      try {
        const result = await client.listGroupMembers(groupId, limit, after);
        return formatResponse(result, format, 'users');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add User to Group
  // ===========================================================================
  server.tool(
    'okta_add_user_to_group',
    `Add a user to a group.

Args:
  - groupId: Group ID
  - userId: User ID to add

Returns:
  Confirmation of addition.`,
    {
      groupId: z.string().describe('Group ID'),
      userId: z.string().describe('User ID'),
    },
    async ({ groupId, userId }) => {
      try {
        await client.addUserToGroup(groupId, userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User ${userId} added to group ${groupId}` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove User from Group
  // ===========================================================================
  server.tool(
    'okta_remove_user_from_group',
    `Remove a user from a group.

Args:
  - groupId: Group ID
  - userId: User ID to remove

Returns:
  Confirmation of removal.`,
    {
      groupId: z.string().describe('Group ID'),
      userId: z.string().describe('User ID'),
    },
    async ({ groupId, userId }) => {
      try {
        await client.removeUserFromGroup(groupId, userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User ${userId} removed from group ${groupId}` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Group Apps
  // ===========================================================================
  server.tool(
    'okta_list_group_apps',
    `List all applications assigned to a group.

Args:
  - groupId: Group ID

Returns:
  Array of applications assigned to the group.`,
    {
      groupId: z.string().describe('Group ID'),
    },
    async ({ groupId }) => {
      try {
        const apps = await client.listGroupApps(groupId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ apps, count: apps.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Group Rules
  // ===========================================================================
  server.tool(
    'okta_list_group_rules',
    `List all group rules.

Args:
  - limit: Number of rules to return
  - after: Pagination cursor

Returns:
  Paginated list of group rules.`,
    {
      limit: z.number().int().min(1).max(200).default(20).describe('Number of rules to return'),
      after: z.string().optional().describe('Pagination cursor'),
    },
    async ({ limit, after }) => {
      try {
        const result = await client.listGroupRules({ limit, after });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_get_group_rule',
    `Get a specific group rule by ID.

Args:
  - ruleId: Rule ID

Returns:
  The group rule details.`,
    {
      ruleId: z.string().describe('Rule ID'),
    },
    async ({ ruleId }) => {
      try {
        const rule = await client.getGroupRule(ruleId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(rule, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_create_group_rule',
    `Create a group rule to dynamically add users to groups.

Args:
  - name: Rule name
  - groupIds: Target group IDs
  - expression: Okta Expression Language condition (e.g., "user.department == 'Engineering'")

Returns:
  The created group rule.`,
    {
      name: z.string().describe('Rule name'),
      groupIds: z.array(z.string()).describe('Target group IDs'),
      expression: z.string().describe('Okta Expression condition'),
    },
    async ({ name, groupIds, expression }) => {
      try {
        const rule = await client.createGroupRule(name, groupIds, expression);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Group rule created', rule }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_delete_group_rule',
    `Delete a group rule.

Args:
  - ruleId: Rule ID to delete

Returns:
  Confirmation of deletion.`,
    {
      ruleId: z.string().describe('Rule ID'),
    },
    async ({ ruleId }) => {
      try {
        await client.deleteGroupRule(ruleId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Group rule ${ruleId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_activate_group_rule',
    `Activate a group rule.

Args:
  - ruleId: Rule ID

Returns:
  Confirmation of activation.`,
    {
      ruleId: z.string().describe('Rule ID'),
    },
    async ({ ruleId }) => {
      try {
        await client.activateGroupRule(ruleId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Group rule ${ruleId} activated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_deactivate_group_rule',
    `Deactivate a group rule.

Args:
  - ruleId: Rule ID

Returns:
  Confirmation of deactivation.`,
    {
      ruleId: z.string().describe('Rule ID'),
    },
    async ({ ruleId }) => {
      try {
        await client.deactivateGroupRule(ruleId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Group rule ${ruleId} deactivated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
