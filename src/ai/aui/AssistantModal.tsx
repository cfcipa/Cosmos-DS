// Cosmos DS · Kit IA · AUI connected: Assistant modal.
// Referente: assistant-ui «Assistant modal» (elements/assistant-modal.aui.tsx): una burbuja flotante que abre el
// hilo en un panel. No se cierra al hacer clic fuera ni al perder el foco: solo con la burbuja o Esc. Se abre sola al
// primer runStart que llegue de otro lado. El encabezado alterna entre el hilo y la lista de hilos y crea uno nuevo.
// La esquina superior izquierda redimensiona (arrastre o flechas; doble clic o Enter restablece) y el tamaño se recuerda.
import * as React from 'react';
import { ThreadListPrimitive, useAuiEvent, useAuiState } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Bot, ChevronDown, History, Plus } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { AuiIconButton } from './AuiIconButton';
import { AuiThread } from './Thread';
import { AUI_NEW_CHAT, AuiThreadListItems, AuiThreadListRoot, AuiThreadListSearch } from './ThreadList';

type View = 'thread' | 'list';
type Size = { width: number; height: number };

/** Medidas de assistant-ui: panel de 400 × 500 (mínimo 320 × 400), burbuja de 44px a 16px del borde, 16px de separación. */
const DEFAULT_SIZE: Size = { width: 400, height: 500 };
const MIN_SIZE: Size = { width: 320, height: 400 };
/** Lo que el panel deja libre de la ventana (la burbuja y sus márgenes quedan debajo). */
const VIEWPORT_INSET: Size = { width: 32, height: 96 };
const RESIZE_STEP = 16;
const BUBBLE = 5.5;
const OFFSET = 16;
const HEADER = 5.5;
const HEADER_BUTTON = 3.5;
const HEADER_ICON = 14;
const BUBBLE_ICON = 20;
const HANDLE = 3;
const SIZE_KEY = 'aui-modal-size';

const clampSize = ({ width, height }: Size, bounds?: DOMRect): Size => {
  const vw = bounds?.width ?? window.innerWidth;
  const vh = bounds?.height ?? window.innerHeight;
  return {
    width: Math.round(Math.max(MIN_SIZE.width, Math.min(width, vw - VIEWPORT_INSET.width))),
    height: Math.round(Math.max(MIN_SIZE.height, Math.min(height, vh - VIEWPORT_INSET.height))),
  };
};
const readSize = (): Size | null => {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(SIZE_KEY) ?? 'null');
    if (typeof stored !== 'object' || stored === null) return null;
    const { width, height } = stored as Record<string, unknown>;
    return typeof width === 'number' && typeof height === 'number' ? clampSize({ width, height }) : null;
  } catch { return null; }
};
const storeSize = (size: Size | null) => {
  try {
    if (size) window.localStorage.setItem(SIZE_KEY, JSON.stringify(size));
    else window.localStorage.removeItem(SIZE_KEY);
  } catch { /* sin almacenamiento, el tamaño dura hasta recargar */ }
};

/** Con `position: 'absolute'`, el panel se limita al contenedor posicionado, no a la ventana. */
const boundsOf = (el: HTMLElement | null, absolute: boolean) => (absolute ? (el?.offsetParent as HTMLElement | null)?.getBoundingClientRect() : undefined);

function useModalSize(contentRef: React.RefObject<HTMLDivElement>, absolute: boolean) {
  const [size, setSize] = React.useState<Size | null>(readSize);
  const drag = React.useRef<{ id: number; x: number; y: number; w: number; h: number; last: Size | null } | null>(null);
  const commit = (next: Size | null) => { setSize(next); storeSize(next); };
  const fromPointer = (d: NonNullable<typeof drag.current>, e: React.PointerEvent) => clampSize({ width: d.w - (e.clientX - d.x), height: d.h - (e.clientY - d.y) }, boundsOf(contentRef.current, absolute));
  const take = (e: React.PointerEvent) => { const d = drag.current; if (!d || d.id !== e.pointerId) return null; drag.current = null; return d; };
  const reset = () => { drag.current = null; commit(null); };
  return {
    size,
    reset,
    handleProps: {
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        const el = contentRef.current;
        if (e.button !== 0 || !el) return;
        const r = el.getBoundingClientRect();
        drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, w: r.width, h: r.height, last: null };
        e.currentTarget.setPointerCapture(e.pointerId);
        e.preventDefault();
      },
      onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId || (!d.last && e.clientX === d.x && e.clientY === d.y)) return;
        d.last = fromPointer(d, e);
        setSize(d.last);
      },
      onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
        const d = take(e);
        if (d && (d.last || e.clientX !== d.x || e.clientY !== d.y)) commit(fromPointer(d, e));
      },
      onPointerCancel: (e: React.PointerEvent<HTMLElement>) => { const d = take(e); if (d?.last) commit(d.last); },
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
        const el = contentRef.current;
        if (!el) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reset(); return; }
        const step = e.shiftKey ? RESIZE_STEP * 4 : RESIZE_STEP;
        const change = ({ ArrowUp: [0, step], ArrowDown: [0, -step], ArrowLeft: [step, 0], ArrowRight: [-step, 0] } as Record<string, [number, number]>)[e.key];
        if (!change) return;
        e.preventDefault();
        const r = el.getBoundingClientRect();
        commit(clampSize({ width: r.width + change[0], height: r.height + change[1] }, boundsOf(el, absolute)));
      },
      onDoubleClick: reset,
    },
  };
}

export interface AuiAssistantModalProps {
  /** Default 'fixed' (esquina de la ventana). 'absolute' la ancla al contenedor posicionado más cercano. */
  position?: 'fixed' | 'absolute';
  /** Abierta al montar. Default false. */
  defaultOpen?: boolean;
}

export function AuiAssistantModal({ position = 'fixed', defaultOpen = false }: AuiAssistantModalProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [view, setView] = React.useState<View>('thread');
  const anchorRef = React.useRef<HTMLButtonElement | null>(null);
  // El ancla en estado: abierta al montar, el Popper espera a que la burbuja exista.
  const [anchor, setAnchor] = React.useState<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { size, handleProps } = useModalSize(contentRef, position === 'absolute');
  const thread = React.useMemo(() => <AuiThread />, []);

  useAuiEvent('thread.runStart', () => { setView('thread'); setOpen(true); });
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !e.defaultPrevented) { setOpen(false); anchorRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const label = open ? 'Cerrar el asistente' : 'Abrir el asistente';
  return (
    <>
      <Box sx={(t) => ({ position, right: OFFSET, bottom: OFFSET, width: t.spacing(BUBBLE), height: t.spacing(BUBBLE), zIndex: t.zIndex.speedDial })}>
        <Tooltip title={label} placement="left">
          <ButtonBase
            ref={(node: HTMLButtonElement | null) => { anchorRef.current = node; setAnchor(node); }}
            aria-label={label}
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={() => { if (!open) setView('thread'); setOpen((o) => !o); }}
            sx={(t) => ({
              position: 'relative', width: '100%', height: '100%', borderRadius: '50%', border: 1, borderColor: 'divider',
              bgcolor: 'background.paper', color: 'text.primary', boxShadow: t.shadows[2],
              transition: t.transitions.create(['border-color', 'transform'], { duration: t.transitions.duration.shortest }),
              '&:hover': { borderColor: 'text.disabled' }, '&:active': { transform: 'scale(.96)' },
              '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: 2 },
              '& > span': { position: 'absolute', display: 'flex', transition: t.transitions.create(['transform', 'opacity', 'filter'], { duration: t.transitions.duration.shorter }) },
              '& > span[data-shown="false"]': { transform: 'scale(.25)', opacity: 0, filter: 'blur(4px)' },
              [REDUCED_MOTION]: { transition: 'none', '& > span': { transition: 'none' } },
            })}
          >
            <span data-shown={!open}><Bot size={BUBBLE_ICON} /></span>
            <span data-shown={open}><ChevronDown size={BUBBLE_ICON} /></span>
          </ButtonBase>
        </Tooltip>
      </Box>
      <Popper
        open={open && anchor !== null}
        anchorEl={anchor}
        placement="top-end"
        disablePortal={position === 'absolute'}
        transition
        popperOptions={{ strategy: position }}
        modifiers={[{ name: 'offset', options: { offset: [0, OFFSET] } }]}
        sx={(t) => ({ zIndex: t.zIndex.modal })}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'bottom right' }}>
            <Paper
              ref={contentRef}
              role="dialog"
              aria-labelledby="aui-modal-title"
              elevation={8}
              sx={{
                position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'clip', overscrollBehavior: 'contain',
                width: (size ?? DEFAULT_SIZE).width, height: (size ?? DEFAULT_SIZE).height,
                // Nunca más que la ventana (o el contenedor, si es un contenedor de tamaño) menos la burbuja y los márgenes.
                maxWidth: `calc(${position === 'absolute' ? '100cqw' : '100vw'} - ${VIEWPORT_INSET.width}px)`, maxHeight: `calc(${position === 'absolute' ? '100cqh' : '100vh'} - ${VIEWPORT_INSET.height}px)`,
                '& [data-slot="aui-thread"]': { bgcolor: 'inherit' },
              }}
            >
              <ButtonBase
                aria-label="Redimensionar el asistente"
                {...handleProps}
                sx={(t) => ({
                  position: 'absolute', left: 0, top: 0, zIndex: 2, width: t.spacing(HANDLE), height: t.spacing(HANDLE), cursor: 'nwse-resize', touchAction: 'none',
                  borderLeft: 2, borderTop: 2, borderColor: 'transparent', borderTopLeftRadius: t.shape.borderRadius,
                  clipPath: 'polygon(0 0, 100% 0, 100% 6px, 6px 6px, 6px 100%, 0 100%)',
                  transition: t.transitions.create('border-color', { duration: t.transitions.duration.shortest }),
                  '[role="dialog"]:hover > &': { borderColor: 'divider' }, '&:hover': { borderColor: 'text.disabled' }, '&.Mui-focusVisible': { borderColor: t.palette.ai.focusRing },
                })}
              />
              <ModalHeader view={view} onViewChange={setView} />
              <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
                <Box ref={(node: HTMLDivElement | null) => { if (node) node.inert = view === 'list'; }} sx={{ height: '100%' }}>{thread}</Box>
                {view === 'list' ? <ModalThreadList onSelect={() => setView('thread')} /> : null}
              </Box>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

function ModalHeader({ view, onViewChange }: { view: View; onViewChange: (v: View) => void }) {
  const title = useAuiState((s) => s.threadListItem.title);
  const hasThreads = useAuiState((s) => s.threads.threadIds.length > 0);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const shown = React.useRef(view);
  React.useEffect(() => {
    if (shown.current === view) return;
    shown.current = view;
    const active = document.activeElement;
    if (active === document.body || active === titleRef.current?.closest('[role="dialog"]')) titleRef.current?.focus();
  }, [view]);
  const buttonSx = { '& svg': { width: HEADER_ICON, height: HEADER_ICON }, borderRadius: 1, '&[aria-pressed="true"]': { bgcolor: 'action.selected', color: 'text.primary' } };
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={(t) => ({ height: t.spacing(HEADER), flexShrink: 0, pl: 1.75, pr: 1, borderBottom: 1, borderColor: 'divider' })}>
      <Typography id="aui-modal-title" ref={titleRef} tabIndex={-1} variant="subtitle2" component="h2" noWrap sx={{ m: 0, flex: 1, minWidth: 0, outline: 'none' }}>
        {view === 'list' ? 'Hilos' : title || AUI_NEW_CHAT}
      </Typography>
      <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
        <AuiIconButton tooltip="Hilos" size={HEADER_BUTTON} aria-pressed={view === 'list'} disabled={!hasThreads && view === 'thread'} onClick={() => onViewChange(view === 'list' ? 'thread' : 'list')} sx={buttonSx}>
          <History />
        </AuiIconButton>
        <ThreadListPrimitive.New asChild>
          <AuiIconButton tooltip="Nuevo hilo" size={HEADER_BUTTON} onClick={() => onViewChange('thread')} sx={buttonSx}><Plus /></AuiIconButton>
        </ThreadListPrimitive.New>
      </Stack>
    </Stack>
  );
}

function ModalThreadList({ onSelect }: { onSelect: () => void }) {
  const [search, setSearch] = React.useState('');
  const hasThreads = useAuiState((s) => s.threads.threadIds.length > 0);
  return (
    <Box
      sx={{ position: 'absolute', inset: 0, overflowY: 'auto', p: 1, bgcolor: 'background.paper' }}
      onClick={(e) => { if ((e.target as Element).closest('[data-slot="aui-thread-list-item-trigger"]')) onSelect(); }}
    >
      <AuiThreadListRoot>
        {hasThreads ? <AuiThreadListSearch value={search} onValueChange={setSearch} /> : null}
        <AuiThreadListItems searchQuery={hasThreads ? search : ''} />
      </AuiThreadListRoot>
    </Box>
  );
}
