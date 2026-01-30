/**
 * User Tools
 *
 * MCP tools for Okta user management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all user-related tools
 */
export function registerUserTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List Users
  // ===========================================================================
  server.tool(
    'okta_list_users',
    `List users from Okta with pagination and filtering.

Args:
  - limit: Number of users to return (1-200, default: 20)
  - after: Pagination cursor from previous response
  - search: Search expression (e.g., 'profile.email eq "john@example.com"')
  - filter: Filter expression (e.g., 'status eq "ACTIVE"')
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of users with their profiles and status.`,
    {
      limit: z.number().int().min(1).max(200).default(20).describe('Number of users to return'),
      after: z.string().optional().describe('Pagination cursor'),
      search: z.string().optional().describe('Search expression'),
      filter: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ limit, after, search, filter, format }) => {
      try {
        const result = await client.listUsers({ limit, after, search, filter });
        return formatResponse(result, format, 'users');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get User
  // ===========================================================================
  server.tool(
    'okta_get_user',
    `Get a single user by ID or login.

Args:
  - userId: The user ID or login (email)
  - format: Response format

Returns:
  The user record with profile, status, and credentials info.`,
    {
      userId: z.string().describe('User ID or login'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ userId, format }) => {
      try {
        const user = await client.getUser(userId);
        return formatResponse(user, format, 'user');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create User
  // ===========================================================================
  server.tool(
    'okta_create_user',
    `Create a new user in Okta.

Args:
  - firstName: First name (required)
  - lastName: Last name (required)
  - email: Email address (required)
  - login: Login/username (required, usually email)
  - mobilePhone: Mobile phone number
  - secondEmail: Secondary email
  - password: Initial password (optional, if not set user will need to set on first login)
  - groupIds: Array of group IDs to add user to
  - activate: Whether to activate the user immediately (default: true)

Returns:
  The created user record.`,
    {
      firstName: z.string().describe('First name'),
      lastName: z.string().describe('Last name'),
      email: z.string().email().describe('Email address'),
      login: z.string().describe('Login (usually email)'),
      mobilePhone: z.string().optional().describe('Mobile phone'),
      secondEmail: z.string().email().optional().describe('Secondary email'),
      password: z.string().optional().describe('Initial password'),
      groupIds: z.array(z.string()).optional().describe('Group IDs to add user to'),
      activate: z.boolean().default(true).describe('Activate user immediately'),
    },
    async ({ firstName, lastName, email, login, mobilePhone, secondEmail, password, groupIds, activate }) => {
      try {
        const input = {
          profile: {
            firstName,
            lastName,
            email,
            login,
            mobilePhone,
            secondEmail,
          },
          credentials: password ? { password: { value: password } } : undefined,
          groupIds,
        };
        const user = await client.createUser(input, activate);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'User created', user }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update User
  // ===========================================================================
  server.tool(
    'okta_update_user',
    `Update an existing user's profile.

Args:
  - userId: User ID to update
  - profile: Profile fields to update (firstName, lastName, email, etc.)

Returns:
  The updated user record.`,
    {
      userId: z.string().describe('User ID'),
      profile: z.record(z.string(), z.unknown()).describe('Profile fields to update'),
    },
    async ({ userId, profile }) => {
      try {
        const user = await client.updateUser(userId, profile);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'User updated', user }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete User
  // ===========================================================================
  server.tool(
    'okta_delete_user',
    `Delete a user from Okta. Note: User must be deactivated first.

Args:
  - userId: User ID to delete
  - sendEmail: Send email notification

Returns:
  Confirmation of deletion.`,
    {
      userId: z.string().describe('User ID'),
      sendEmail: z.boolean().default(false).describe('Send email notification'),
    },
    async ({ userId, sendEmail }) => {
      try {
        await client.deleteUser(userId, sendEmail);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User ${userId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // User Lifecycle Operations
  // ===========================================================================
  server.tool(
    'okta_activate_user',
    `Activate a staged or deprovisioned user.

Args:
  - userId: User ID to activate
  - sendEmail: Send activation email (default: true)

Returns:
  The activated user record or activation token.`,
    {
      userId: z.string().describe('User ID'),
      sendEmail: z.boolean().default(true).describe('Send activation email'),
    },
    async ({ userId, sendEmail }) => {
      try {
        const result = await client.activateUser(userId, sendEmail);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'User activated', result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_deactivate_user',
    `Deactivate an active user. Warning: This is destructive - user is deprovisioned from all apps.

Args:
  - userId: User ID to deactivate
  - sendEmail: Send notification email

Returns:
  Confirmation of deactivation.`,
    {
      userId: z.string().describe('User ID'),
      sendEmail: z.boolean().default(false).describe('Send notification email'),
    },
    async ({ userId, sendEmail }) => {
      try {
        await client.deactivateUser(userId, sendEmail);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User ${userId} deactivated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_suspend_user',
    `Suspend an active user. Suspended users cannot sign in but retain group/app assignments.

Args:
  - userId: User ID to suspend

Returns:
  Confirmation of suspension.`,
    {
      userId: z.string().describe('User ID'),
    },
    async ({ userId }) => {
      try {
        await client.suspendUser(userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User ${userId} suspended` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_unsuspend_user',
    `Unsuspend a suspended user, returning them to active status.

Args:
  - userId: User ID to unsuspend

Returns:
  Confirmation of unsuspension.`,
    {
      userId: z.string().describe('User ID'),
    },
    async ({ userId }) => {
      try {
        await client.unsuspendUser(userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User ${userId} unsuspended` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_unlock_user',
    `Unlock a locked-out user.

Args:
  - userId: User ID to unlock

Returns:
  Confirmation of unlock.`,
    {
      userId: z.string().describe('User ID'),
    },
    async ({ userId }) => {
      try {
        await client.unlockUser(userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User ${userId} unlocked` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_reset_password',
    `Reset a user's password.

Args:
  - userId: User ID
  - sendEmail: Send password reset email (default: true)

Returns:
  Reset password URL (if sendEmail is false).`,
    {
      userId: z.string().describe('User ID'),
      sendEmail: z.boolean().default(true).describe('Send reset email'),
    },
    async ({ userId, sendEmail }) => {
      try {
        const result = await client.resetPassword(userId, sendEmail);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Password reset initiated', ...result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_expire_password',
    `Expire a user's password, forcing them to change it on next login.

Args:
  - userId: User ID

Returns:
  The updated user record.`,
    {
      userId: z.string().describe('User ID'),
    },
    async ({ userId }) => {
      try {
        const user = await client.expirePassword(userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Password expired', user }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_set_user_password',
    `Set a user's password directly.

Args:
  - userId: User ID
  - password: New password

Returns:
  Confirmation of password change.`,
    {
      userId: z.string().describe('User ID'),
      password: z.string().describe('New password'),
    },
    async ({ userId, password }) => {
      try {
        await client.setUserPassword(userId, password);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Password set successfully' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // User Groups and Apps
  // ===========================================================================
  server.tool(
    'okta_list_user_groups',
    `List all groups a user belongs to.

Args:
  - userId: User ID

Returns:
  Array of groups.`,
    {
      userId: z.string().describe('User ID'),
    },
    async ({ userId }) => {
      try {
        const groups = await client.listUserGroups(userId);
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

  server.tool(
    'okta_list_user_apps',
    `List all applications assigned to a user.

Args:
  - userId: User ID

Returns:
  Array of app links.`,
    {
      userId: z.string().describe('User ID'),
    },
    async ({ userId }) => {
      try {
        const apps = await client.listUserApps(userId);
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
}
