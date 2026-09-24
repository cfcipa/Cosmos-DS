// Cosmos DS · Kit IA · AUI connected: Conversation map.
// Referente: assistant-ui «Conversation map» (elements/conversation-map.tsx y conversation-map.aui.tsx).
// Un riel con una marca por turno de todo el hilo: la del turno que lees es la más fuerte, las que están en pantalla
// van marcadas y las demás tenues. Al pasar el cursor el riel se despliega y una tarjeta muestra la pregunta y el
// comienzo de la respuesta; un clic lleva a ese turno moviendo solo el hilo. Con Tab se entra al riel y ↑ ↓ Inicio Fin
// recorren las marcas. `AuiConversationMapRail` lo conecta al hilo; `AuiConversationMap` es el riel solo.
import * as React from 'react';
import { useAuiState, useThreadViewport, type ThreadMessage } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import { useTheme, type Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { PROSE_LINE_HEIGHT } from './MarkdownText';

export interface AuiConversationMapEntry {
  id: string;
  title: string;
  preview?: string;
}

/** Medidas de assistant-ui: riel de 24px; marcas de 12px en reposo, 18px las visibles y 24px la actual al desplegarse. */
const RAIL_WIDTH = 3;
const TICK_REST = 1.5;
const TICK_IN_VIEW = 2.25;
const TICK_FULL = 3;
const TICK_MAX_HEIGHT = 1.75;
const TICK_THICK = 3;
const TICK_THIN = 2;
/** Tarjeta de 240px, a 10px del riel; abre a los 120 ms y cierra a los 80 ms. */
const CARD_WIDTH = 30;
const CARD_OFFSET = 10;
const OPEN_DELAY = 120;
const CLOSE_DELAY = 80;
const TITLE_LENGTH = 72;
const PREVIEW_LENGTH = 240;
/** Un mensaje llevado al borde superior queda una fracción de píxel abajo; sin tolerancia marcaría el turno anterior. */
const TOP_TOLERANCE = 1;
const TICK = '[data-slot="aui-conversation-map-tick"]';

const clampIndex = (n: number, max: number) => Math.min(Math.max(n, 0), Math.max(0, max));
const clampLines = (lines: number) => ({ display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' }) as const;

export interface AuiConversationMapProps {
  entries: readonly AuiConversationMapEntry[];
  activeId?: string;
  visibleIds?: readonly string[];
  onSelect?: (id: string) => void;
  /** Lado en que abre la tarjeta. Default 'right'. */
  side?: 'left' | 'right';
  sx?: SxProps<Theme>;
}

export function AuiConversationMap({ entries, activeId, visibleIds, onSelect, side = 'right', sx }: AuiConversationMapProps) {
  const theme = useTheme();
  const railRef = React.useRef<HTMLElement>(null);
  const [focused, setFocused] = React.useState<number | null>(null);
  const [card, setCard] = React.useState<{ entry: AuiConversationMapEntry; anchor: HTMLElement } | null>(null);
  const openTimer = React.useRef<number>();
  const closeTimer = React.useRef<number>();
  React.useEffect(() => () => { window.clearTimeout(openTimer.current); window.clearTimeout(closeTimer.current); }, []);

  const inView = new Set(visibleIds);
  const activeIndex = entries.findIndex((e) => e.id === activeId);
  const tabbable = clampIndex(focused ?? Math.max(0, activeIndex), entries.length - 1);

  const show = (entry: AuiConversationMapEntry, anchor: HTMLElement) => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    // Con la tarjeta abierta, pasar a otra marca la cambia de inmediato.
    if (card) setCard({ entry, anchor });
    else openTimer.current = window.setTimeout(() => setCard({ entry, anchor }), OPEN_DELAY);
  };
  const hide = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setCard(null), CLOSE_DELAY);
  };
  const keep = () => window.clearTimeout(closeTimer.current);

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const ticks = railRef.current?.querySelectorAll<HTMLElement>(TICK);
    if (!ticks?.length) return;
    const current = Array.prototype.indexOf.call(ticks, event.target);
    if (current === -1) return;
    const next = ({ ArrowUp: current - 1, ArrowDown: current + 1, Home: 0, End: ticks.length - 1 } as Record<string, number>)[event.key];
    if (next === undefined) return;
    event.preventDefault();
    ticks[clampIndex(next, ticks.length - 1)]?.focus();
  };

  return (
    <Box
      component="nav"
      ref={railRef}
      data-slot="aui-conversation-map"
      aria-label="Mapa de la conversación"
      onKeyDown={onKeyDown}
      sx={[
        (t) => ({
          display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: t.spacing(RAIL_WIDTH),
          '&:hover [data-slot="aui-conversation-map-bar"], &:focus-within [data-slot="aui-conversation-map-bar"]': { width: t.spacing(TICK_IN_VIEW) },
          '&:hover [data-slot="aui-conversation-map-bar"][data-active], &:focus-within [data-slot="aui-conversation-map-bar"][data-active]': { width: t.spacing(TICK_FULL) },
          '&:hover [data-slot="aui-conversation-map-bar"]:not([data-in-view]), &:focus-within [data-slot="aui-conversation-map-bar"]:not([data-in-view])': { width: t.spacing(TICK_REST) },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {entries.map((entry, index) => {
        const current = index === activeIndex;
        const onScreen = current || inView.has(entry.id);
        return (
          <ButtonBase
            key={entry.id}
            disableRipple
            data-slot="aui-conversation-map-tick"
            aria-label={entry.title}
            aria-current={current ? 'true' : undefined}
            tabIndex={index === tabbable ? 0 : -1}
            onFocus={(e) => { setFocused(index); show(entry, e.currentTarget); }}
            onBlur={hide}
            onMouseEnter={(e) => show(entry, e.currentTarget)}
            onMouseLeave={hide}
            onClick={onSelect ? () => onSelect(entry.id) : undefined}
            // El tope deja un hilo corto compacto en vez de repartido en todo el alto; uno largo lo supera y se reparte.
            sx={(t) => ({
              display: 'flex', flex: 1, justifyContent: 'flex-start', minHeight: 0, maxHeight: t.spacing(TICK_MAX_HEIGHT), width: '100%',
              '&:hover [data-slot="aui-conversation-map-bar"], &.Mui-focusVisible [data-slot="aui-conversation-map-bar"]': { width: `${t.spacing(TICK_FULL)} !important`, bgcolor: 'text.primary' },
            })}
          >
            <Box
              component="span"
              data-slot="aui-conversation-map-bar"
              data-active={current ? '' : undefined}
              data-in-view={onScreen ? '' : undefined}
              sx={(t) => ({
                width: t.spacing(TICK_REST), height: current ? TICK_THICK : TICK_THIN, borderRadius: TICK_THICK,
                bgcolor: current ? 'text.primary' : onScreen ? 'text.secondary' : 'divider',
                transition: t.transitions.create(['width', 'height', 'background-color'], { duration: t.transitions.duration.shorter, easing: t.transitions.easing.easeOut }),
                [REDUCED_MOTION]: { transition: 'none' },
              })}
            />
          </ButtonBase>
        );
      })}
      <Popper
        open={card !== null}
        anchorEl={card?.anchor}
        placement={side}
        transition
        modifiers={[{ name: 'offset', options: { offset: [0, CARD_OFFSET] } }]}
        sx={(t) => ({ zIndex: t.zIndex.tooltip })}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={theme.transitions.duration.shorter}>
            <Paper
              elevation={8}
              data-slot="aui-conversation-map-card"
              onMouseEnter={keep}
              onMouseLeave={hide}
              sx={(t) => ({ width: t.spacing(CARD_WIDTH), p: 1.75 })}
            >
              <Typography variant="subtitle2" sx={clampLines(2)}>{card?.entry.title}</Typography>
              {card?.entry.preview && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: PROSE_LINE_HEIGHT, ...clampLines(3) }}>{card.entry.preview}</Typography>
              )}
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
}

// ——— Conectado ———

const sameIds = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((id, i) => id === b[i]);

/**
 * La línea que un mensaje tiene que cruzar para ser el que se lee: arriba del hilo casi siempre, y baja hasta el borde
 * inferior en la última pantalla (un mensaje a menos de un alto del final nunca llega arriba).
 */
function readingLine(viewport: HTMLElement) {
  const rect = viewport.getBoundingClientRect();
  const height = viewport.clientHeight;
  if (height <= 0) return rect.top + TOP_TOLERANCE;
  const remaining = viewport.scrollHeight - height - viewport.scrollTop;
  const descent = Math.min(1, Math.max(0, (height - remaining) / height));
  return rect.top + rect.height * descent + TOP_TOLERANCE;
}

const textOf = (m: ThreadMessage) => m.content.map((p) => (p.type === 'text' ? p.text : '')).join('\n').trim();
const linesOf = (m: ThreadMessage) => textOf(m).split('\n').map((l) => l.replace(/^[\s#>*`-]+/, '').trim()).filter(Boolean);
const cutAtWord = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  const head = text.slice(0, limit);
  const boundary = head.lastIndexOf(' ');
  return boundary > limit / 2 ? head.slice(0, boundary) : head;
};
function labelOf(m: ThreadMessage) {
  const parts = [...m.content];
  const tools = parts.flatMap((p) => (p.type === 'tool-call' ? [p.toolName] : []));
  if (tools.length === 1) return tools[0];
  if (tools.length > 1) return `${tools.length} llamadas a herramientas`;
  if (parts.some((p) => p.type === 'reasoning')) return 'Razonamiento';
  // Un envío del composer lleva sus archivos en `attachments` con `content` vacío: ambos deciden la etiqueta.
  const carriers: Array<{ type: string }> = [...parts, ...(m.attachments ?? [])];
  if (carriers.some((c) => c.type === 'image')) return 'Imagen';
  if (carriers.some((c) => c.type === 'file' || c.type === 'document')) return 'Archivo';
  if (carriers.length > 0) return 'Adjunto';
  return m.role === 'user' ? 'Mensaje' : 'Respuesta';
}

type Turn = { head: ThreadMessage; members: ThreadMessage[] };
function groupIntoTurns(messages: readonly ThreadMessage[]) {
  const turns: Turn[] = [];
  for (const m of messages) {
    if (m.role !== 'user' && m.role !== 'assistant') continue;
    const current = turns[turns.length - 1];
    if (m.role === 'user' || !current) turns.push({ head: m, members: [m] });
    else current.members.push(m);
  }
  return turns;
}
function describe({ head, members }: Turn): AuiConversationMapEntry {
  const lines = linesOf(head);
  const first = lines[0] ?? '';
  const title = cutAtWord(first, TITLE_LENGTH);
  // Lo que preguntó nombra el turno; lo que respondió es la vista previa. Mientras responde, el resto de su texto.
  const answer = members.find((m) => m !== head && textOf(m));
  const preview = (answer ? linesOf(answer).join(' ') : [first.slice(title.length), ...lines.slice(1)].join(' ')).trim().slice(0, PREVIEW_LENGTH);
  return { id: head.id, title: title || labelOf(head), ...(preview ? { preview } : {}) };
}

export interface AuiConversationMapRailProps {
  /** Lado del hilo en que va el riel. Default 'left'. */
  side?: 'left' | 'right';
  sx?: SxProps<Theme>;
}

/** El riel conectado: va dentro de `ThreadPrimitive.Viewport`, antes de los mensajes (en AuiThread: `conversationMap`). */
export function AuiConversationMapRail({ side = 'left', sx }: AuiConversationMapRailProps) {
  const messages = useAuiState((s) => s.thread.messages);
  const viewport = useThreadViewport((s) => s.element.viewport);
  const viewportHeight = useThreadViewport((s) => s.height.viewport);
  const [activeId, setActiveId] = React.useState<string | undefined>(undefined);
  const [visibleIds, setVisibleIds] = React.useState<readonly string[]>([]);
  const scheduleRef = React.useRef<(() => void) | undefined>(undefined);
  const turns = React.useMemo(() => groupIntoTurns(messages), [messages]);
  const entries = React.useMemo(() => turns.map(describe), [turns]);
  const turnOf = React.useMemo(() => {
    const owners = new Map<string, string>();
    turns.forEach((turn) => turn.members.forEach((m) => owners.set(m.id, turn.head.id)));
    return owners;
  }, [turns]);
  const turnOfRef = React.useRef(turnOf);
  React.useEffect(() => { turnOfRef.current = turnOf; });
  const turnKey = turns.map((t) => t.head.id).join(' ');

  React.useEffect(() => {
    if (!viewport) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const owners = turnOfRef.current;
      const view = viewport.getBoundingClientRect();
      const line = readingLine(viewport);
      // Una pasada da las dos cosas que dibuja el riel: el turno que se lee y los que están en pantalla.
      let current: string | undefined;
      const onScreen: string[] = [];
      for (const el of viewport.querySelectorAll<HTMLElement>('[data-message-id]')) {
        const box = el.getBoundingClientRect();
        if (box.top >= view.bottom) break;
        const id = el.dataset.messageId;
        const head = id === undefined ? undefined : owners.get(id);
        if (head === undefined) continue;
        if (box.top <= line) current = head;
        if (box.bottom > view.top && !onScreen.includes(head)) onScreen.push(head);
      }
      setActiveId(current ?? owners.values().next().value);
      setVisibleIds((prev) => (sameIds(prev, onScreen) ? prev : onScreen));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    scheduleRef.current = schedule;
    schedule();
    viewport.addEventListener('scroll', schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(viewport);
    return () => {
      scheduleRef.current = undefined;
      if (frame) cancelAnimationFrame(frame);
      viewport.removeEventListener('scroll', schedule);
      observer.disconnect();
    };
  }, [viewport]);
  React.useEffect(() => { scheduleRef.current?.(); }, [turnKey]);

  const select = React.useCallback((id: string) => {
    if (!viewport) return;
    for (const el of viewport.querySelectorAll<HTMLElement>('[data-message-id]')) {
      if (el.dataset.messageId !== id) continue;
      // scrollIntoView movería también la página que contiene el hilo; solo se mueve el hilo.
      const top = el.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop;
      viewport.scrollTo({ top, behavior: 'smooth' });
      return;
    }
  }, [viewport]);

  if (entries.length === 0) return null;
  return (
    <Box data-slot="aui-conversation-map-rail" sx={[{ position: 'sticky', top: 0, zIndex: 1, height: 0, width: '100%', pointerEvents: 'none' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Box sx={{ position: 'absolute', top: 0, [side]: 0, px: 1.5, py: 5, height: viewportHeight, boxSizing: 'border-box', pointerEvents: 'auto' }}>
        <AuiConversationMap entries={entries} activeId={activeId} visibleIds={visibleIds} onSelect={select} side={side === 'right' ? 'left' : 'right'} />
      </Box>
    </Box>
  );
}
