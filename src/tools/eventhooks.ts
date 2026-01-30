/**
 * Event Hook Tools
 *
 * MCP tools for Okta event hook management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register all event hook-related tools
 */
export function registerEventHookTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List Event Hooks
  // ===========================================================================
  server.tool(
    'okta_list_event_hooks',
    `List all event hooks configured in the org.

Returns:
  Array of event hooks.`,
    {},
    async () => {
      try {
        const hooks = await client.listEventHooks();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ hooks, count: hooks.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Event Hook
  // ===========================================================================
  server.tool(
    'okta_get_event_hook',
    `Get an event hook by ID.

Args:
  - eventHookId: Event hook ID

Returns:
  The event hook record.`,
    {
      eventHookId: z.string().describe('Event hook ID'),
    },
    async ({ eventHookId }) => {
      try {
        const hook = await client.getEventHook(eventHookId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(hook, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Event Hook
  // ===========================================================================
  server.tool(
    'okta_create_event_hook',
    `Create an event hook to receive Okta events.

Args:
  - name: Hook name
  - url: Webhook URL to receive events
  - eventTypes: Array of event types to subscribe to (e.g., "user.lifecycle.create")

Returns:
  The created event hook.`,
    {
      name: z.string().describe('Hook name'),
      url: z.string().url().describe('Webhook URL'),
      eventTypes: z.array(z.string()).min(1).describe('Event types to subscribe to'),
    },
    async ({ name, url, eventTypes }) => {
      try {
        const hook = await client.createEventHook(name, url, eventTypes);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Event hook created', hook }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Event Hook
  // ===========================================================================
  server.tool(
    'okta_update_event_hook',
    `Update an event hook.

Args:
  - eventHookId: Event hook ID
  - name: Hook name
  - url: Webhook URL
  - eventTypes: Event types to subscribe to

Returns:
  The updated event hook.`,
    {
      eventHookId: z.string().describe('Event hook ID'),
      name: z.string().describe('Hook name'),
      url: z.string().url().describe('Webhook URL'),
      eventTypes: z.array(z.string()).min(1).describe('Event types'),
    },
    async ({ eventHookId, name, url, eventTypes }) => {
      try {
        const hook = await client.updateEventHook(eventHookId, name, url, eventTypes);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Event hook updated', hook }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Event Hook
  // ===========================================================================
  server.tool(
    'okta_delete_event_hook',
    `Delete an event hook.

Args:
  - eventHookId: Event hook ID

Returns:
  Confirmation of deletion.`,
    {
      eventHookId: z.string().describe('Event hook ID'),
    },
    async ({ eventHookId }) => {
      try {
        await client.deleteEventHook(eventHookId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Event hook ${eventHookId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Lifecycle Operations
  // ===========================================================================
  server.tool(
    'okta_activate_event_hook',
    `Activate an event hook.

Args:
  - eventHookId: Event hook ID

Returns:
  Confirmation of activation.`,
    {
      eventHookId: z.string().describe('Event hook ID'),
    },
    async ({ eventHookId }) => {
      try {
        await client.activateEventHook(eventHookId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Event hook ${eventHookId} activated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_deactivate_event_hook',
    `Deactivate an event hook.

Args:
  - eventHookId: Event hook ID

Returns:
  Confirmation of deactivation.`,
    {
      eventHookId: z.string().describe('Event hook ID'),
    },
    async ({ eventHookId }) => {
      try {
        await client.deactivateEventHook(eventHookId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Event hook ${eventHookId} deactivated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_verify_event_hook',
    `Verify an event hook by sending a verification request.

Args:
  - eventHookId: Event hook ID

Returns:
  The verified event hook.`,
    {
      eventHookId: z.string().describe('Event hook ID'),
    },
    async ({ eventHookId }) => {
      try {
        const hook = await client.verifyEventHook(eventHookId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Event hook verified', hook }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
