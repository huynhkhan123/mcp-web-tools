import assert from 'node:assert/strict';
import { callLocalApi, normalizeBaseUrl } from './server.mjs';

assert.equal(normalizeBaseUrl(undefined), 'http://localhost:20128/v1');
assert.equal(normalizeBaseUrl('http://localhost:20128/v1/'), 'http://localhost:20128/v1');

await assert.rejects(
  () => callLocalApi({
    baseUrl: 'http://localhost:20128/v1',
    token: '',
    path: '/search',
    body: { model: 'tavily', query: 'AI', search_type: 'web', max_results: 5 },
    fetchImpl: async () => { throw new Error('should not call fetch'); }
  }),
  /ANTHROPIC_AUTH_TOKEN is required/
);

const calls = [];
const searchResult = await callLocalApi({
  baseUrl: 'http://localhost:20128/v1/',
  token: 'secret-token',
  path: '/search',
  body: { model: 'tavily', query: 'AI', search_type: 'web', max_results: 5 },
  fetchImpl: async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ results: [{ title: 'T', url: 'https://example.com', snippet: 'S' }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  }
});

assert.deepEqual(searchResult, { results: [{ title: 'T', url: 'https://example.com', snippet: 'S' }] });
assert.equal(calls[0].url, 'http://localhost:20128/v1/search');
assert.equal(calls[0].init.method, 'POST');
assert.equal(calls[0].init.headers.Authorization, 'Bearer secret-token');
assert.equal(calls[0].init.headers['Content-Type'], 'application/json');
assert.deepEqual(JSON.parse(calls[0].init.body), {
  model: 'tavily',
  query: 'AI',
  search_type: 'web',
  max_results: 5
});

await assert.rejects(
  () => callLocalApi({
    baseUrl: 'http://localhost:20128/v1',
    token: 'secret-token',
    path: '/web/fetch',
    body: { model: 'tavily', url: 'https://example.com', format: 'markdown', max_characters: 0 },
    fetchImpl: async () => new Response('upstream failed', { status: 500 })
  }),
  /Local API request failed: 500 upstream failed/
);

await assert.rejects(
  () => callLocalApi({
    baseUrl: 'http://localhost:20128/v1',
    token: 'secret-token',
    path: '/web/fetch',
    body: { model: 'tavily', url: 'https://example.com', format: 'markdown', max_characters: 0 },
    fetchImpl: async () => new Response('not-json', { status: 200 })
  }),
  /Local API returned invalid JSON/
);

console.log('All tests passed');
