#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

export function normalizeBaseUrl(baseUrl) {
  return (baseUrl || 'http://localhost:20128/v1').replace(/\/+$/, '');
}

export async function callLocalApi({ baseUrl, token, path, body, fetchImpl = fetch }) {
  if (!token) {
    throw new Error('ANTHROPIC_AUTH_TOKEN is required');
  }

  const response = await fetchImpl(`${normalizeBaseUrl(baseUrl)}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Local API request failed: ${response.status} ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Local API returned invalid JSON: ${text}`);
  }
}

function jsonText(data) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function createServer() {
  const server = new McpServer({
    name: 'web-tools',
    version: '1.0.0',
  });

  server.registerTool(
    'web_search',
    {
      title: 'Web search',
      description: 'Search the web using the local Tavily-backed API.',
      inputSchema: {
        query: z.string().min(1),
        max_results: z.number().int().positive().default(5),
        search_type: z.string().default('web'),
        model: z.string().default('tavily'),
      },
    },
    async ({ query, max_results = 5, search_type = 'web', model = 'tavily' }) => {
      const data = await callLocalApi({
        baseUrl: process.env.ANTHROPIC_BASE_URL,
        token: process.env.ANTHROPIC_AUTH_TOKEN,
        path: '/search',
        body: { model, query, search_type, max_results },
      });

      return jsonText(data);
    },
  );

  server.registerTool(
    'web_fetch',
    {
      title: 'Web fetch',
      description: 'Fetch a URL as markdown using the local Tavily-backed API.',
      inputSchema: {
        url: z.string().url(),
        format: z.string().default('markdown'),
        max_characters: z.number().int().nonnegative().default(0),
        model: z.string().default('tavily'),
      },
    },
    async ({ url, format = 'markdown', max_characters = 0, model = 'tavily' }) => {
      const data = await callLocalApi({
        baseUrl: process.env.ANTHROPIC_BASE_URL,
        token: process.env.ANTHROPIC_AUTH_TOKEN,
        path: '/web/fetch',
        body: { model, url, format, max_characters },
      });

      return jsonText(data);
    },
  );

  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
