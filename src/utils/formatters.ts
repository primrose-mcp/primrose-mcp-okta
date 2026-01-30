/**
 * Response Formatting Utilities
 *
 * Helpers for formatting tool responses in JSON or Markdown.
 */

import type {
  OktaApplication,
  OktaAuthorizationServer,
  OktaFactor,
  OktaGroup,
  OktaLogEvent,
  OktaPolicy,
  OktaUser,
  PaginatedResponse,
  ResponseFormat,
} from '../types/entities.js';
import { OktaApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 * Note: Index signature required for MCP SDK 1.25+ compatibility
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof OktaApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).items)
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');

  lines.push(`**Showing:** ${data.count}`);

  if (data.hasMore) {
    lines.push(`**More available:** Yes (cursor: \`${data.nextCursor}\`)`);
  }
  lines.push('');

  if (data.items.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  switch (entityType) {
    case 'users':
      lines.push(formatUsersTable(data.items as OktaUser[]));
      break;
    case 'groups':
      lines.push(formatGroupsTable(data.items as OktaGroup[]));
      break;
    case 'applications':
      lines.push(formatApplicationsTable(data.items as OktaApplication[]));
      break;
    case 'logs':
      lines.push(formatLogsTable(data.items as OktaLogEvent[]));
      break;
    case 'policies':
      lines.push(formatPoliciesTable(data.items as OktaPolicy[]));
      break;
    case 'authorizationServers':
      lines.push(formatAuthServersTable(data.items as OktaAuthorizationServer[]));
      break;
    case 'factors':
      lines.push(formatFactorsTable(data.items as OktaFactor[]));
      break;
    default:
      lines.push(formatGenericTable(data.items));
  }

  return lines.join('\n');
}

/**
 * Format users as Markdown table
 */
function formatUsersTable(users: OktaUser[]): string {
  const lines: string[] = [];
  lines.push('| ID | Login | Name | Email | Status |');
  lines.push('|---|---|---|---|---|');

  for (const user of users) {
    const name =
      `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || '-';
    lines.push(
      `| ${user.id} | ${user.profile.login} | ${name} | ${user.profile.email || '-'} | ${user.status} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format groups as Markdown table
 */
function formatGroupsTable(groups: OktaGroup[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Type | Description |');
  lines.push('|---|---|---|---|');

  for (const group of groups) {
    const desc = truncate(group.profile.description || '-', 40);
    lines.push(`| ${group.id} | ${group.profile.name} | ${group.type} | ${desc} |`);
  }

  return lines.join('\n');
}

/**
 * Format applications as Markdown table
 */
function formatApplicationsTable(apps: OktaApplication[]): string {
  const lines: string[] = [];
  lines.push('| ID | Label | Name | Status | Sign-On Mode |');
  lines.push('|---|---|---|---|---|');

  for (const app of apps) {
    lines.push(
      `| ${app.id} | ${app.label} | ${app.name} | ${app.status} | ${app.signOnMode || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format logs as Markdown table
 */
function formatLogsTable(logs: OktaLogEvent[]): string {
  const lines: string[] = [];
  lines.push('| Time | Event Type | Actor | Outcome | Message |');
  lines.push('|---|---|---|---|---|');

  for (const log of logs) {
    const time = new Date(log.published).toISOString().substring(0, 19);
    const actor = log.actor?.displayName || log.actor?.alternateId || '-';
    const outcome = log.outcome?.result || '-';
    const message = truncate(log.displayMessage || '-', 40);
    lines.push(`| ${time} | ${log.eventType} | ${actor} | ${outcome} | ${message} |`);
  }

  return lines.join('\n');
}

/**
 * Format policies as Markdown table
 */
function formatPoliciesTable(policies: OktaPolicy[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Type | Status | Priority |');
  lines.push('|---|---|---|---|---|');

  for (const policy of policies) {
    lines.push(
      `| ${policy.id} | ${policy.name} | ${policy.type} | ${policy.status} | ${policy.priority} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format authorization servers as Markdown table
 */
function formatAuthServersTable(servers: OktaAuthorizationServer[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Issuer | Status |');
  lines.push('|---|---|---|---|');

  for (const server of servers) {
    lines.push(`| ${server.id} | ${server.name} | ${server.issuer || '-'} | ${server.status} |`);
  }

  return lines.join('\n');
}

/**
 * Format factors as Markdown table
 */
function formatFactorsTable(factors: OktaFactor[]): string {
  const lines: string[] = [];
  lines.push('| ID | Type | Provider | Status |');
  lines.push('|---|---|---|---|');

  for (const factor of factors) {
    lines.push(
      `| ${factor.id} | ${factor.factorType} | ${factor.provider} | ${factor.status} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5);

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => truncate(String(record[k] ?? '-'), 30));
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  return formatGenericTable(data);
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (camelCase to Title Case)
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Truncate a string to a maximum length
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}
