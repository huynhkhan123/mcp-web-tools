# MCP Web Tools for Claude Code

A lightweight Claude Code MCP server that adds `web_search` and `web_fetch` tools backed by a local Tavily-compatible API.

> MCP nhỏ gọn cho Claude Code, cung cấp tool tìm kiếm và đọc nội dung web thông qua local API.

## Features

- Two MCP tools: `web_search` and `web_fetch`
- Simple stdio server built with Node.js
- Designed for Claude Code user-scope registration
- Uses a local API endpoint instead of direct third-party calls
- Lightweight test coverage for request handling and error paths

## Requirements

Before using this project, make sure you have:

- Node.js 24 or newer
- Claude Code installed
- A local API compatible with:
  - `POST /search`
  - `POST /web/fetch`
- `ANTHROPIC_AUTH_TOKEN` configured

Default API base URL:

```text
http://localhost:20128/v1
```

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/huynhkhan123/mcp-web-tools.git
cd mcp-web-tools
npm install
```

Register the MCP server in Claude Code:

```bash
claude mcp add --scope user web-tools -- node /absolute/path/to/mcp-web-tools/server.mjs
```

Check that Claude Code sees the server:

```bash
claude mcp get web-tools
```

> Nếu MCP chưa hiện ngay trong session hiện tại, hãy restart Claude Code rồi kiểm tra lại.

## Configuration

This MCP server reads its configuration from environment variables.

### `ANTHROPIC_BASE_URL`

Optional. Defaults to:

```text
http://localhost:20128/v1
```

### `ANTHROPIC_AUTH_TOKEN`

Required. Used as:

```http
Authorization: Bearer <token>
```

In Claude Code, these variables are commonly set in:

```text
~/.claude/settings.json
```

Example:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:20128/v1",
    "ANTHROPIC_AUTH_TOKEN": "your-token-here"
  }
}
```

## Tool Reference

### `web_search`

Search the web through the local API.

**Parameters**

- `query` (`string`, required)
- `max_results` (`number`, optional, default: `5`)
- `search_type` (`string`, optional, default: `web`)
- `model` (`string`, optional, default: `tavily`)

**Endpoint**

```text
POST /search
```

**Example request body**

```json
{
  "model": "tavily",
  "query": "latest AI news",
  "search_type": "web",
  "max_results": 5
}
```

### `web_fetch`

Fetch and convert a web page through the local API.

**Parameters**

- `url` (`string`, required)
- `format` (`string`, optional, default: `markdown`)
- `max_characters` (`number`, optional, default: `0`)
- `model` (`string`, optional, default: `tavily`)

**Endpoint**

```text
POST /web/fetch
```

**Example request body**

```json
{
  "model": "tavily",
  "url": "https://example.com",
  "format": "markdown",
  "max_characters": 1000
}
```

## Usage Notes

- `web_search` is best for discovery and finding URLs.
- `web_fetch` is best for pulling readable page content after you already know the URL.
- Both tools return JSON text content back to Claude Code.

> Gợi ý: dùng `web_search` để tìm nguồn trước, sau đó dùng `web_fetch` để lấy nội dung chi tiết từ URL phù hợp.

## Development

Project files:

- `server.mjs` — MCP server and tool handlers
- `test.mjs` — test coverage for request building and error handling
- `package.json` — package metadata and scripts

Run tests:

```bash
npm test
```

## Troubleshooting

### `ANTHROPIC_AUTH_TOKEN is required`

Your Claude Code environment does not have the token configured. Add it to `~/.claude/settings.json` and restart Claude Code if needed.

### MCP server does not appear in Claude Code

Re-run:

```bash
claude mcp get web-tools
```

If it was added successfully but is not visible in the current session, restart Claude Code.

### Upstream API returns non-JSON or error status

This MCP expects standard JSON responses from the local `/search` and `/web/fetch` endpoints. If the upstream service returns HTML, SSE, or proxy errors, the MCP will surface that response as an error.

## Notes

This repository focuses only on a small Claude Code MCP integration for local web search and fetch. It does not include hosted infrastructure, deployment automation, or additional providers.
