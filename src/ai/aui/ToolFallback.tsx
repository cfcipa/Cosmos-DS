// Cosmos DS · Kit IA · AUI connected: Tool fallback.
// Referente: assistant-ui «Tool fallback» (elements/tool-fallback.aui.tsx).
// El renderizador por defecto de una llamada a herramienta sin interfaz propia: una línea plegable «Herramienta usada:
// nombre» con el ícono de su estado (girando mientras corre, con brillo), la duración, y al abrirla los argumentos, el
// error o el motivo de la cancelación, y el resultado. Cuando la herramienta espera a la persona se abre sola con la
// aprobación: Permitir / Rechazar, las opciones que declare la solicitud (con un paso de confirmación si la opción lo
// pide), o una pregunta con respuesta escrita. Si el runtime rechaza la respuesta, los controles vuelven con el error.
import * as React from 'react';
import {
  toolApprovalAcceptsText, useAuiState, useScrollLock, useToolCallElapsed,
  type ToolApprovalOption, type ToolCallMessagePart, type ToolCallMessagePartComponent, type ToolCallMessagePartProps, type ToolCallMessagePartStatus,
} from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes, useTheme, type Theme } from '@mui/material/styles';
import type { SxProps, SystemStyleObject } from '@mui/system';
import { AlertCircle, Check, ChevronDown, Loader, XCircle } from 'lucide-react';
import { COLLAPSE_EASE, REDUCED_MOTION, shimmerTextSx } from '../lib/shimmerText';

/** Medidas de assistant-ui: íconos de 16px, contenido con sangría de 24px, giro de 0,6 s. */
const ICON_SIZE = 16;
const CONTENT_INDENT = 3;
const SPIN_MS = 600;
const SECOND = 1000;
const MINUTE = 60;
const TENTHS = 10;
/** Alto mínimo del campo de respuesta (el Textarea de assistant-ui, min-h-16). */
const ANSWER_MIN_ROWS = 3;

const spin = keyframes`to { transform: rotate(360deg); }`;
const contentIn = keyframes`from { opacity: 0; transform: translateY(-4px); filter: blur(2px); } to { opacity: 1; transform: none; filter: none; }`;

export const TOOL_APPROVED_RESULT = 'Aprobado por el usuario';
export const TOOL_DENIED_RESULT = 'El usuario rechazó la ejecución de la herramienta';
const OPTION_LABELS: Record<string, string> = {
  'allow-once': 'Permitir',
  'allow-always': 'Permitir siempre',
  'reject-once': 'Rechazar',
  'reject-always': 'Rechazar siempre',
};

/** «<1s», «2,4s», «14s», «1m 5s». */
export function formatToolDuration(ms: number) {
  if (ms < SECOND) return '<1s';
  const seconds = ms / SECOND;
  if (seconds < TENTHS) return `${(Math.floor(seconds * TENTHS) / TENTHS).toFixed(1).replace('.', ',')}s`;
  if (seconds < MINUTE) return `${Math.floor(seconds)}s`;
  return `${Math.floor(seconds / MINUTE)}m ${Math.floor(seconds % MINUTE)}s`;
}

/** Texto de un valor cualquiera (resultado, error): tal cual si es texto, si no JSON. */
export function formatUnknownValue(value: unknown, space?: number): string {
  if (typeof value === 'string') return value;
  try {
    if (value instanceof Error) return String(value);
    const json = JSON.stringify(value, null, space);
    if (json !== undefined) return json;
  } catch { /* se intenta como texto */ }
  try { return String(value); } catch { return '[Valor no serializable]'; }
}

const codeBlockSx = (t: Theme): SystemStyleObject<Theme> => ({
  ...t.aiKit.code, fontSize: t.typography.caption.fontSize as string, m: 0, p: 1.25, borderRadius: 1,
  bgcolor: 'action.hover', color: 'text.primary', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
});

type RootContext = { open: boolean; setOpen: (open: boolean) => void };
const ToolFallbackContext = React.createContext<RootContext | null>(null);
function useToolFallback() {
  const ctx = React.useContext(ToolFallbackContext);
  if (!ctx) throw new Error('AuiToolFallback.* va dentro de AuiToolFallbackRoot');
  return ctx;
}

export interface AuiToolFallbackRootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
}

export function AuiToolFallbackRoot({ open: controlled, onOpenChange, defaultOpen = false, sx, children }: AuiToolFallbackRootProps) {
  const theme = useTheme();
  const ref = React.useRef<HTMLDivElement>(null);
  const lockScroll = useScrollLock(ref, theme.transitions.duration.shorter);
  const [own, setOwn] = React.useState(defaultOpen);
  const open = controlled ?? own;
  const setOpen = React.useCallback((next: boolean) => {
    lockScroll();
    if (controlled === undefined) setOwn(next);
    onOpenChange?.(next);
  }, [lockScroll, controlled, onOpenChange]);
  const value = React.useMemo(() => ({ open, setOpen }), [open, setOpen]);
  return (
    <ToolFallbackContext.Provider value={value}>
      <Box ref={ref} data-slot="aui-tool-fallback" data-state={open ? 'open' : 'closed'} sx={[{ width: '100%' }, ...(Array.isArray(sx) ? sx : [sx])]}>{children}</Box>
    </ToolFallbackContext.Provider>
  );
}

/** La duración de la llamada: la del runtime (`part.timing`) o `elapsedMs` si se pasa. */
export function AuiToolFallbackDuration({ elapsedMs }: { elapsedMs?: number }) {
  const runtime = useToolCallElapsed();
  const ms = elapsedMs ?? runtime;
  if (ms === undefined) return null;
  return <Typography component="span" variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }} data-slot="aui-tool-fallback-duration">{formatToolDuration(ms)}</Typography>;
}

const STATUS_ICON = { running: Loader, complete: Check, incomplete: XCircle, 'requires-action': AlertCircle } as const;

export interface AuiToolFallbackTriggerProps {
  toolName: string;
  status?: ToolCallMessagePartStatus;
  /** Duración fija (demos); por defecto la del runtime. */
  elapsedMs?: number;
}

export function AuiToolFallbackTrigger({ toolName, status, elapsedMs }: AuiToolFallbackTriggerProps) {
  const { open, setOpen } = useToolFallback();
  const type = status?.type ?? 'complete';
  const running = type === 'running';
  const cancelled = status?.type === 'incomplete' && status.reason === 'cancelled';
  const Icon = STATUS_ICON[type];
  return (
    <ButtonBase
      data-slot="aui-tool-fallback-trigger"
      data-status={cancelled ? 'cancelled' : type}
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      sx={(t) => ({
        ...t.typography.body2, display: 'flex', width: 'fit-content', gap: 1, py: 0.75, borderRadius: 1, color: 'text.secondary',
        transformOrigin: 'left', transition: t.transitions.create(['color', 'transform'], { duration: t.transitions.duration.shortest }),
        '&:hover': { color: 'text.primary' }, '&:active': { transform: 'scale(.98)' },
        '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
        '& > svg': { flexShrink: 0, width: ICON_SIZE, height: ICON_SIZE },
        [REDUCED_MOTION]: { transition: 'none' },
      })}
    >
      <Box component={Icon} sx={running ? { animation: `${spin} ${SPIN_MS}ms linear infinite`, [REDUCED_MOTION]: { animation: 'none' } } : undefined} />
      <Box
        component="span"
        sx={(t) => ({ textAlign: 'start', ...(cancelled ? { textDecoration: 'line-through' } : null), ...(running ? shimmerTextSx(t) : null) })}
      >
        {cancelled ? 'Herramienta cancelada' : 'Herramienta usada'}: <b>{toolName}</b>
      </Box>
      <AuiToolFallbackDuration elapsedMs={elapsedMs} />
      <Box
        component={ChevronDown}
        sx={(t) => ({
          transform: open ? 'none' : 'rotate(-90deg)',
          transition: t.transitions.create('transform', { duration: t.transitions.duration.shorter, easing: COLLAPSE_EASE }),
          [REDUCED_MOTION]: { transition: 'none' },
        })}
      />
    </ButtonBase>
  );
}

export function AuiToolFallbackContent({ children }: { children: React.ReactNode }) {
  const { open } = useToolFallback();
  const theme = useTheme();
  return (
    <Collapse in={open} timeout={theme.transitions.duration.shorter} easing={COLLAPSE_EASE} data-slot="aui-tool-fallback-content">
      <Stack
        spacing={1}
        sx={(t) => ({
          ...t.typography.body2, pl: CONTENT_INDENT, pt: 0.5, pb: 1,
          animation: open ? `${contentIn} ${t.transitions.duration.shorter}ms ${COLLAPSE_EASE}` : 'none',
          [REDUCED_MOTION]: { animation: 'none' },
        })}
      >
        {children}
      </Stack>
    </Collapse>
  );
}

export function AuiToolFallbackArgs({ argsText, dimmed }: { argsText?: string; dimmed?: boolean }) {
  if (!argsText) return null;
  return <Box component="pre" data-slot="aui-tool-fallback-args" sx={(t) => ({ ...codeBlockSx(t), opacity: dimmed ? t.palette.action.disabledOpacity : 1 })}>{argsText}</Box>;
}

export function AuiToolFallbackResult({ result }: { result?: unknown }) {
  if (result === undefined) return null;
  return (
    <Box data-slot="aui-tool-fallback-result">
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'fontWeightMedium' }}>Resultado:</Typography>
      <Box component="pre" sx={(t) => ({ ...codeBlockSx(t), mt: 0.5 })}>{formatUnknownValue(result, 2)}</Box>
    </Box>
  );
}

export function AuiToolFallbackError({ status }: { status?: ToolCallMessagePartStatus }) {
  if (status?.type !== 'incomplete') return null;
  const error = status.error;
  const text = error === undefined || error === null ? null : formatUnknownValue(error);
  if (!text) return null;
  return (
    <Box data-slot="aui-tool-fallback-error" sx={{ color: 'text.secondary' }}>
      <Typography variant="body2" sx={(t) => ({ fontWeight: t.typography.h6.fontWeight })}>{status.reason === 'cancelled' ? 'Motivo de la cancelación:' : 'Error:'}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{text}</Typography>
    </Box>
  );
}

// ——— Aprobación ———

type Approval = ToolCallMessagePart['approval'];
const isKnownKind = (kind: string) => Object.prototype.hasOwnProperty.call(OPTION_LABELS, kind);
const isAllowKind = (kind: string) => kind === 'allow-once' || kind === 'allow-always';
const optionLabel = (o: ToolApprovalOption) => o.label ?? (isKnownKind(o.kind) ? OPTION_LABELS[o.kind] : undefined) ?? o.id;
/** Una solicitud que declara cómo mostrarse hace una pregunta, no pide permiso: rechazarla no es una respuesta, salvo que sea descartable. */
const isQuestion = (approval: Approval) => approval?.display === 'select' || approval?.display === 'text';

/** Si hay algo que la persona pueda hacer aquí: una interrupción sin aprobación ni payload no ofrece acción. */
export function offersInterruptAction(status: ToolCallMessagePartStatus | undefined, approval: Approval, interrupt: ToolCallMessagePart['interrupt']) {
  return status?.type !== 'requires-action' || status.reason !== 'interrupt' || approval != null || interrupt != null;
}

export type AuiToolFallbackApprovalProps = Partial<Pick<ToolCallMessagePartProps, 'addResult' | 'resume' | 'respondToApproval' | 'status'>> & {
  interrupt?: ToolCallMessagePart['interrupt'];
  approval?: Approval;
};

export function AuiToolFallbackApproval({ addResult, resume, interrupt, approval, respondToApproval, status }: AuiToolFallbackApprovalProps) {
  const [submitted, setSubmitted] = React.useState(false);
  const voiceActive = useAuiState((s) => s.thread.voice !== undefined);
  const locked = submitted || voiceActive;
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);
  const [answer, setAnswer] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  if (approval != null && (approval.approved !== undefined || approval.resolution !== undefined)) return null;
  if (!offersInterruptAction(status, approval, interrupt)) return null;

  // Las opciones declaradas son una restricción del host: el kit no agrega caminos, y solo conserva el rechazo cuando
  // la solicitud es una acción que la persona puede negar.
  const declared = respondToApproval ? approval?.options : undefined;
  const acceptsText = approval != null && respondToApproval != null && toolApprovalAcceptsText(approval);
  const typedNote = () => (answer.trim() ? { text: answer } : {});
  // Una respuesta rechazada deja la solicitud abierta: los controles vuelven.
  const submit = (send: () => Promise<void> | void) => {
    setSubmitted(true);
    setError(null);
    void (async () => {
      try { await send(); } catch (e) { setSubmitted(false); setError(e instanceof Error ? e.message : String(e)); }
    })();
  };
  const respond = (approved: boolean) => {
    if (locked) return;
    if (approval != null && approval.approved === undefined && respondToApproval) submit(() => respondToApproval({ approved, ...typedNote() }));
    else if (interrupt) submit(() => resume?.({ approved }));
    else if (status?.type === 'requires-action' && status.reason === 'interrupt') return;
    else submit(() => addResult?.(approved ? TOOL_APPROVED_RESULT : TOOL_DENIED_RESULT));
  };
  const respondWithOption = (option: ToolApprovalOption) => {
    if (locked) return;
    setConfirmingId(null);
    // Un tipo propio no tiene clase de decisión: elegirlo es una respuesta, así que resuelve como aprobado.
    submit(() => respondToApproval?.(isKnownKind(option.kind) ? { optionId: option.id, ...typedNote() } : { optionId: option.id, approved: true, ...typedNote() }));
  };
  const submitAnswer = () => { if (!locked) submit(() => respondToApproval?.({ text: answer })); };
  // Descartar no es responder: el borrador no viaja.
  const dismiss = () => { if (!locked) submit(() => respondToApproval?.({ approved: false })); };
  const handleOption = (o: ToolApprovalOption) => (o.confirm ? setConfirmingId(o.id) : respondWithOption(o));

  const question = isQuestion(approval);
  const dismissible = question && respondToApproval != null && approval?.dismissible === true;
  const confirming = confirmingId != null ? declared?.find((o) => o.id === confirmingId) : undefined;
  const pressable = { '&:active': { transform: 'scale(.98)' } } as const;
  const dismissButton = dismissible ? <Button size="small" variant="outlined" sx={pressable} onClick={dismiss} disabled={locked}>Descartar</Button> : null;
  const prompt = approval?.prompt ? <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-line' }}>{approval.prompt}</Typography> : null;
  const errorText = error ? <Typography role="alert" variant="caption" color="error" sx={{ whiteSpace: 'pre-line' }}>{error}</Typography> : null;
  const answerField = acceptsText ? (
    <Stack spacing={1} alignItems="flex-start">
      <InputBase
        multiline
        minRows={ANSWER_MIN_ROWS}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={locked}
        placeholder={question ? 'Escribe tu respuesta' : 'Agrega una nota a tu decisión'}
        inputProps={{ 'aria-label': question ? (approval?.prompt ?? 'Respuesta') : 'Nota' }}
        sx={(t) => ({ ...t.typography.body2, width: '100%', px: 1.5, py: 1, borderRadius: 1, border: 1, borderColor: 'divider', '&.Mui-focused': { borderColor: 'primary.main' } })}
      />
      {question && (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" sx={pressable} onClick={submitAnswer} disabled={locked}>Enviar</Button>
          {dismissButton}
        </Stack>
      )}
    </Stack>
  ) : null;

  if (confirming) {
    const meta = typeof confirming.confirm === 'object' ? confirming.confirm : undefined;
    const description = meta?.description ?? confirming.description;
    return (
      <Stack spacing={1} sx={{ pt: 0.5 }} data-slot="aui-tool-fallback-approval-confirm">
        <Typography variant="body2" sx={(t) => ({ fontWeight: t.typography.h6.fontWeight })}>{meta?.title ?? `¿${optionLabel(confirming)}?`}</Typography>
        {description && <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{description}</Typography>}
        {confirming.grants && confirming.grants.length > 0 && (
          <Stack component="ul" spacing={0.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {confirming.grants.map((g) => (
              <li key={g}><Box component="code" sx={(t) => ({ ...t.aiKit.code, fontSize: t.typography.caption.fontSize, px: 0.75, py: 0.25, borderRadius: 1, bgcolor: 'action.hover' })}>{g}</Box></li>
            ))}
          </Stack>
        )}
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" sx={pressable} onClick={() => respondWithOption(confirming)} disabled={locked}>Confirmar</Button>
          <Button size="small" variant="outlined" sx={pressable} onClick={() => setConfirmingId(null)} disabled={locked}>Volver</Button>
        </Stack>
      </Stack>
    );
  }

  if (declared && declared.length > 0) {
    const allow = declared.filter((o) => isAllowKind(o.kind));
    const custom = declared.filter((o) => !isKnownKind(o.kind));
    const reject = declared.filter((o) => isKnownKind(o.kind) && !isAllowKind(o.kind));
    return (
      <Stack spacing={1} sx={{ pt: 0.5 }} data-slot="aui-tool-fallback-approval">
        {prompt}
        <Stack direction="row" useFlexGap flexWrap="wrap" alignItems="center" spacing={1}>
          {[...allow, ...custom, ...reject].map((o) => (
            <Button key={o.id} size="small" variant={o === allow[0] ? 'contained' : 'outlined'} sx={pressable} onClick={() => handleOption(o)} disabled={locked}>{optionLabel(o)}</Button>
          ))}
          {reject.length === 0 && !question && <Button size="small" variant="outlined" sx={pressable} onClick={() => respond(false)} disabled={locked}>Rechazar</Button>}
          {!acceptsText && dismissButton}
        </Stack>
        {answerField}
        {errorText}
      </Stack>
    );
  }

  // Una pregunta no trae decisión que inventar: muestra solo lo que la solicitud declaró.
  if (question) {
    return (
      <Stack spacing={1} sx={{ pt: 0.5 }} data-slot="aui-tool-fallback-approval">
        {prompt}
        {answerField}
        {!acceptsText && dismissButton && <Stack direction="row" spacing={1}>{dismissButton}</Stack>}
        {errorText}
      </Stack>
    );
  }

  return (
    <Stack spacing={1} sx={{ pt: 0.5 }} data-slot="aui-tool-fallback-approval">
      {prompt}
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="contained" sx={pressable} onClick={() => respond(true)} disabled={locked}>Permitir</Button>
        <Button size="small" variant="outlined" sx={pressable} onClick={() => respond(false)} disabled={locked}>Rechazar</Button>
      </Stack>
      {answerField}
      {errorText}
    </Stack>
  );
}

type PartProps = React.ComponentProps<ToolCallMessagePartComponent>;
export type AuiToolFallbackProps = Omit<PartProps, 'addResult' | 'resume' | 'respondToApproval'> & Partial<Pick<PartProps, 'addResult' | 'resume' | 'respondToApproval'>> & {
  /** Duración fija (demos); por defecto la del runtime. */
  elapsedMs?: number;
};

/** La llamada a herramienta completa. Se abre sola cuando pasa a esperar a la persona. */
export const AuiToolFallback = React.memo(function AuiToolFallback({
  toolName, argsText, result, status, addResult, resume, interrupt, approval, respondToApproval, elapsedMs,
}: AuiToolFallbackProps) {
  const cancelled = status?.type === 'incomplete' && status.reason === 'cancelled';
  const requiresAction = status?.type === 'requires-action';
  const showApproval = requiresAction && offersInterruptAction(status, approval, interrupt);
  const [open, setOpen] = React.useState(requiresAction);
  const [prev, setPrev] = React.useState(requiresAction);
  if (requiresAction !== prev) {
    setPrev(requiresAction);
    if (requiresAction) setOpen(true);
  }
  return (
    <AuiToolFallbackRoot open={open} onOpenChange={setOpen}>
      <AuiToolFallbackTrigger toolName={toolName} status={status} elapsedMs={elapsedMs} />
      <AuiToolFallbackContent>
        <AuiToolFallbackError status={status} />
        <AuiToolFallbackArgs argsText={argsText} dimmed={cancelled} />
        {showApproval && (
          <AuiToolFallbackApproval addResult={addResult} resume={resume} interrupt={interrupt} approval={approval} respondToApproval={respondToApproval} status={status} />
        )}
        <AuiToolFallbackResult result={result} />
      </AuiToolFallbackContent>
    </AuiToolFallbackRoot>
  );
}) as unknown as ToolCallMessagePartComponent & React.FC<AuiToolFallbackProps>;
