// Cosmos DS · Kit IA · AUI connected (Sinco): Assistant panel.
// Referente: el tablero «Assistant panel», sobre las primitivas de assistant-ui (el hilo, la lista de hilos).
// El asistente de una pantalla de Sinco vive en tres superficies: flotante (sobre la pantalla, se cierra con Esc o al
// hacer clic fuera), lateral (junto a la pantalla, que sigue usable) y pantalla completa (Esc vuelve al lateral).
// Cerrado queda la píldora (Floating composer). El encabezado cambia de chat (buscador y chats anteriores), abre uno
// nuevo o con un asistente (Tesorería, Cuentas por pagar…), copia el ID del chat y cambia de superficie.
// `AuiAssistantProvider` guarda la superficie para que la pantalla anfitriona pueda abrir el asistente (Ask AI).
import * as React from 'react';
import { useAssistantInstructions, useAui, useAuiState } from '@assistant-ui/react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, keyframes, type Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { ChevronDown, Copy, Maximize2, Minimize2, MoreVertical, PanelRight, Search, SquarePen, X } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { AuiIconButton } from './AuiIconButton';
import { AuiThread, type AuiThreadProps } from './Thread';

export type AuiAssistantSurface = 'closed' | 'float' | 'side' | 'full';

type AssistantContextValue = {
  surface: AuiAssistantSurface;
  setSurface: (s: AuiAssistantSurface) => void;
  /** Abre el asistente (flotante si estaba cerrado; si ya estaba abierto, lo deja donde está) y enfoca el composer. */
  open: () => void;
  /** Cambia cada vez que algo pide el foco del composer. */
  focusTick: number;
  close: () => void;
  /** El asistente elegido para cada chat. */
  agentFor: (threadId: string) => string | undefined;
  setAgent: (threadId: string, agent: string | undefined) => void;
};

const AssistantContext = React.createContext<AssistantContextValue | null>(null);

/** La superficie del asistente, para abrirlo desde la pantalla. null fuera de `AuiAssistantProvider`. */
export function useAuiAssistant() {
  return React.useContext(AssistantContext);
}

export interface AuiAssistantProviderProps {
  surface?: AuiAssistantSurface;
  defaultSurface?: AuiAssistantSurface;
  onSurfaceChange?: (s: AuiAssistantSurface) => void;
  children: React.ReactNode;
}

export function AuiAssistantProvider({ surface: surfaceProp, defaultSurface = 'closed', onSurfaceChange, children }: AuiAssistantProviderProps) {
  const [own, setOwn] = React.useState(defaultSurface);
  const surface = surfaceProp ?? own;
  const change = React.useRef(onSurfaceChange);
  change.current = onSurfaceChange;
  const [agents, setAgents] = React.useState<ReadonlyMap<string, string>>(() => new Map());
  const [focusTick, setFocusTick] = React.useState(0);
  const value = React.useMemo<AssistantContextValue>(() => {
    const setSurface = (s: AuiAssistantSurface) => { if (surfaceProp === undefined) setOwn(s); change.current?.(s); };
    return {
      surface,
      setSurface,
      open: () => { if (surface === 'closed') setSurface('float'); setFocusTick((n) => n + 1); },
      focusTick,
      close: () => setSurface('closed'),
      agentFor: (id) => agents.get(id),
      setAgent: (id, agent) => setAgents((prev) => { const next = new Map(prev); if (agent) next.set(id, agent); else next.delete(id); return next; }),
    };
  }, [surface, surfaceProp, agents, focusTick]);
  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

/** Medidas del tablero: flotante de 480 × 600 a 24px del borde; lateral de 400px; encabezado de 44px; pantalla completa
 * con el contenido a 760px. La píldora y su vista previa miden 440px. */
const FLOAT_WIDTH = 60;
const FLOAT_HEIGHT = 75;
const FLOAT_INSET = 10;
const SIDE_WIDTH = 50;
const HEADER = 5.5;
const HEADER_BUTTON = 3.5;
const HEADER_ICON = 16;
const FULL_MAX_WIDTH = 95;
const EDGE = 3;
export const AUI_DOCK_WIDTH = 55;
/** Lo que la pantalla deja libre abajo para que la píldora no tape contenido. */
const DOCK_CLEARANCE = 14;
const MENU_WIDTH = 35;
const ITEM_AVATAR = 3;
const OPEN_EASE = 'cubic-bezier(.32,.72,0,1)';

const floatIn = keyframes`from { opacity: 0; transform: translateX(-50%) translateY(12px) scale(.98); } to { opacity: 1; transform: translateX(-50%); }`;
const sideIn = keyframes`from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; }`;
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

/**
 * La pantalla con su asistente: el contenido a la izquierda, el panel lateral a la derecha, y encima el flotante, la
 * pantalla completa o, cerrado, el `dock` (la píldora con la vista previa). Un clic en la pantalla cierra el flotante.
 */
export function AuiAssistantLayout({ children, panel, dock, sx }: { children: React.ReactNode; panel: React.ReactNode; dock?: React.ReactNode; sx?: SxProps<Theme> }) {
  const assistant = useAuiAssistant();
  const surface = assistant?.surface ?? 'closed';
  return (
    <Box data-slot="aui-assistant-layout" data-surface={surface} sx={[{ position: 'relative', display: 'flex', height: '100%', minHeight: 0, overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Box
        data-slot="aui-assistant-host"
        onPointerDown={() => { if (surface === 'float') assistant?.close(); }}
        sx={{ position: 'relative', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'auto', pb: dock && surface === 'closed' ? DOCK_CLEARANCE : 0 }}
      >
        {children}
      </Box>
      {panel}
      {dock ? (
        // Siempre montado (oculto con el asistente abierto): la vista previa recuerda qué respuesta ya mostró.
        <Box data-slot="aui-assistant-dock" hidden={surface !== 'closed'} sx={(t) => ({ position: 'absolute', left: '50%', bottom: t.spacing(EDGE), zIndex: t.zIndex.speedDial, width: t.spacing(AUI_DOCK_WIDTH), maxWidth: `calc(100% - ${t.spacing(4)})`, transform: 'translateX(-50%)', '&[hidden]': { display: 'none' } })}>
          {dock}
        </Box>
      ) : null}
    </Box>
  );
}

export type AuiAssistantAgent = { id: string; name: string; color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' };

export interface AuiAssistantPanelProps extends Pick<AuiThreadProps, 'autoFocus' | 'empty' | 'components' | 'quotes' | 'messageTiming' | 'triggers' | 'directives' | 'modelSelector' | 'modelContextWindow' | 'conversationMap' | 'followupSend' | 'waiting'> {
  /** Los asistentes del menú «Nuevo chat». */
  agents?: readonly AuiAssistantAgent[];
  /** Default 'Las respuestas se generan con IA y pueden contener errores.' */
  disclaimer?: string;
  /** El composer del chat vacío. Default '¿Por dónde empezamos?'. */
  placeholder?: string;
  /** El composer con mensajes. Default '¿Qué hacemos ahora?'. */
  followupPlaceholder?: string;
}

export const AUI_ASSISTANT_PLACEHOLDER = '¿Por dónde empezamos?';
export const AUI_ASSISTANT_FOLLOWUP_PLACEHOLDER = '¿Qué hacemos ahora?';

export function AuiAssistantPanel({
  agents = [], disclaimer = 'Las respuestas se generan con IA y pueden contener errores.', placeholder = AUI_ASSISTANT_PLACEHOLDER,
  followupPlaceholder = AUI_ASSISTANT_FOLLOWUP_PLACEHOLDER, ...thread
}: AuiAssistantPanelProps) {
  const assistant = useAuiAssistant();
  const surface = assistant?.surface ?? 'float';
  const threadId = useAuiState((s) => s.threads.mainThreadId);
  const hasMessages = useAuiState((s) => s.thread.messages.length > 0);
  const agent = assistant?.agentFor(threadId);
  useAssistantInstructions({ instruction: agent ? `Respondes como el asistente de ${agent}.` : '', disabled: !agent });
  const panelRef = React.useRef<HTMLElement>(null);
  const focusTick = assistant?.focusTick ?? 0;
  // Al abrir desde fuera (Ask AI) y al cambiar de superficie, el foco va al composer; al montar lo pone el hilo.
  const last = React.useRef({ focusTick, surface });
  React.useEffect(() => {
    const prev = last.current;
    last.current = { focusTick, surface };
    if (prev.focusTick === focusTick && prev.surface === surface) return undefined;
    const id = window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLTextAreaElement>('[data-slot="aui-composer"] textarea')?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [focusTick, surface]);
  if (surface === 'closed') return null;
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    e.preventDefault();
    assistant?.setSurface(surface === 'full' ? 'side' : 'closed');
  };
  return (
    <Paper
      ref={panelRef}
      component="section"
      aria-label="Asistente"
      data-slot="aui-assistant-panel"
      data-surface={surface}
      elevation={surface === 'float' ? 8 : 0}
      square={surface !== 'float'}
      onKeyDown={onKeyDown}
      sx={(t) => ({
        display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: t.zIndex.speedDial + 1,
        ...(surface === 'float' && {
          position: 'absolute', left: '50%', bottom: t.spacing(EDGE), width: t.spacing(FLOAT_WIDTH), maxWidth: `calc(100% - ${t.spacing(4)})`,
          height: t.spacing(FLOAT_HEIGHT), maxHeight: `calc(100% - ${t.spacing(FLOAT_INSET)})`, transform: 'translateX(-50%)', transformOrigin: 'bottom center',
          border: 1, borderColor: 'divider', animation: `${floatIn} ${t.transitions.duration.enteringScreen}ms ${OPEN_EASE} both`,
        }),
        ...(surface === 'side' && {
          position: 'relative', flex: `0 0 ${t.spacing(SIDE_WIDTH)}`, borderLeft: 1, borderColor: 'divider',
          animation: `${sideIn} ${t.transitions.duration.enteringScreen}ms ${OPEN_EASE} both`,
        }),
        ...(surface === 'full' && {
          position: 'absolute', inset: 0, animation: `${fadeIn} ${t.transitions.duration.shorter}ms ease-out both`,
          '& [data-slot="aui-thread-viewport"] > div': { maxWidth: t.spacing(FULL_MAX_WIDTH) },
        }),
        [REDUCED_MOTION]: { animation: 'none' },
      })}
    >
      <PanelHeader agents={agents} surface={surface} />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <AuiThread
          {...thread}
          disclaimer={disclaimer}
          placeholder={hasMessages ? followupPlaceholder : agent ? `Pregunta a ${agent}…` : placeholder}
        />
      </Box>
    </Paper>
  );
}

const headerButtonSx = { '& svg': { width: HEADER_ICON, height: HEADER_ICON }, '&[aria-expanded="true"]': { bgcolor: (t: Theme) => alpha(t.palette.primary.main, t.palette.action.selectedOpacity), color: 'primary.main' } };

function PanelHeader({ agents, surface }: { agents: readonly AuiAssistantAgent[]; surface: Exclude<AuiAssistantSurface, 'closed'> }) {
  const assistant = useAuiAssistant();
  const aui = useAui();
  const threadId = useAuiState((s) => s.threads.mainThreadId);
  // Sin título generado, el chat se llama como su primera pregunta.
  const title = useAuiState((s) => s.threadListItem.title || firstUserText(s.thread.messages));
  const agent = assistant?.agentFor(threadId);
  const [menu, setMenu] = React.useState<{ kind: 'chats' | 'new' | 'more'; anchor: HTMLElement } | null>(null);
  const [copied, setCopied] = React.useState(false);
  const pendingAgent = React.useRef<string | null>(null);
  const openMenu = (kind: 'chats' | 'new' | 'more') => (e: React.MouseEvent<HTMLElement>) => setMenu({ kind, anchor: e.currentTarget });
  const closeMenu = () => setMenu(null);
  const threads = aui as unknown as { threads: () => { switchToNewThread: () => void; switchToThread: (id: string) => void } };

  React.useEffect(() => {
    if (pendingAgent.current === null) return;
    assistant?.setAgent(threadId, pendingAgent.current);
    pendingAgent.current = null;
    // Solo cuando llega el hilo nuevo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const newChat = (withAgent?: string) => {
    closeMenu();
    pendingAgent.current = withAgent ?? null;
    threads.threads().switchToNewThread();
  };
  const copyId = () => {
    closeMenu();
    void navigator.clipboard?.writeText(threadId).catch(() => undefined);
    setCopied(true);
  };
  const toSurface = (s: AuiAssistantSurface) => assistant?.setSurface(s);
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={(t) => ({ height: t.spacing(HEADER), flexShrink: 0, pl: 0.75, pr: 1, borderBottom: 1, borderColor: 'divider' })}>
      <Button
        color="inherit"
        size="small"
        endIcon={<ChevronDown size={HEADER_ICON} />}
        aria-haspopup="menu"
        aria-expanded={menu?.kind === 'chats'}
        onClick={openMenu('chats')}
        sx={(t) => ({ minWidth: 0, maxWidth: t.spacing(30), textTransform: 'none', '& .MuiButton-endIcon': { ml: 0.5 }, '&[aria-expanded="true"]': { bgcolor: 'action.hover' } })}
      >
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent ?? (title || 'Chat sin título')}</Box>
      </Button>
      <Box sx={{ flex: 1 }} />
      <AuiIconButton tooltip="Nuevo chat" size={HEADER_BUTTON} aria-haspopup="menu" aria-expanded={menu?.kind === 'new'} onClick={openMenu('new')} sx={headerButtonSx}><SquarePen /></AuiIconButton>
      <AuiIconButton tooltip="Más opciones" size={HEADER_BUTTON} aria-haspopup="menu" aria-expanded={menu?.kind === 'more'} onClick={openMenu('more')} sx={headerButtonSx}><MoreVertical /></AuiIconButton>
      <Divider orientation="vertical" flexItem sx={{ my: 1.5, mx: 0.5 }} />
      {surface === 'float' ? <AuiIconButton tooltip="Abrir en panel lateral" size={HEADER_BUTTON} onClick={() => toSurface('side')} sx={headerButtonSx}><PanelRight /></AuiIconButton> : null}
      {surface === 'side' ? <AuiIconButton tooltip="Pantalla completa" size={HEADER_BUTTON} onClick={() => toSurface('full')} sx={headerButtonSx}><Maximize2 /></AuiIconButton> : null}
      {surface === 'full' ? <AuiIconButton tooltip="Salir de pantalla completa" size={HEADER_BUTTON} onClick={() => toSurface('side')} sx={headerButtonSx}><Minimize2 /></AuiIconButton> : null}
      <AuiIconButton tooltip="Cerrar" size={HEADER_BUTTON} onClick={() => toSurface('closed')} sx={headerButtonSx}><X /></AuiIconButton>

      <ChatsMenu anchor={menu?.kind === 'chats' ? menu.anchor : null} onClose={closeMenu} onPick={(id) => { closeMenu(); threads.threads().switchToThread(id); }} />
      <Menu anchorEl={menu?.kind === 'new' ? menu.anchor : null} open={menu?.kind === 'new'} onClose={closeMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={() => newChat()}><ListItemIcon><SquarePen size={HEADER_ICON} /></ListItemIcon>Nuevo chat</MenuItem>
        {agents.length ? <ListSubheader sx={(t) => ({ ...t.typography.caption, lineHeight: t.spacing(4), fontWeight: t.typography.fontWeightMedium })}>Asistentes</ListSubheader> : null}
        {agents.map((a) => (
          <MenuItem key={a.id} onClick={() => newChat(a.name)}>
            <Avatar sx={(t) => ({ width: t.spacing(ITEM_AVATAR), height: t.spacing(ITEM_AVATAR), mr: 1.5, ...t.typography.caption, fontWeight: t.typography.fontWeightMedium, bgcolor: alpha(t.palette[a.color ?? 'primary'].main, t.palette.action.selectedOpacity), color: `${a.color ?? 'primary'}.dark` })}>{a.name.charAt(0)}</Avatar>
            {a.name}
          </MenuItem>
        ))}
      </Menu>
      <Menu anchorEl={menu?.kind === 'more' ? menu.anchor : null} open={menu?.kind === 'more'} onClose={closeMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={copyId}><ListItemIcon><Copy size={HEADER_ICON} /></ListItemIcon>Copiar ID del chat</MenuItem>
      </Menu>
      <Snackbar open={copied} autoHideDuration={3200} onClose={() => setCopied(false)} message="ID del chat copiado." anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ position: 'absolute' }} />
    </Stack>
  );
}

function firstUserText(messages: readonly { role: string; content: readonly { type: string; text?: string }[] }[]) {
  const first = messages.find((m) => m.role === 'user');
  return first ? first.content.map((p) => (p.type === 'text' ? p.text ?? '' : '')).join(' ').trim() : '';
}

const pad = (n: number) => String(n).padStart(2, '0');
const formatDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

/** Los chats anteriores con buscador. El actual va marcado. */
function ChatsMenu({ anchor, onClose, onPick }: { anchor: HTMLElement | null; onClose: () => void; onPick: (id: string) => void }) {
  const [query, setQuery] = React.useState('');
  const search = React.useRef<HTMLInputElement>(null);
  const current = useAuiState((s) => s.threads.mainThreadId);
  const threadIds = useAuiState((s) => s.threads.threadIds);
  const items = useAuiState((s) => s.threads.threadItems);
  const byId = React.useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const q = query.trim().toLowerCase();
  const shown = threadIds.filter((id) => !q || (byId.get(id)?.title ?? '').toLowerCase().includes(q));
  return (
    <Menu
      anchorEl={anchor}
      open={anchor !== null}
      onClose={onClose}
      TransitionProps={{ onEntered: () => search.current?.focus(), onExited: () => setQuery('') }}
      autoFocus={false}
      slotProps={{ paper: { sx: (t: Theme) => ({ width: t.spacing(MENU_WIDTH) }) } }}
    >
      <Box sx={{ px: 1.5, pt: 0.5, pb: 1 }} onKeyDown={(e) => { if (e.key !== 'Escape' && e.key !== 'ArrowDown') e.stopPropagation(); }}>
        <TextField
          inputRef={search}
          fullWidth
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar chats anteriores"
          inputProps={{ 'aria-label': 'Buscar chats anteriores' }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={HEADER_ICON} /></InputAdornment> }}
        />
      </Box>
      {shown.map((id) => {
        const item = byId.get(id);
        return (
          <MenuItem key={id} selected={id === current} aria-current={id === current} onClick={() => onPick(id)}>
            <ListItemText
              primary={item?.title || 'Chat sin título'}
              secondary={item?.lastMessageAt ? formatDate(item.lastMessageAt) : undefined}
              primaryTypographyProps={{ noWrap: true }}
              secondaryTypographyProps={{ variant: 'caption', sx: { fontVariantNumeric: 'tabular-nums' } }}
            />
          </MenuItem>
        );
      })}
      {shown.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 0.75 }}>{threadIds.length ? 'Ningún chat coincide.' : 'Aún no hay chats anteriores.'}</Typography>
      ) : null}
    </Menu>
  );
}
