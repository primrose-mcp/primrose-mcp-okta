/**
 * Policy Tools
 *
 * MCP tools for Okta policy management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import type { OktaPolicyType } from '../types/entities.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const policyTypes = z.enum([
  'OKTA_SIGN_ON',
  'PASSWORD',
  'MFA_ENROLL',
  'OAUTH_AUTHORIZATION_POLICY',
  'IDP_DISCOVERY',
  'ACCESS_POLICY',
  'PROFILE_ENROLLMENT',
]);

/**
 * Register all policy-related tools
 */
export function registerPolicyTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List Policies
  // ===========================================================================
  server.tool(
    'okta_list_policies',
    `List policies of a specific type.

Args:
  - type: Policy type (OKTA_SIGN_ON, PASSWORD, MFA_ENROLL, OAUTH_AUTHORIZATION_POLICY, IDP_DISCOVERY, ACCESS_POLICY, PROFILE_ENROLLMENT)
  - format: Response format

Returns:
  Array of policies.`,
    {
      type: policyTypes.describe('Policy type'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ type, format }) => {
      try {
        const policies = await client.listPolicies(type as OktaPolicyType);
        return formatResponse({ items: policies, count: policies.length, hasMore: false }, format, 'policies');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Policy
  // ===========================================================================
  server.tool(
    'okta_get_policy',
    `Get a policy by ID.

Args:
  - policyId: Policy ID

Returns:
  The policy record.`,
    {
      policyId: z.string().describe('Policy ID'),
    },
    async ({ policyId }) => {
      try {
        const policy = await client.getPolicy(policyId);
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

  // ===========================================================================
  // Create Policy
  // ===========================================================================
  server.tool(
    'okta_create_policy',
    `Create a new policy.

Args:
  - type: Policy type
  - name: Policy name
  - description: Policy description
  - priority: Policy priority (1 is highest)

Returns:
  The created policy.`,
    {
      type: policyTypes.describe('Policy type'),
      name: z.string().describe('Policy name'),
      description: z.string().optional().describe('Policy description'),
      priority: z.number().int().min(1).optional().describe('Policy priority'),
    },
    async ({ type, name, description, priority }) => {
      try {
        const policy = await client.createPolicy(type as OktaPolicyType, name, description, priority);
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

  // ===========================================================================
  // Update Policy
  // ===========================================================================
  server.tool(
    'okta_update_policy',
    `Update a policy.

Args:
  - policyId: Policy ID
  - name: Policy name
  - description: Policy description
  - priority: Policy priority

Returns:
  The updated policy.`,
    {
      policyId: z.string().describe('Policy ID'),
      name: z.string().describe('Policy name'),
      description: z.string().optional().describe('Policy description'),
      priority: z.number().int().min(1).optional().describe('Policy priority'),
    },
    async ({ policyId, name, description, priority }) => {
      try {
        const policy = await client.updatePolicy(policyId, name, description, priority);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Policy updated', policy }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Policy
  // ===========================================================================
  server.tool(
    'okta_delete_policy',
    `Delete a policy.

Args:
  - policyId: Policy ID

Returns:
  Confirmation of deletion.`,
    {
      policyId: z.string().describe('Policy ID'),
    },
    async ({ policyId }) => {
      try {
        await client.deletePolicy(policyId);
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

  // ===========================================================================
  // Activate/Deactivate Policy
  // ===========================================================================
  server.tool(
    'okta_activate_policy',
    `Activate a policy.

Args:
  - policyId: Policy ID

Returns:
  Confirmation of activation.`,
    {
      policyId: z.string().describe('Policy ID'),
    },
    async ({ policyId }) => {
      try {
        await client.activatePolicy(policyId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Policy ${policyId} activated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_deactivate_policy',
    `Deactivate a policy.

Args:
  - policyId: Policy ID

Returns:
  Confirmation of deactivation.`,
    {
      policyId: z.string().describe('Policy ID'),
    },
    async ({ policyId }) => {
      try {
        await client.deactivatePolicy(policyId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Policy ${policyId} deactivated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Policy Rules
  // ===========================================================================
  server.tool(
    'okta_list_policy_rules',
    `List rules for a policy.

Args:
  - policyId: Policy ID

Returns:
  Array of policy rules.`,
    {
      policyId: z.string().describe('Policy ID'),
    },
    async ({ policyId }) => {
      try {
        const rules = await client.listPolicyRules(policyId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ rules, count: rules.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_get_policy_rule',
    `Get a specific policy rule.

Args:
  - policyId: Policy ID
  - ruleId: Rule ID

Returns:
  The policy rule.`,
    {
      policyId: z.string().describe('Policy ID'),
      ruleId: z.string().describe('Rule ID'),
    },
    async ({ policyId, ruleId }) => {
      try {
        const rule = await client.getPolicyRule(policyId, ruleId);
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
    'okta_delete_policy_rule',
    `Delete a policy rule.

Args:
  - policyId: Policy ID
  - ruleId: Rule ID

Returns:
  Confirmation of deletion.`,
    {
      policyId: z.string().describe('Policy ID'),
      ruleId: z.string().describe('Rule ID'),
    },
    async ({ policyId, ruleId }) => {
      try {
        await client.deletePolicyRule(policyId, ruleId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Policy rule ${ruleId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_activate_policy_rule',
    `Activate a policy rule.

Args:
  - policyId: Policy ID
  - ruleId: Rule ID

Returns:
  Confirmation of activation.`,
    {
      policyId: z.string().describe('Policy ID'),
      ruleId: z.string().describe('Rule ID'),
    },
    async ({ policyId, ruleId }) => {
      try {
        await client.activatePolicyRule(policyId, ruleId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Policy rule ${ruleId} activated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'okta_deactivate_policy_rule',
    `Deactivate a policy rule.

Args:
  - policyId: Policy ID
  - ruleId: Rule ID

Returns:
  Confirmation of deactivation.`,
    {
      policyId: z.string().describe('Policy ID'),
      ruleId: z.string().describe('Rule ID'),
    },
    async ({ policyId, ruleId }) => {
      try {
        await client.deactivatePolicyRule(policyId, ruleId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Policy rule ${ruleId} deactivated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
