import * as React from 'react';
import { useAui } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AuiMcpConfigDialog } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { MCP_DEMO_CHANNEL, resetMcpDemo } from '../ui/mcpDemo';
import { ElementPage } from '../ui/Playground';

/** Cuánto espera la pestaña de vuelta a que la demo responda. */
const CALLBACK_WAIT = 4000;

type McpApi = { mcp: () => { server: (q: { id: string }) => { connect: () => Promise<void>; completeAuth: (url: string) => Promise<void> } } };
type AuthMessage = { type: 'callback'; serverId: string; url: string } | { type: 'done'; ok: boolean; message?: string };
const serverIdOf = (url: string) => {
  // El `state` de assistant-ui lleva el id del servidor: «aui-mcp:<base64url>.<nonce>».
  const state = new URL(url).searchParams.get('state') ?? '';
  const encoded = state.replace(/^aui-mcp:/, '').split('.')[0];
  try { return atob(encoded.replace(/-/g, '+').replace(/_/g, '/')); } catch { return ''; }
};

/** Microsoft 365 intenta conectar al abrir la demo (así pide autorización, como en el tablero). Cuando la pestaña de
 * vuelta del proveedor manda la URL, esta pestaña (la que empezó la autorización) la completa: Autorizando… → Conectado. */
function DemoWiring() {
  const aui = useAui() as unknown as McpApi;
  React.useEffect(() => {
    void aui.mcp().server({ id: 'm365' }).connect();
    let channel: BroadcastChannel | undefined;
    try {
      channel = new BroadcastChannel(MCP_DEMO_CHANNEL);
      channel.onmessage = (e: MessageEvent<AuthMessage>) => {
        const msg = e.data;
        if (msg.type !== 'callback') return;
        aui.mcp().server({ id: msg.serverId }).completeAuth(msg.url)
          .then(() => channel?.postMessage({ type: 'done', ok: true } satisfies AuthMessage))
          .catch((err: unknown) => channel?.postMessage({ type: 'done', ok: false, message: err instanceof Error ? err.message : String(err) } satisfies AuthMessage));
      };
    } catch { /* sin BroadcastChannel no hay vuelta entre pestañas */ }
    return () => channel?.close();
  }, [aui]);
  return null;
}

function McpDemo({ height, container }: { height: number | string; container?: React.RefObject<HTMLDivElement> }) {
  const [ready] = React.useState(() => { resetMcpDemo(); return true; });
  // En la página el diálogo arranca abierto dentro del marco; en la tarjeta, el botón lo abre sobre la página.
  const [open, setOpen] = React.useState(Boolean(container));
  if (!ready) return null;
  return (
    <AuiDemoRuntime mcp>
      <DemoWiring />
      <Box ref={container} sx={{ position: 'relative', height, transform: 'translateZ(0)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AuiMcpConfigDialog open={open} onOpenChange={setOpen} DialogProps={container ? { container: () => container.current, disableScrollLock: true, disableEnforceFocus: true } : undefined} />
      </Box>
    </AuiDemoRuntime>
  );
}

export function AuiMcpConfigDoc() {
  const container = React.useRef<HTMLDivElement>(null);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage demoHeight={640} demo={<McpDemo height="100%" container={container} />} />
    </Box>
  );
}

export function AuiMcpConfigCard() {
  return <McpDemo height={212} />;
}

// ——— Las dos páginas del OAuth de ejemplo (se abren en otra pestaña desde «Autorizar») ———

/** Hace de proveedor de identidad: pide el permiso y devuelve el código a la URL de vuelta. */
export function McpAuthorizePage() {
  const params = new URLSearchParams(window.location.search);
  const back = (extra: Record<string, string>) => {
    const url = new URL(params.get('redirect_uri') ?? '/');
    Object.entries({ ...extra, state: params.get('state') ?? '' }).forEach(([k, v]) => url.searchParams.set(k, v));
    window.location.href = url.toString();
  };
  const scopes = (params.get('scope') ?? '').split(' ').filter(Boolean);
  return (
    <Stack alignItems="center" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 3, width: '100%', maxWidth: 400 }}>
        <Typography variant="overline" color="text.secondary">Microsoft 365 · demo</Typography>
        <Typography variant="h6" sx={{ mt: 1 }}>El asistente quiere acceder a tu cuenta</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Permisos: {scopes.join(', ') || 'básicos'}.</Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button color="inherit" onClick={() => back({ error: 'access_denied' })}>Cancelar</Button>
          <Button variant="contained" onClick={() => back({ code: 'codigo-de-ejemplo' })}>Permitir</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}

/** Recibe la vuelta del proveedor y se la pasa a la pestaña de la demo, que completa la autorización. */
export function McpCallbackPage() {
  const [result, setResult] = React.useState<{ ok: boolean; message?: string } | null>(null);
  const [waiting, setWaiting] = React.useState(true);
  React.useEffect(() => {
    const url = window.location.href;
    let channel: BroadcastChannel | undefined;
    const timeout = window.setTimeout(() => setWaiting(false), CALLBACK_WAIT);
    try {
      channel = new BroadcastChannel(MCP_DEMO_CHANNEL);
      channel.onmessage = (e: MessageEvent<AuthMessage>) => { if (e.data.type === 'done') { window.clearTimeout(timeout); setResult(e.data); } };
      channel.postMessage({ type: 'callback', serverId: serverIdOf(url), url } satisfies AuthMessage);
    } catch { setWaiting(false); }
    return () => { window.clearTimeout(timeout); channel?.close(); };
  }, []);
  const text = result
    ? result.ok ? 'Listo: la cuenta quedó autorizada. Puedes cerrar esta pestaña.' : `No se pudo autorizar: ${result.message ?? ''}`
    : waiting ? 'Autorizando…' : 'Abre la demo «MCP config dialog» en otra pestaña y vuelve a autorizar.';
  return (
    <Stack alignItems="center" sx={{ py: 8 }}>
      <Typography variant="body1" color={result && !result.ok ? 'error' : 'text.primary'}>{text}</Typography>
    </Stack>
  );
}
