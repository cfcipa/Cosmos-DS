// Cosmos DS · Kit IA · AUI connected: Reasoning.
// Referente: assistant-ui «Reasoning» (elements/reasoning.tsx, reasoning.aui.tsx y reasoning-panel.tsx).
// Un visor plegable del razonamiento del asistente. Mientras razona se abre solo y sigue el final del texto (una vista
// previa con desvanecido abajo); si el lector sube, deja de seguirlo. Al terminar vuelve a `defaultOpen`, salvo que el
// usuario lo haya abierto o cerrado: su elección manda desde entonces. Mientras se pliega, el hilo no salta.
// `AuiReasoningPanel` es el diseño por pasos: «Pensando» con el tiempo transcurrido y una lista de pasos que crece.
import * as React from 'react';
import { useAuiState, useScrollLock, type ReasoningGroupComponent, type ReasoningMessagePartComponent } from '@assistant-ui/react';
import Box, { type BoxProps } from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes, useTheme, type Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { Brain, ChevronDown } from 'lucide-react';
import { COLLAPSE_EASE, REDUCED_MOTION, shimmerTextSx } from '../lib/shimmerText';
import { riseSx } from '../lib/thread';
import { AuiMarkdownText, PROSE_LINE_HEIGHT } from './MarkdownText';

export type AuiReasoningVariant = 'outline' | 'ghost' | 'muted';

/** Medidas de assistant-ui: texto de hasta 256px de alto con sangría de 24px, desvanecidos de 32px, íconos de 16px. */
const TEXT_MAX_HEIGHT = 32;
const TEXT_INDENT = 3;
const FADE_HEIGHT = 4;
const ICON_SIZE = 16;
/** La entrada del texto al abrir: baja 16px desde arriba, con 2px de desenfoque. */
const TEXT_SLIDE = 16;
const TEXT_BLUR = 2;
/** El panel por pasos: 384px de ancho, viñetas de 5px, chevron de 14px. */
const PANEL_MAX_WIDTH = 384;
const STEP_DOT = 5;
const STEP_DOT_OFFSET = 7;
const PANEL_CHEVRON = 14;

const textIn = keyframes`from { opacity: 0; transform: translateY(-${TEXT_SLIDE}px); filter: blur(${TEXT_BLUR}px); } to { opacity: 1; transform: none; filter: none; }`;
const dotPulse = keyframes`50% { opacity: .5; }`;

type ReasoningContextValue = { open: boolean; setOpen: (open: boolean) => void; preview: boolean; variant: AuiReasoningVariant };
const ReasoningContext = React.createContext<ReasoningContextValue | null>(null);
function useReasoning() {
  const ctx = React.useContext(ReasoningContext);
  if (!ctx) throw new Error('AuiReasoning.* va dentro de AuiReasoningRoot');
  return ctx;
}

/** El fondo del que parten los desvanecidos: el papel del hilo y, en `muted`, la superficie gris encima. */
function fadeBackground(t: Theme, variant: AuiReasoningVariant, to: 'top' | 'bottom') {
  const paper = `linear-gradient(to ${to}, ${t.palette.background.paper}, transparent)`;
  return variant === 'muted' ? `linear-gradient(to ${to}, ${t.palette.ai.surfaceMuted}, transparent), ${paper}` : paper;
}

export interface AuiReasoningRootProps extends Omit<BoxProps, 'onAnimationStart'> {
  variant?: AuiReasoningVariant;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  /** Mientras es true se mantiene abierto con la vista previa que sigue el final. */
  streaming?: boolean;
  /** Justo antes de que el visor se pliegue o despliegue (al tocarlo y al cambiar `streaming`). */
  onAnimationStart?: () => void;
}

export const AuiReasoningRoot = React.forwardRef<HTMLDivElement, AuiReasoningRootProps>(function AuiReasoningRoot(
  { variant = 'outline', open: controlledOpen, onOpenChange, defaultOpen = false, streaming, onAnimationStart, sx, children, ...rest },
  ref,
) {
  const theme = useTheme();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const lockScroll = useScrollLock(rootRef, theme.transitions.duration.shorter);
  const setRef = React.useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);
  const [initialOpen] = React.useState(defaultOpen);
  const [userOpen, setUserOpen] = React.useState<boolean | null>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : (userOpen ?? (Boolean(streaming) || initialOpen));
  const preview = streaming === true && open;

  const animationStart = React.useCallback(() => { lockScroll(); onAnimationStart?.(); }, [lockScroll, onAnimationStart]);
  const prevStreaming = React.useRef(streaming);
  React.useLayoutEffect(() => {
    if (prevStreaming.current === streaming) return;
    prevStreaming.current = streaming;
    // Solo anima el cambio de streaming cuando el reposo es plegado; con defaultOpen sigue abierto.
    if (!isControlled && userOpen === null && !initialOpen) animationStart();
  }, [streaming, isControlled, userOpen, initialOpen, animationStart]);

  const setOpen = React.useCallback((next: boolean) => {
    animationStart();
    if (!isControlled) setUserOpen(next);
    onOpenChange?.(next);
  }, [animationStart, isControlled, onOpenChange]);
  const value = React.useMemo(() => ({ open, setOpen, preview, variant }), [open, setOpen, preview, variant]);

  return (
    <ReasoningContext.Provider value={value}>
      <Box
        ref={setRef}
        data-slot="aui-reasoning-root"
        data-variant={variant}
        data-state={open ? 'open' : 'closed'}
        sx={[
          { width: '100%', mb: 2 },
          variant === 'outline' && { border: 1, borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1 },
          variant === 'muted' && { bgcolor: 'ai.surfaceMuted', borderRadius: 1, px: 1.5, py: 1 },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
      >
        {children}
      </Box>
    </ReasoningContext.Provider>
  );
});

export interface AuiReasoningTriggerProps {
  /** Brillo en la etiqueta mientras razona. */
  active?: boolean;
  /** Segundos que tomó; se muestra como «Razonamiento (Ns)». */
  duration?: number;
  /** Default 'Razonamiento'. */
  label?: string;
  sx?: SxProps<Theme>;
}

export function AuiReasoningTrigger({ active, duration, label = 'Razonamiento', sx }: AuiReasoningTriggerProps) {
  const { open, setOpen } = useReasoning();
  return (
    <ButtonBase
      data-slot="aui-reasoning-trigger"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      sx={[
        (t) => ({
          ...t.typography.body2, display: 'flex', maxWidth: '75%', gap: 1, py: 0.75, color: 'text.secondary', borderRadius: 1,
          transformOrigin: 'left', transition: t.transitions.create(['color', 'transform'], { duration: t.transitions.duration.shortest }),
          '&:hover': { color: 'text.primary' }, '&:active': { transform: 'scale(.98)' },
          '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
          '& svg': { flexShrink: 0, width: ICON_SIZE, height: ICON_SIZE },
          [REDUCED_MOTION]: { transition: 'none' },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Brain />
      <Box component="span" sx={(t) => ({ fontVariantNumeric: 'tabular-nums', ...(active ? shimmerTextSx(t) : null) })}>
        {label}{duration ? ` (${duration}s)` : ''}
      </Box>
      <Box
        component="span"
        sx={(t) => ({
          display: 'flex', transform: open ? 'none' : 'rotate(-90deg)',
          transition: t.transitions.create('transform', { duration: t.transitions.duration.shorter, easing: COLLAPSE_EASE }),
          [REDUCED_MOTION]: { transition: 'none' },
        })}
      >
        <ChevronDown />
      </Box>
    </ButtonBase>
  );
}

export function AuiReasoningFade({ side = 'bottom' }: { side?: 'top' | 'bottom' }) {
  const { variant } = useReasoning();
  return (
    <Box
      aria-hidden
      data-slot="aui-reasoning-fade"
      sx={(t) => ({
        position: 'absolute', insetInline: 0, [side]: 0, zIndex: 1, height: t.spacing(FADE_HEIGHT), pointerEvents: 'none',
        background: fadeBackground(t, variant, side === 'top' ? 'bottom' : 'top'),
      })}
    />
  );
}

export function AuiReasoningContent({ children, 'aria-busy': busy }: { children: React.ReactNode; 'aria-busy'?: boolean }) {
  const { open, preview } = useReasoning();
  const theme = useTheme();
  return (
    <Collapse in={open} timeout={theme.transitions.duration.shorter} easing={COLLAPSE_EASE} data-slot="aui-reasoning-content">
      <Typography variant="body2" component="div" color="text.secondary" aria-busy={busy} sx={{ position: 'relative', overflow: 'hidden' }}>
        <AuiReasoningFade side="top" />
        {children}
        {preview && <AuiReasoningFade />}
      </Typography>
    </Collapse>
  );
}

/** El texto del razonamiento. Con la vista previa activa sigue el final; si el lector sube, se queda donde está. */
export function AuiReasoningText({ children }: { children: React.ReactNode }) {
  const { open, preview } = useReasoning();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const scrollEl = scrollRef.current;
    const contentEl = contentRef.current;
    if (!preview || !scrollEl || !contentEl) return undefined;
    let pinned = true;
    let lastTop = scrollEl.scrollTop;
    let lastHeight = scrollEl.scrollHeight;
    const atBottom = () => Math.abs(scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight) <= 1 || scrollEl.scrollHeight <= scrollEl.clientHeight;
    const pin = () => { if (pinned) scrollEl.scrollTop = scrollEl.scrollHeight; };
    // El scroll que provoca el propio anclaje puede llegar con el contenido ya más alto; solo subir con la misma altura
    // es intención del lector.
    const onScroll = () => {
      if (atBottom()) pinned = true;
      else if (scrollEl.scrollTop < lastTop && scrollEl.scrollHeight === lastHeight) pinned = false;
      lastTop = scrollEl.scrollTop;
      lastHeight = scrollEl.scrollHeight;
    };
    pin();
    scrollEl.addEventListener('scroll', onScroll);
    const observer = new ResizeObserver(pin);
    observer.observe(contentEl);
    return () => { scrollEl.removeEventListener('scroll', onScroll); observer.disconnect(); };
  }, [preview]);
  return (
    <Box
      ref={scrollRef}
      data-slot="aui-reasoning-text"
      sx={(t) => ({
        position: 'relative', maxHeight: t.spacing(TEXT_MAX_HEIGHT), overflowY: 'auto', pl: TEXT_INDENT, py: 1,
        lineHeight: PROSE_LINE_HEIGHT, textWrap: 'pretty',
        animation: open ? `${textIn} ${t.transitions.duration.shorter}ms ${COLLAPSE_EASE}` : 'none',
        '& .aui-md': { ...t.typography.body2, lineHeight: PROSE_LINE_HEIGHT, color: 'inherit' },
        [REDUCED_MOTION]: { animation: 'none' },
      })}
    >
      <Stack ref={contentRef} spacing={2}>{children}</Stack>
    </Box>
  );
}

/** Una parte de razonamiento del mensaje, con formato. */
export const AuiReasoning: ReasoningMessagePartComponent = React.memo(function AuiReasoning() {
  return <AuiMarkdownText />;
});

export interface AuiReasoningGroupProps {
  /** Si alguna parte del grupo sigue llegando. */
  streaming: boolean;
  variant?: AuiReasoningVariant;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** Las partes de razonamiento consecutivas de un mensaje, en un solo visor (el grupo `group-reasoning`). */
export function AuiReasoningGroup({ streaming, variant, defaultOpen, children }: AuiReasoningGroupProps) {
  return (
    <AuiReasoningRoot streaming={streaming} variant={variant} defaultOpen={defaultOpen}>
      <AuiReasoningTrigger active={streaming} />
      <AuiReasoningContent aria-busy={streaming}>
        <AuiReasoningText>{children}</AuiReasoningText>
      </AuiReasoningContent>
    </AuiReasoningRoot>
  );
}

/** Para `components.ReasoningGroup` de `MessagePrimitive.Parts`: decide solo si el grupo sigue llegando. */
export const AuiReasoningPartsGroup: ReasoningGroupComponent = function AuiReasoningPartsGroup({ children, startIndex, endIndex }) {
  const streaming = useAuiState((s) => {
    if (s.message.status?.type !== 'running') return false;
    for (let i = startIndex; i <= endIndex; i++) if (s.message.parts[i]?.status.type === 'running') return true;
    return false;
  });
  return <AuiReasoningGroup streaming={streaming}>{children}</AuiReasoningGroup>;
};

export interface AuiReasoningStep {
  title: string;
  body: string;
}

export interface AuiReasoningPanelProps {
  steps: readonly AuiReasoningStep[];
  /** Cuántos pasos se ven ya. */
  visibleSteps: number;
  streaming: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lo que dice al terminar, p. ej. «Pensó durante 4s». */
  restingLabel: string;
  /** Tiempo transcurrido mientras piensa, p. ej. «3s». */
  elapsed?: string;
  sx?: SxProps<Theme>;
}

export function AuiReasoningPanel({ steps, visibleSteps, streaming, open, onOpenChange, restingLabel, elapsed, sx }: AuiReasoningPanelProps) {
  const theme = useTheme();
  const shown = steps.slice(0, Math.max(0, visibleSteps));
  return (
    <Box data-slot="aui-reasoning-panel" sx={[{ width: '100%', maxWidth: PANEL_MAX_WIDTH }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <ButtonBase
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        sx={(t) => ({
          ...t.typography.body2, gap: 0.75, py: 0.5, color: 'text.secondary', borderRadius: 1,
          transition: t.transitions.create(['color', 'transform'], { duration: t.transitions.duration.shortest }),
          '&:hover': { color: 'text.primary' }, '&:active': { transform: 'scale(.98)' },
          '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
          [REDUCED_MOTION]: { transition: 'none' },
        })}
      >
        {streaming ? (
          <>
            <Box component="span" sx={(t) => shimmerTextSx(t)}>Pensando</Box>
            {elapsed !== undefined && <Typography component="span" variant="caption" color="text.disabled" sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily, fontVariantNumeric: 'tabular-nums' })}>{elapsed}</Typography>}
          </>
        ) : (
          <span>{restingLabel}</span>
        )}
        <Box
          component="span"
          sx={(t) => ({
            display: 'flex', opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none',
            transition: t.transitions.create('transform', { duration: t.transitions.duration.shorter, easing: COLLAPSE_EASE }),
            '& svg': { width: PANEL_CHEVRON, height: PANEL_CHEVRON }, [REDUCED_MOTION]: { transition: 'none' },
          })}
        >
          <ChevronDown />
        </Box>
      </ButtonBase>
      <Collapse in={open} timeout={theme.transitions.duration.shorter} easing={COLLAPSE_EASE}>
        <Stack component="ol" spacing={2} sx={{ listStyle: 'none', m: 0, p: 0, pt: 1.5, pb: 0.5 }}>
          {shown.map((step, i) => {
            const active = streaming && i === shown.length - 1;
            return (
              <Stack key={step.title} component="li" direction="row" spacing={1.5} sx={(t) => riseSx(t)}>
                <Box
                  aria-hidden
                  sx={(t) => ({
                    mt: `${STEP_DOT_OFFSET}px`, width: STEP_DOT, height: STEP_DOT, flexShrink: 0, borderRadius: '50%',
                    bgcolor: active ? 'primary.main' : 'text.disabled',
                    transition: t.transitions.create('background-color', { duration: t.transitions.duration.standard }),
                    animation: active ? `${dotPulse} 2s cubic-bezier(.4, 0, .6, 1) infinite` : 'none',
                    [REDUCED_MOTION]: { animation: 'none' },
                  })}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" color="text.primary">{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: PROSE_LINE_HEIGHT, overflowWrap: 'anywhere' }}>{step.body}</Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Collapse>
    </Box>
  );
}
