/**
 * Network Zone Tools
 *
 * MCP tools for Okta network zone management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all network zone-related tools
 */
export function registerNetworkZoneTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List Network Zones
  // ===========================================================================
  server.tool(
    'okta_list_network_zones',
    `List network zones configured in the org.

Args:
  - limit: Number to return (1-200, default: 20)
  - after: Pagination cursor
  - filter: Filter expression
  - format: Response format

Returns:
  Paginated list of network zones.`,
    {
      limit: z.number().int().min(1).max(200).default(20).describe('Number to return'),
      after: z.string().optional().describe('Pagination cursor'),
      filter: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, after, filter, format }) => {
      try {
        const result = await client.listNetworkZones({ limit, after, filter });
        return formatResponse(result, format, 'networkZones');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Network Zone
  // ===========================================================================
  server.tool(
    'okta_get_network_zone',
    `Get a network zone by ID.

Args:
  - zoneId: Zone ID

Returns:
  The network zone record.`,
    {
      zoneId: z.string().describe('Zone ID'),
    },
    async ({ zoneId }) => {
      try {
        const zone = await client.getNetworkZone(zoneId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(zone, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Network Zone
  // ===========================================================================
  server.tool(
    'okta_create_network_zone',
    `Create a network zone (IP-based).

Args:
  - name: Zone name
  - type: Zone type (IP or DYNAMIC)
  - gateways: Array of gateways (for IP zones) with type (CIDR or RANGE) and value

Returns:
  The created network zone.`,
    {
      name: z.string().describe('Zone name'),
      type: z.enum(['IP', 'DYNAMIC']).describe('Zone type'),
      gateways: z.array(z.object({
        type: z.enum(['CIDR', 'RANGE']).describe('Gateway type'),
        value: z.string().describe('IP address, CIDR block, or range'),
      })).optional().describe('Gateway definitions'),
    },
    async ({ name, type, gateways }) => {
      try {
        const zone = await client.createNetworkZone(name, type, gateways);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Network zone created', zone }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Network Zone
  // ===========================================================================
  server.tool(
    'okta_update_network_zone',
    `Update a network zone.

Args:
  - zoneId: Zone ID
  - name: Zone name
  - gateways: Array of gateways with type and value

Returns:
  The updated network zone.`,
    {
      zoneId: z.string().describe('Zone ID'),
      name: z.string().describe('Zone name'),
      gateways: z.array(z.object({
        type: z.enum(['CIDR', 'RANGE']).describe('Gateway type'),
        value: z.string().describe('IP address, CIDR block, or range'),
      })).optional().describe('Gateway definitions'),
    },
    async ({ zoneId, name, gateways }) => {
      try {
        const zone = await client.updateNetworkZone(zoneId, name, gateways);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Network zone updated', zone }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Network Zone
  // ===========================================================================
  server.tool(
    'okta_delete_network_zone',
    `Delete a network zone.

Args:
  - zoneId: Zone ID

Returns:
  Confirmation of deletion.`,
    {
      zoneId: z.string().describe('Zone ID'),
    },
    async ({ zoneId }) => {
      try {
        await client.deleteNetworkZone(zoneId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Network zone ${zoneId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Activate/Deactivate Network Zone
  // ===========================================================================
  server.tool(
    'okta_activate_network_zone',
    `Activate a network zone.

Args:
  - zoneId: Zone ID

Returns:
  Confirmation of activation.`,
    {
      zoneId: z.string().describe('Zone ID'),
    },
    async ({ zoneId }) => {
      try {
        await client.activateNetworkZone(zoneId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Network zone ${zoneId} activated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_deactivate_network_zone',
    `Deactivate a network zone.

Args:
  - zoneId: Zone ID

Returns:
  Confirmation of deactivation.`,
    {
      zoneId: z.string().describe('Zone ID'),
    },
    async ({ zoneId }) => {
      try {
        await client.deactivateNetworkZone(zoneId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Network zone ${zoneId} deactivated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
