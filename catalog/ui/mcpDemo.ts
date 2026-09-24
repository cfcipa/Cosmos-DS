// Servidores MCP de ejemplo para la demo del catálogo: un servidor MCP (Streamable HTTP) simulado en el navegador, con
// un conector sin autenticación, uno con OAuth (registro dinámico, autorización y token de ejemplo) y un servidor propio
// que falla la primera vez que conecta. Solo intercepta las URLs de DEMO_HOST; lo demás sale a la red.
import { McpCustomStorage, McpManagerResource, type MCPConnector, type MCPCustomServerRecord, type MCPPersistedAuthState } from '@assistant-ui/react-mcp';

export const DEMO_HOST = 'https://mcp.demo.cosmos';
/** Las pestañas de la demo se avisan por aquí cuando termina una autorización. */
export const MCP_DEMO_CHANNEL = 'cosmos-mcp-demo';
const AUTH_KEY = 'cosmos-mcp-demo-auth:';
const DEMO_TOKEN = 'token-de-ejemplo';
const LATENCY_MS = 900;
const BANK_ERROR = 'No respondió en 30 s. Revisa la URL o la red.';

/** La página del catálogo que hace de proveedor de identidad y la que recibe la vuelta. */
export const authorizeUrl = () => `${window.location.origin}${window.location.pathname}#/mcp-autorizar`;
export const callbackUrl = () => `${window.location.origin}${window.location.pathname}#/mcp-callback`;

export const DEMO_CONNECTORS: MCPConnector[] = [
  { id: 'erp', name: 'Sinco ERP', url: `${DEMO_HOST}/erp`, auth: { type: 'none' } },
  { id: 'm365', name: 'Microsoft 365', url: `${DEMO_HOST}/m365`, auth: { type: 'oauth', scopes: ['Mail.Read', 'Files.Read'] } },
];
const SEED_CUSTOM: MCPCustomServerRecord[] = [
  { id: 'banco', name: 'Extractos bancarios', url: `${DEMO_HOST}/banco`, auth: { type: 'none' }, createdAt: 0 },
];
const TOOLS: Record<string, Array<{ name: string; description: string }>> = {
  erp: [{ name: 'consultar_anticipos', description: 'Anticipos pendientes por responsable.' }, { name: 'crear_comprobante', description: 'Crea un comprobante contable.' }],
  m365: [{ name: 'buscar_correo', description: 'Busca en el correo.' }],
  banco: [{ name: 'leer_extracto', description: 'Movimientos del extracto.' }],
};

let customServers = SEED_CUSTOM;
let bankAttempts = 0;

const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), { ...init, headers: { 'content-type': 'application/json', ...(init.headers ?? {}) } });
const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

type RpcMessage = { jsonrpc: '2.0'; id?: number | string; method: string; params?: { protocolVersion?: string } };
function rpc(server: string, message: RpcMessage) {
  if (message.id === undefined) return undefined;
  const result = message.method === 'initialize'
    ? { protocolVersion: message.params?.protocolVersion ?? '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: server, version: '1.0.0' } }
    : message.method === 'tools/list'
      ? { tools: (TOOLS[server] ?? [{ name: 'eco', description: 'Devuelve lo que recibe.' }]).map((t) => ({ ...t, inputSchema: { type: 'object' } })) }
      : {};
  return { jsonrpc: '2.0', id: message.id, result };
}

async function handle(url: URL, init: RequestInit | undefined, request: Request | undefined): Promise<Response> {
  const method = (init?.method ?? request?.method ?? 'GET').toUpperCase();
  const path = url.pathname;
  const origin = DEMO_HOST;
  // OAuth: metadatos del recurso y del servidor de autorización, registro dinámico y token.
  if (path.startsWith('/.well-known/oauth-protected-resource')) return json({ resource: `${origin}/m365`, authorization_servers: [`${origin}/auth`], scopes_supported: ['Mail.Read', 'Files.Read'] });
  if (path.startsWith('/.well-known/oauth-authorization-server') || path.startsWith('/.well-known/openid-configuration')) {
    return json({
      issuer: `${origin}/auth`, authorization_endpoint: authorizeUrl(), token_endpoint: `${origin}/auth/token`, registration_endpoint: `${origin}/auth/register`,
      response_types_supported: ['code'], grant_types_supported: ['authorization_code', 'refresh_token'], code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
    });
  }
  if (path === '/auth/register') {
    const body = JSON.parse(String(init?.body ?? (await request?.text()) ?? '{}')) as Record<string, unknown>;
    return json({ ...body, client_id: 'cosmos-demo', client_id_issued_at: Math.floor(Date.now() / 1000) }, { status: 201 });
  }
  if (path === '/auth/token') {
    await wait(LATENCY_MS);
    return json({ access_token: DEMO_TOKEN, token_type: 'Bearer', expires_in: 3600, scope: 'Mail.Read Files.Read' });
  }
  const server = path.split('/')[1] ?? '';
  if (method === 'GET') return new Response(null, { status: 405 });
  if (method === 'DELETE') return new Response(null, { status: 200 });
  const headers = new Headers(init?.headers ?? request?.headers);
  if (server === 'm365' && headers.get('authorization') !== `Bearer ${DEMO_TOKEN}`) {
    return new Response(null, { status: 401, headers: { 'www-authenticate': `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource/m365"` } });
  }
  const raw = String(init?.body ?? (await request?.text()) ?? '');
  const parsed = JSON.parse(raw) as RpcMessage | RpcMessage[];
  const messages = Array.isArray(parsed) ? parsed : [parsed];
  if (messages.some((m) => m.method === 'initialize')) {
    await wait(LATENCY_MS);
    if (server === 'banco' && bankAttempts++ === 0) throw new TypeError(BANK_ERROR);
  }
  const replies = messages.map((m) => rpc(server, m)).filter(Boolean);
  if (replies.length === 0) return new Response(null, { status: 202 });
  return json(Array.isArray(parsed) ? replies : replies[0], { headers: { 'mcp-session-id': `demo-${server}` } });
}

let installed = false;
/** Intercepta las llamadas a DEMO_HOST. Idempotente. */
export function installMockMcp() {
  if (installed) return;
  installed = true;
  const real = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : undefined;
    const url = new URL(request ? request.url : String(input));
    if (`${url.protocol}//${url.host}` !== DEMO_HOST) return real(input, init);
    return handle(url, init, request);
  };
}

const readAuth = (id: string): MCPPersistedAuthState | null => {
  try { return JSON.parse(window.localStorage.getItem(AUTH_KEY + id) ?? 'null') as MCPPersistedAuthState | null; } catch { return null; }
};

/** Servidores propios en memoria (vuelven a los del tablero al recargar); la autorización en localStorage, para la pestaña de vuelta. */
export const demoStorage = () => McpCustomStorage({
  scopeId: 'cosmos-mcp-demo',
  async loadCustomServers() { return customServers; },
  async saveCustomServers(records) { customServers = records; },
  async loadAuthState(id) { return readAuth(id); },
  async saveAuthState(id, state) { try { window.localStorage.setItem(AUTH_KEY + id, JSON.stringify(state)); } catch { /* sin almacenamiento, la autorización dura la pestaña */ } },
  async clearAuthState(id) { try { window.localStorage.removeItem(AUTH_KEY + id); } catch { /* nada que limpiar */ } },
});

/** La demo empieza con Microsoft 365 sin autorizar y el servidor del banco sin intentos. */
export function resetMcpDemo() {
  try { window.localStorage.removeItem(AUTH_KEY + 'm365'); } catch { /* nada que limpiar */ }
  customServers = SEED_CUSTOM;
  bankAttempts = 0;
}

export const demoMcpManager = () => McpManagerResource({ connectors: DEMO_CONNECTORS, storage: demoStorage(), oauthRedirectUri: callbackUrl() });
