/**
 * Brand and Domain Tools
 *
 * MCP tools for Okta branding and custom domain management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OktaClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register all brand and domain-related tools
 */
export function registerBrandTools(server: McpServer, client: OktaClient): void {
  // ===========================================================================
  // List Brands
  // ===========================================================================
  server.tool(
    'okta_list_brands',
    `List all brands configured in the org.

Returns:
  Array of brands.`,
    {},
    async () => {
      try {
        const brands = await client.listBrands();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ brands, count: brands.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Brand
  // ===========================================================================
  server.tool(
    'okta_get_brand',
    `Get a brand by ID.

Args:
  - brandId: Brand ID

Returns:
  The brand record.`,
    {
      brandId: z.string().describe('Brand ID'),
    },
    async ({ brandId }) => {
      try {
        const brand = await client.getBrand(brandId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(brand, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Brand
  // ===========================================================================
  server.tool(
    'okta_update_brand',
    `Update brand settings.

Args:
  - brandId: Brand ID
  - customPrivacyPolicyUrl: Custom privacy policy URL
  - removePoweredByOkta: Remove "Powered by Okta" branding

Returns:
  The updated brand.`,
    {
      brandId: z.string().describe('Brand ID'),
      customPrivacyPolicyUrl: z.string().url().optional().describe('Privacy policy URL'),
      removePoweredByOkta: z.boolean().optional().describe('Remove Okta branding'),
    },
    async ({ brandId, customPrivacyPolicyUrl, removePoweredByOkta }) => {
      try {
        const brand = await client.updateBrand(brandId, customPrivacyPolicyUrl, removePoweredByOkta);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Brand updated', brand }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Domains
  // ===========================================================================
  server.tool(
    'okta_list_domains',
    `List all custom domains configured in the org.

Returns:
  Array of domains.`,
    {},
    async () => {
      try {
        const domains = await client.listDomains();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ domains, count: domains.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Domain
  // ===========================================================================
  server.tool(
    'okta_get_domain',
    `Get a custom domain by ID.

Args:
  - domainId: Domain ID

Returns:
  The domain record with DNS and certificate info.`,
    {
      domainId: z.string().describe('Domain ID'),
    },
    async ({ domainId }) => {
      try {
        const domain = await client.getDomain(domainId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(domain, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Domain
  // ===========================================================================
  server.tool(
    'okta_create_domain',
    `Create a custom domain.

Args:
  - domain: Domain name (e.g., "login.example.com")
  - certificateSourceType: MANUAL or OKTA_MANAGED

Returns:
  The created domain with DNS records to configure.`,
    {
      domain: z.string().describe('Domain name'),
      certificateSourceType: z.enum(['MANUAL', 'OKTA_MANAGED']).describe('Certificate source'),
    },
    async ({ domain, certificateSourceType }) => {
      try {
        const createdDomain = await client.createDomain(domain, certificateSourceType);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Domain created', domain: createdDomain }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Domain
  // ===========================================================================
  server.tool(
    'okta_delete_domain',
    `Delete a custom domain.

Args:
  - domainId: Domain ID

Returns:
  Confirmation of deletion.`,
    {
      domainId: z.string().describe('Domain ID'),
    },
    async ({ domainId }) => {
      try {
        await client.deleteDomain(domainId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Domain ${domainId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Verify Domain
  // ===========================================================================
  server.tool(
    'okta_verify_domain',
    `Verify a custom domain's DNS configuration.

Args:
  - domainId: Domain ID

Returns:
  The domain with updated validation status.`,
    {
      domainId: z.string().describe('Domain ID'),
    },
    async ({ domainId }) => {
      try {
        const domain = await client.verifyDomain(domainId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Domain verification initiated', domain }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
