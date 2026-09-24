// Cosmos DS · Kit IA · AUI connected: Assistant sidebar.
// Referente: assistant-ui «Assistant sidebar» (elements/assistant-sidebar.aui.tsx): la aplicación y el hilo lado a
// lado en paneles redimensionables. El separador se arrastra o, enfocado, se mueve con ← → (Shift da pasos de 10%);
// Inicio y Fin llevan a los topes. Cada panel respeta `minSize`.
import * as React from 'react';
import Box from '@mui/material/Box';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { AuiThread } from './Thread';

export interface AuiAssistantSidebarProps {
  children: React.ReactNode;
  /** Tamaño inicial del panel de la aplicación, en %. Default 50. */
  defaultSize?: number;
  /** Mínimo de cada panel, en %. Default 20. */
  minSize?: number;
  /** Muestra el agarre sobre el separador. Default false. */
  withHandle?: boolean;
}

const STEP = 2;
const BIG_STEP = 10;
/** El agarre del separador: 12 × 16. */
const GRIP = { w: 1.5, h: 2 };

export function AuiAssistantSidebar({ children, defaultSize = 50, minSize = 20, withHandle = false }: AuiAssistantSidebarProps) {
  const [size, setSize] = React.useState(defaultSize);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef<number | null>(null);
  const clamp = React.useCallback((v: number) => Math.min(100 - minSize, Math.max(minSize, v)), [minSize]);
  React.useEffect(() => { setSize((s) => clamp(s)); }, [clamp]);

  const fromPointer = (clientX: number) => {
    const r = rootRef.current?.getBoundingClientRect();
    if (!r) return;
    setSize(clamp(((clientX - r.left) / r.width) * 100));
  };
  return (
    <Box ref={rootRef} data-slot="aui-assistant-sidebar" sx={{ display: 'flex', width: '100%', height: '100%', minHeight: 0 }}>
      <Box sx={{ flexBasis: `${size}%`, flexShrink: 0, minWidth: 0, overflow: 'auto' }}>{children}</Box>
      <Box
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label="Redimensionar paneles"
        aria-valuenow={Math.round(size)}
        aria-valuemin={minSize}
        aria-valuemax={100 - minSize}
        onPointerDown={(e) => { if (e.button !== 0) return; dragging.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault(); }}
        onPointerMove={(e) => { if (dragging.current === e.pointerId) fromPointer(e.clientX); }}
        onPointerUp={(e) => { if (dragging.current === e.pointerId) dragging.current = null; }}
        onKeyDown={(e) => {
          const step = e.shiftKey ? BIG_STEP : STEP;
          const next = ({ ArrowLeft: size - step, ArrowRight: size + step, Home: minSize, End: 100 - minSize } as Record<string, number>)[e.key];
          if (next === undefined) return;
          e.preventDefault();
          setSize(clamp(next));
        }}
        sx={(t) => ({
          position: 'relative', flexShrink: 0, width: '1px', bgcolor: 'divider', cursor: 'col-resize', touchAction: 'none', outline: 'none',
          // Área de toque más ancha que la línea visible.
          '&::after': { content: '""', position: 'absolute', top: 0, bottom: 0, left: t.spacing(-0.5), right: t.spacing(-0.5) },
          transition: t.transitions.create('background-color', { duration: t.transitions.duration.shortest }),
          '&:hover, &:focus-visible': { bgcolor: 'primary.main' },
          [REDUCED_MOTION]: { transition: 'none' },
        })}
      >
        {withHandle ? (
          <Box aria-hidden="true" sx={(t) => ({ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, width: t.spacing(GRIP.w), height: t.spacing(GRIP.h), borderRadius: 0.5, border: 1, borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', '&::before, &::after': { content: '""', width: '1px', height: t.spacing(1), bgcolor: 'text.disabled' } })} />
        ) : null}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}><AuiThread /></Box>
    </Box>
  );
}
