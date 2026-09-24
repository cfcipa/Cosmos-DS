// Cosmos DS · Kit IA · AUI connected: Follow-up suggestions.
// Referente: assistant-ui «Follow-up suggestions» (elements/follow-up-suggestions.aui.tsx): tras una respuesta, una
// fila de siguientes pasos que se envían al tocarlos. Solo con el hilo no vacío, sin ejecución y con sugerencias.
// Si la fila no cabe se desplaza de lado y los bordes se desvanecen donde queda contenido oculto (también en RTL).
// Con `send={false}` la ficha deja el texto en el composer en vez de enviarlo. `AuiSuggestions` es el diseño estático:
// fichas (o una lista) que entran escalonadas en cada tanda nueva y marcan la elegida.
import * as React from 'react';
import { AuiIf, ThreadPrimitive, useAuiState } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import { keyframes, styled, type Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { REDUCED_MOTION } from '../lib/shimmerText';

/** Ancho del desvanecido en los bordes (2rem en assistant-ui). */
const FADE = 4;
/** Cada ficha estática entra 70 ms después de la anterior; la lista mide 384px y las fichas 448px. */
const STAGGER_MS = 70;
const LIST_MAX = 384;
const PILLS_MAX = 448;
const rise = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; }`;

const Suggestion = styled(ThreadPrimitive.Suggestion)(({ theme: t }) => ({
  ...t.typography.body2,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  padding: t.spacing(0.5, 1.25),
  borderRadius: t.shape.borderRadius,
  border: `1px solid ${t.palette.divider}`,
  background: 'transparent',
  color: t.palette.text.primary,
  cursor: 'pointer',
  transition: t.transitions.create(['background-color', 'border-color'], { duration: t.transitions.duration.shortest }),
  '&:hover': { backgroundColor: t.palette.action.hover, borderColor: t.palette.text.disabled },
  '&:focus-visible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: 1 },
  [REDUCED_MOTION]: { transition: 'none' },
}));

function Row({ send }: { send: boolean }) {
  const suggestions = useAuiState((s) => s.thread.suggestions);
  const ref = React.useRef<HTMLDivElement>(null);
  const rtl = React.useRef<boolean | null>(null);
  const [fades, setFades] = React.useState({ left: false, right: false });
  const update = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // En RTL scrollLeft va de 0 a -max: se normaliza al ancho oculto de cada borde físico.
    const from = Math.abs(el.scrollLeft);
    rtl.current ??= getComputedStyle(el).direction === 'rtl';
    const [left, right] = rtl.current ? [max - from, from] : [from, max - from];
    setFades((prev) => {
      const next = { left: left > 1, right: right > 1 };
      return prev.left === next.left && prev.right === next.right ? prev : next;
    });
  }, []);
  React.useEffect(() => {
    update();
    const el = ref.current;
    if (!el?.firstElementChild) return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [update]);

  return (
    <Box
      ref={ref}
      onScroll={update}
      data-slot="aui-followup-suggestions"
      sx={(t) => {
        const mask = `linear-gradient(to right, ${fades.left ? `transparent, black ${t.spacing(FADE)}` : 'black'}, ${fades.right ? `black calc(100% - ${t.spacing(FADE)}), transparent` : 'black'})`;
        return { width: '100%', overflowX: 'auto', py: 0.5, my: -0.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, maskImage: mask, WebkitMaskImage: mask };
      }}
    >
      <Box sx={(t) => ({ mx: 'auto', display: 'flex', alignItems: 'center', gap: 1, width: 'max-content', minHeight: t.spacing(4), px: 0.25 })}>
        {suggestions.map((suggestion, i) => (
          <Suggestion key={i} prompt={suggestion.prompt} send={send}>
            {suggestion.title ?? suggestion.prompt}
            {suggestion.label ? <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>{suggestion.label}</Box> : null}
          </Suggestion>
        ))}
      </Box>
    </Box>
  );
}

export interface AuiFollowupSuggestionsProps {
  /** Envía al tocar la ficha (default) o solo la deja en el composer. */
  send?: boolean;
}

export function AuiFollowupSuggestions({ send = true }: AuiFollowupSuggestionsProps) {
  return (
    <AuiIf condition={(s) => !s.thread.isEmpty && !s.thread.isRunning && s.thread.suggestions.length > 0}>
      <Row send={send} />
    </AuiIf>
  );
}

export interface AuiSuggestionsProps {
  suggestions: readonly string[];
  selectedSuggestion: string | null;
  /** Cambiarlo repite la entrada escalonada (una tanda nueva). */
  cycle: number;
  onSuggestion: (suggestion: string) => void;
  variant?: 'pills' | 'list';
  sx?: SxProps<Theme>;
}

/** Sugerencias estáticas, fuera del runtime. */
export function AuiSuggestions({ suggestions, selectedSuggestion, cycle, onSuggestion, variant = 'pills', sx }: AuiSuggestionsProps) {
  const list = variant === 'list';
  return (
    <Box
      key={cycle}
      data-slot="aui-suggestions"
      sx={[
        list ? { display: 'flex', flexDirection: 'column', gap: 1, width: '100%', maxWidth: LIST_MAX } : { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, maxWidth: PILLS_MAX },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {suggestions.map((suggestion, i) => {
        const selected = selectedSuggestion === suggestion;
        return (
          <Paper
            key={suggestion}
            component={ButtonBase}
            variant="outlined"
            aria-pressed={selected}
            onClick={() => onSuggestion(suggestion)}
            sx={(t: Theme) => ({
              ...t.typography.body2, display: 'flex', justifyContent: list ? 'flex-start' : 'center', textAlign: 'start',
              width: list ? '100%' : undefined, px: 2, py: list ? 1.25 : 1,
              animation: `${rise} ${t.transitions.duration.standard}ms ${t.transitions.easing.easeOut} both`, animationDelay: `${i * STAGGER_MS}ms`,
              transition: t.transitions.create('transform', { duration: t.transitions.duration.standard }),
              '&:hover': { transform: 'translateY(-1px)' }, '&:active': { transform: 'scale(.96)' },
              '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
              ...(selected ? { bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main' } : null),
              [REDUCED_MOTION]: { animation: 'none', transition: 'none' },
            })}
          >
            {suggestion}
          </Paper>
        );
      })}
    </Box>
  );
}
