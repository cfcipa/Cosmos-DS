// Cosmos DS · Kit IA · Thread: Scroll anchor.
// Referente: assistant-ui «Scroll anchor» (elements/scroll-anchor.tsx): el streaming nunca te roba la posición.
// Los mensajes llegan cada 1,3 s y la vista los sigue mientras estés abajo. Si subes, el siguiente mensaje suelta el
// ancla y aparece «N mensajes nuevos»; con 2 o más sin ver, vuelve sola a los 2,4 s salvo con `paused`.
// Arriba, un degradado desvanece lo que sale de la vista.
// `onSettled` se llama una vez, cuando llegó el último mensaje con la vista abajo.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import { ArrowDown } from 'lucide-react';
import { riseSx, userBubbleSx } from '../lib/thread';

export interface ScrollAnchorMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface ScrollAnchorProps {
  messages: readonly ScrollAnchorMessage[];
  /** Detiene la llegada de mensajes y el regreso automático. Default false. */
  paused?: boolean;
  onSettled?: () => void;
  className?: string;
  sx?: SxProps<Theme>;
}

/** Tiempos y medidas del tablero. */
const INITIAL_COUNT = 1;
const APPEND_MS = 1300;
const AUTO_RETURN_MS = 2400;
const AUTO_RETURN_AFTER = 2;
/** Cuánto dura el desplazamiento suave de vuelta antes de volver a escuchar el scroll. */
const JUMP_MS = 700;
/** Medidas de assistant-ui: max-w-sm × 256, degradado de 24px. */
const MAX_WIDTH = 384;
const HEIGHT = 256;
const FADE = 3;
const ARROW = 12;

/** «N mensajes nuevos», en palabras; sin cuenta, «Ir al final». */
export function scrollAnchorLabel(unseen: number) {
  if (unseen <= 0) return 'Ir al final';
  return `${unseen} ${unseen === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}`;
}

export interface ScrollAnchorButtonProps extends Omit<React.ComponentProps<typeof Button>, 'variant' | 'color' | 'children'> {
  /** Mensajes que llegaron sin verse. */
  unseen: number;
}

/** El botón que ofrece el camino de vuelta (Button outlined, sobre el papel). */
export const ScrollAnchorButton = React.forwardRef<HTMLButtonElement, ScrollAnchorButtonProps>(function ScrollAnchorButton({ unseen, sx, ...props }, ref) {
  return (
    <Button
      ref={ref}
      variant="outlined"
      color="inherit"
      data-slot="scroll-anchor-button"
      startIcon={<Box component="span" sx={{ display: 'flex', color: 'text.secondary' }}><ArrowDown size={ARROW} /></Box>}
      {...props}
      sx={[
        (t) => ({ pointerEvents: 'auto', ...t.typography.body3, borderColor: 'divider', bgcolor: 'background.paper', px: 1.75, '&:hover': { bgcolor: 'background.paper', borderColor: 'divider', transform: 'translateY(-1px)' }, transition: t.transitions.create('transform', { duration: t.transitions.duration.shorter }) }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {scrollAnchorLabel(unseen)}
    </Button>
  );
});

export function ScrollAnchor({ messages, paused = false, onSettled, className, sx }: ScrollAnchorProps) {
  const theme = useTheme();
  const bottomThreshold = parseFloat(theme.spacing(3));
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const awayRef = React.useRef(false);
  const jumpingRef = React.useRef(false);
  const pausedRef = React.useRef(paused);
  pausedRef.current = paused;
  const [count, setCount] = React.useState(Math.min(INITIAL_COUNT, messages.length));
  const [pinned, setPinned] = React.useState(true);
  const [unseen, setUnseen] = React.useState(0);

  // Llegada de mensajes.
  React.useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(() => setCount((c) => (c >= messages.length ? c : c + 1)), APPEND_MS);
    return () => window.clearInterval(id);
  }, [paused, messages.length]);

  // Cada mensaje nuevo: la vista lo sigue, o suelta el ancla si subiste.
  const lastCount = React.useRef(count);
  React.useLayoutEffect(() => {
    if (count === lastCount.current) return;
    lastCount.current = count;
    const viewport = viewportRef.current;
    if (awayRef.current) {
      setPinned(false);
      setUnseen((n) => n + 1);
    } else if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [count]);

  const jumpTimer = React.useRef<number>();
  const jump = React.useCallback(() => {
    const viewport = viewportRef.current;
    jumpingRef.current = true;
    awayRef.current = false;
    window.clearTimeout(jumpTimer.current);
    jumpTimer.current = window.setTimeout(() => { jumpingRef.current = false; }, JUMP_MS);
    viewport?.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    setPinned(true);
    setUnseen(0);
  }, []);
  React.useEffect(() => () => window.clearTimeout(jumpTimer.current), []);

  // Regreso automático: una sola vez, 2,4 s después de acumular 2 sin ver.
  const shouldReturn = !pinned && unseen >= AUTO_RETURN_AFTER;
  React.useEffect(() => {
    if (!shouldReturn) return undefined;
    const id = window.setTimeout(() => { if (!pausedRef.current) jump(); }, AUTO_RETURN_MS);
    return () => window.clearTimeout(id);
  }, [shouldReturn, jump]);

  const settled = React.useRef(false);
  React.useEffect(() => {
    if (!settled.current && pinned && count >= messages.length) {
      settled.current = true;
      onSettled?.();
    }
  }, [count, pinned, messages.length, onSettled]);

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < bottomThreshold;
    if (jumpingRef.current) {
      if (atBottom) jumpingRef.current = false;
      return;
    }
    awayRef.current = !atBottom;
    if (atBottom && !pinned) {
      setPinned(true);
      setUnseen(0);
    }
  };

  return (
    <Paper
      variant="outlined"
      data-slot="scroll-anchor"
      className={className}
      sx={[{ position: 'relative', width: '100%', maxWidth: MAX_WIDTH, height: HEIGHT, overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box
        ref={viewportRef}
        onScroll={onScroll}
        sx={{ height: '100%', overflowY: 'auto', overflowAnchor: 'none', boxSizing: 'border-box', p: 2, pb: 7, display: 'flex', flexDirection: 'column', gap: 1.25 }}
      >
        {messages.slice(0, count).map((message, index) => (
          <Typography
            key={index}
            variant="body2"
            component="div"
            color={message.role === 'user' ? undefined : 'text.secondary'}
            sx={(t) => ({ flexShrink: 0, ...(message.role === 'user' ? userBubbleSx() : { alignSelf: 'flex-start', maxWidth: '85%' }), ...riseSx(t) })}
          >
            {message.text}
          </Typography>
        ))}
      </Box>
      <Box aria-hidden="true" sx={(t) => ({ position: 'absolute', left: 0, right: 0, top: 0, height: t.spacing(FADE), pointerEvents: 'none', background: `linear-gradient(${t.palette.background.paper}, transparent)` })} />
      <Fade in={!pinned && unseen > 0} unmountOnExit>
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: (t) => t.spacing(1.5), display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <ScrollAnchorButton unseen={unseen} onClick={jump} />
        </Box>
      </Fade>
    </Paper>
  );
}
