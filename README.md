# web-tools MCP

MCP server nhỏ cho Claude Code, cung cấp 2 tool qua local API:

- `web_search`
- `web_fetch`

## Location

```text
/Users/hvckdtnh/.claude/mcp/web-tools/
```

## Runtime

- Node.js 24
- `@modelcontextprotocol/sdk`
- `zod`

## Required env

Claude Code hiện đang đọc các biến này từ `~/.claude/settings.json`:

- `ANTHROPIC_BASE_URL` — mặc định `http://localhost:20128/v1`
- `ANTHROPIC_AUTH_TOKEN` — bearer token cho local API

Nếu thiếu `ANTHROPIC_AUTH_TOKEN`, tool call sẽ fail.

## Tools

### `web_search`

Input:

- `query` string
- `max_results` number, default `5`
- `search_type` string, default `web`
- `model` string, default `tavily`

Gọi `POST /search`.

### `web_fetch`

Input:

- `url` string
- `format` string, default `markdown`
- `max_characters` number, default `0`
- `model` string, default `tavily`

Gọi `POST /web/fetch`.

## Test

```bash
npm test --prefix /Users/hvckdtnh/.claude/mcp/web-tools
```

## Claude Code registration

Đã add ở user scope với tên `web-tools`.

Kiểm tra:

```bash
claude mcp get web-tools
```

Gỡ:

```bash
claude mcp remove "web-tools" -s user
```
