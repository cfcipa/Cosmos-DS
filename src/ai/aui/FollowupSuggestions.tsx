// Cosmos DS · Kit IA · AUI connected: Follow-up suggestions.
// Referente: assistant-ui «Follow-up suggestions» (elements/follow-up-suggestions.aui.tsx): tras una respuesta, una
// fila de siguientes pasos que se envían al tocarlos. Solo con el hilo no vacío, sin ejecución y con sugerencias.
// Si la fila no cabe se desplaza de lado y los bordes se desvanecen donde queda contenido oculto.
import * as React from 'react';
import { AuiIf, ThreadPrimitive, useAuiState } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { REDUCED_MOTION } from '../lib/shimmerText';

/** Ancho del desvanecido en los bordes (2rem en assistant-ui). */
const FADE = 4;

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

function Row() {
  const suggestions = useAuiState((s) => s.thread.suggestions);
  const ref = React.useRef<HTMLDivElement>(null);
  const [fades, setFades] = React.useState({ left: false, right: false });
  const update = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const from = Math.abs(el.scrollLeft);
    setFades((prev) => {
      const next = { left: from > 1, right: max - from > 1 };
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
          <Suggestion key={i} prompt={suggestion.prompt} send>
            {suggestion.title ?? suggestion.prompt}
            {suggestion.label ? <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>{suggestion.label}</Box> : null}
          </Suggestion>
        ))}
      </Box>
    </Box>
  );
}

export function AuiFollowupSuggestions() {
  return (
    <AuiIf condition={(s) => !s.thread.isEmpty && !s.thread.isRunning && s.thread.suggestions.length > 0}>
      <Row />
    </AuiIf>
  );
}
