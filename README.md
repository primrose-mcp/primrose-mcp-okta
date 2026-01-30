# Okta MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/okta)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for the Okta API. This server enables AI assistants to interact with Okta identity and access management, managing users, groups, applications, and security policies.

## Features

- **Applications** - Manage application integrations
- **Authenticators** - Configure MFA authenticators
- **Authorization Servers** - Manage OAuth authorization servers
- **Brands** - Customize branding settings
- **Event Hooks** - Configure event hooks
- **Factors** - Manage user MFA factors
- **Features** - Toggle Okta features
- **Groups** - Manage user groups
- **Identity Providers** - Configure external IdPs
- **Logs** - Query system and audit logs
- **Network Zones** - Define network zones
- **Policies** - Manage security policies
- **Sessions** - Manage user sessions
- **Trusted Origins** - Configure CORS origins
- **Users** - Full user lifecycle management

## Quick Start

The easiest way to get started is using the [Primrose SDK](https://github.com/primrose-ai/primrose-mcp):

```bash
npm install primrose-mcp
```

```typescript
import { createMCPClient } from 'primrose-mcp';

const client = createMCPClient('okta', {
  headers: {
    'X-Okta-Domain': 'dev-12345678',
    'X-Okta-API-Token': 'your-api-token'
  }
});
```

## Manual Installation

Clone and install dependencies:

```bash
git clone https://github.com/primrose-ai/primrose-mcp-okta.git
cd primrose-mcp-okta
npm install
```

## Configuration

### Required Headers

| Header | Description |
|--------|-------------|
| `X-Okta-Domain` | Your Okta domain (e.g., "dev-12345678" or full URL) |
| `X-Okta-API-Token` | SSWS API token |

### Optional Headers

| Header | Description |
|--------|-------------|
| `X-Okta-Base-URL` | Override the default Okta API base URL |

### Getting Your API Token

1. Log into your Okta Admin Console
2. Navigate to Security > API > Tokens
3. Click "Create Token"
4. Copy the token value (it won't be shown again)

## Available Tools

### User Tools
- `okta_list_users` - List all users with filters
- `okta_get_user` - Get user details
- `okta_create_user` - Create a new user
- `okta_update_user` - Update user profile
- `okta_delete_user` - Deactivate and delete a user
- `okta_activate_user` - Activate a staged user
- `okta_deactivate_user` - Deactivate a user
- `okta_suspend_user` - Suspend a user
- `okta_unsuspend_user` - Unsuspend a user
- `okta_reset_password` - Reset user password

### Group Tools
- `okta_list_groups` - List all groups
- `okta_get_group` - Get group details
- `okta_create_group` - Create a new group
- `okta_update_group` - Update group settings
- `okta_delete_group` - Delete a group
- `okta_list_group_members` - List group members
- `okta_add_user_to_group` - Add user to a group
- `okta_remove_user_from_group` - Remove user from a group

### Application Tools
- `okta_list_applications` - List all applications
- `okta_get_application` - Get application details
- `okta_create_application` - Create an application
- `okta_update_application` - Update application settings
- `okta_delete_application` - Delete an application
- `okta_activate_application` - Activate an application
- `okta_deactivate_application` - Deactivate an application

### Factor Tools
- `okta_list_factors` - List enrolled factors for a user
- `okta_enroll_factor` - Enroll a new factor
- `okta_verify_factor` - Verify a factor
- `okta_delete_factor` - Delete an enrolled factor

### Policy Tools
- `okta_list_policies` - List policies by type
- `okta_get_policy` - Get policy details
- `okta_create_policy` - Create a new policy
- `okta_update_policy` - Update policy settings
- `okta_delete_policy` - Delete a policy

### Log Tools
- `okta_list_logs` - Query system logs with filters

### Identity Provider Tools
- `okta_list_idps` - List identity providers
- `okta_get_idp` - Get IdP details
- `okta_create_idp` - Create an IdP

### Network Zone Tools
- `okta_list_zones` - List network zones
- `okta_create_zone` - Create a network zone

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint
```

## Related Resources

- [Primrose SDK](https://github.com/primrose-ai/primrose-mcp) - Unified SDK for all Primrose MCP servers
- [Okta API Documentation](https://developer.okta.com/docs/reference/)
- [Okta Developer Portal](https://developer.okta.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
