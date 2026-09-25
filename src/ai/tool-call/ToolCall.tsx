// Cosmos DS · Kit IA · Tool use: ToolCall / ToolApproval / ToolGroup sobre @mui/material.
// Referente: assistant-ui ToolFallback + ToolGroup. Solo usa el tema (Cosmos + withAiKit), sx y keyframes.
import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { keyframes } from '@mui/material/styles';
import type { Theme, SxProps } from '@mui/material/styles';
import { Check, CircleX, CircleAlert, ChevronDown } from 'lucide-react';
import { useControllable } from '../lib/useControllable';
import { font } from '../lib/font';
import { COLLAPSE_EASE, REDUCED_MOTION as REDUCED, shimmerTextSx } from '../lib/shimmerText';
import { formatToolDuration } from './types';
import type { ToolCallProps, ToolCallStatus, ToolApprovalProps, ToolApprovalOption, ToolGroupProps } from './types';

// Íconos: Lucide (lucide-react), 16px, trazo 2 — el set de los tableros y de assistant-ui.
const ICONS = { check: Check, 'circle-x': CircleX, 'circle-alert': CircleAlert, 'chevron-down': ChevronDown } as const;
function Lucide({ name, size = 16, sx }: { name: keyof typeof ICONS; size?: number; sx?: SxProps<Theme> }) {
  const I = ICONS[name];
  return (
    <Box component="span" aria-hidden="true" sx={[{ display: 'inline-flex', flexShrink: 0, '& svg': { display: 'block' } }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <I size={size} strokeWidth={2} />
    </Box>
  );
}

const DEFAULT_OPTIONS: ToolApprovalOption[] = [
  { id: 'approve', label: 'Aprobar', kind: 'allow' },
  { id: 'reject', label: 'Rechazar', kind: 'reject' },
];
const Actions = ({ children }: { children: React.ReactNode }) => (
  <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>{children}</Stack>
);
const pSx = { m: 0, font: 'inherit' } as const;

/** The human-in-the-loop block inside a ToolCall in requires-action (MUI): prompt, options (with an optional confirmation step) or a text answer. */
export function ToolApproval({
  prompt,
  options = DEFAULT_OPTIONS,
  mode = 'buttons',
  onRespond,
  disabled = false,
  error,
  answer,
  defaultAnswer = '',
  onAnswerChange,
  fieldLabel = 'Respuesta',
  placeholder = 'Escribe tu respuesta',
  submitLabel = 'Enviar',
  dismissLabel = 'Descartar',
  dismissible = true,
  confirmLabel = 'Confirmar',
  backLabel = 'Volver',
  emptyError = 'La respuesta no puede estar vacía.',
}: ToolApprovalProps) {
  const [confirming, setConfirming] = React.useState<string | null>(null);
  const [text, setText] = useControllable(answer, defaultAnswer, onAnswerChange);
  const [localErr, setLocalErr] = React.useState('');
  const conf = confirming ? options.find((o) => o.id === confirming) : undefined;
  const err = error || localErr;

  const respond = (optionId: string, textAnswer?: string) => {
    setConfirming(null);
    onRespond?.(optionId, textAnswer);
  };
  const chooseOption = (option: ToolApprovalOption) => {
    if (option.confirm && option.kind !== 'reject') setConfirming(option.id);
    else respond(option.id);
  };
  const submitAnswer = () => {
    if (!text.trim()) { setLocalErr(emptyError); return; }
    respond('submit', text.trim());
  };
  return (
    <Stack data-slot={conf ? 'approval-confirm' : 'approval'} useFlexGap
      sx={{ alignItems: 'flex-start', gap: 1, pt: '4px', alignSelf: mode === 'text' ? 'stretch' : undefined }}>
      {conf && conf.confirm ? (
        <>
          <Typography component="p" sx={{ ...pSx, fontWeight: 'fontWeightBold', color: 'text.primary' }}>{conf.confirm.title}</Typography>
          {conf.confirm.description ? <Typography component="p" sx={{ ...pSx, color: 'text.secondary' }}>{conf.confirm.description}</Typography> : null}
          {conf.confirm.grants && conf.confirm.grants.length ? (
            <Stack component="ul" useFlexGap sx={{ listStyle: 'none', m: 0, p: 0, gap: '4px' }}>
              {conf.confirm.grants.map((grant) => (
                <li key={grant}>
                  <Box component="code" sx={(t) => ({
                    ...t.aiKit.code, fontSize: t.typography.caption.fontSize, lineHeight: t.typography.caption.lineHeight,
                    display: 'inline-block', px: '6px', py: '2px', borderRadius: 1, bgcolor: 'ai.surfaceMuted',
                  })}>{grant}</Box>
                </li>
              ))}
            </Stack>
          ) : null}
          <Actions>
            <Button variant="contained" disabled={disabled} onClick={() => respond(conf.id)}>{confirmLabel}</Button>
            <Button variant="outlined" disabled={disabled} onClick={() => setConfirming(null)}>{backLabel}</Button>
          </Actions>
        </>
      ) : (
        <>
          {prompt ? <Typography component="p" sx={{ ...pSx, color: 'text.primary', whiteSpace: 'pre-line' }}>{prompt}</Typography> : null}
          {mode === 'buttons' ? (
            <Actions>
              {options.map((option, i) => (
                <Button key={option.id} variant={i === 0 ? 'contained' : 'outlined'} disabled={disabled}
                  onClick={() => chooseOption(option)}>{option.label}</Button>
              ))}
            </Actions>
          ) : (
            <>
              <TextField label={fieldLabel} placeholder={placeholder} value={text} disabled={disabled} multiline fullWidth
                onChange={(e) => { setText(e.target.value); if (localErr) setLocalErr(''); }}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: '4px', '& .MuiOutlinedInput-root': { p: '12px 14px' }, '& textarea': { minHeight: 32 } }} />
              <Actions>
                <Button variant="contained" disabled={disabled} onClick={submitAnswer}>{submitLabel}</Button>
                {dismissible ? <Button variant="outlined" disabled={disabled} onClick={() => respond('dismiss')}>{dismissLabel}</Button> : null}
              </Actions>
            </>
          )}
        </>
      )}
      {err ? <Typography variant="caption" component="p" role="alert" sx={{ m: 0, color: 'ai.toolStatus.error' }}>{err}</Typography> : null}
    </Stack>
  );
}

const STATUS_COLOR: Record<ToolCallStatus, string> = {
  running: 'ai.toolStatus.running', complete: 'ai.toolStatus.complete', error: 'ai.toolStatus.error',
  cancelled: 'ai.toolStatus.cancelled', 'requires-action': 'ai.toolStatus.requiresAction',
};
/** Pretty JSON, but arrays of scalars stay on one line (the board's look): `[1, 2, 3]` instead of one item per line. */
function show(value: string | object): string {
  if (typeof value === 'string') return value;
  const scalarArray = /\[\s+([^[\]{}]*?)\s+\]/g;
  return JSON.stringify(value, null, 2).replace(scalarArray, (_match, items: string) => `[${items.split(/,\s+/).join(', ')}]`);
}

const rise = keyframes`from { opacity: 0; translate: 0 4px; } to { opacity: 1; translate: 0 0; }`;

const triggerSx = (t: Theme) => ({
  width: 'fit-content', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1, py: '6px', px: 0,
  borderRadius: 1, textAlign: 'left', ...font(t.typography.body1), color: 'text.secondary', transformOrigin: 'left',
  transition: t.transitions.create(['color', 'transform'], { duration: t.transitions.duration.shortest }),
  '&:hover': { color: 'text.primary' },
  '&:active': { transform: 'scale(.98)' },
  '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: 2 },
});
const chevronSx = (open: boolean) => ({ flexShrink: 0, transform: open ? 'none' : 'rotate(-90deg)', transition: `transform .2s ${COLLAPSE_EASE}` });
const preSx = (dim?: boolean) => (t: Theme) => ({
  m: 0, p: '10px', borderRadius: 1, bgcolor: 'ai.surfaceMuted', ...t.aiKit.code, color: 'text.primary',
  whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', opacity: dim ? 0.6 : 1,
});
const bodySx = (open: boolean) => (t: Theme) => ({
  display: 'flex', flexDirection: 'column', gap: 1, p: '4px 0 8px 24px', ...font(t.typography.body1),
  transition: `opacity .2s ${COLLAPSE_EASE}, transform .2s ${COLLAPSE_EASE}, filter .2s ${COLLAPSE_EASE}`,
  ...(open ? null : { opacity: 0, transform: 'translateY(-4px)', filter: 'blur(2px)' }),
});

/** A tool call inside an assistant message (ToolFallback) on MUI: status icon, name, duration, collapsible args/result, and the approval when it requires action. */
export function ToolCall({
  toolName,
  status = 'complete',
  args,
  result,
  error,
  durationMs,
  startedAt,
  open,
  defaultOpen = false,
  onOpenChange,
  approval,
  children,
  usedLabel = 'Herramienta usada',
  cancelledLabel = 'Herramienta cancelada',
  requiresActionLabel = 'Herramienta usada',
  errorTitle = 'Error:',
  cancelTitle = 'Motivo de la cancelación:',
  resultLabel = 'Resultado:',
  className,
}: ToolCallProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const [, forceTick] = React.useState(0);

  // While running without a known durationMs, re-render every 100ms so the live elapsed time ticks up.
  const live = status === 'running' && durationMs === undefined && startedAt !== undefined;
  React.useEffect(() => {
    if (!live) return undefined;
    const id = window.setInterval(() => forceTick((n) => n + 1), 100);
    return () => clearInterval(id);
  }, [live]);

  const requiresAction = status === 'requires-action';
  const running = status === 'running';
  const cancelled = status === 'cancelled';
  const expanded = requiresAction || isOpen;
  const hasErr = (status === 'error' || cancelled) && !!error;
  const verb = cancelled ? cancelledLabel : requiresAction ? requiresActionLabel : usedLabel;
  let ms: number | undefined = durationMs;
  if (ms === undefined && live) ms = Date.now() - (startedAt as number);
  return (
    <Box className={className} data-status={status} sx={{ width: '100%', fontFamily: 'fontFamily' }}>
      <ButtonBase disableRipple aria-expanded={expanded} onClick={() => { if (!requiresAction) setOpen(!isOpen); }} sx={triggerSx}>
        <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0, width: 16, height: 16, alignItems: 'center', justifyContent: 'center', color: STATUS_COLOR[status] }}>
          {running ? <CircularProgress size={13} thickness={4.4} disableShrink aria-hidden="true" sx={{ animationDuration: '.6s' }} />
            : <Lucide name={status === 'complete' ? 'check' : requiresAction ? 'circle-alert' : 'circle-x'} />}
        </Box>
        <Box component="span" sx={(t) => ({
          minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          ...(cancelled ? { textDecoration: 'line-through', color: 'ai.toolStatus.cancelled' } : null),
          ...(running ? shimmerTextSx(t) : null),
        })}>
          {verb}: <Box component="b" sx={{ fontWeight: 'fontWeightBold' }}>{toolName}</Box>
        </Box>
        {ms !== undefined ? <Typography variant="caption" component="span" sx={{ color: 'ai.metaText', fontVariantNumeric: 'tabular-nums' }}>{formatToolDuration(ms)}</Typography> : null}
        <Lucide name="chevron-down" sx={chevronSx(expanded)} />
      </ButtonBase>
      <Collapse in={expanded} sx={expanded ? undefined : { pointerEvents: 'none' }}>
        <Box sx={bodySx(expanded)}>
          {hasErr ? (
            <div>
              <Typography component="p" sx={{ ...pSx, fontWeight: 'fontWeightBold', color: cancelled ? 'text.secondary' : 'ai.toolStatus.error' }}>{cancelled ? cancelTitle : errorTitle}</Typography>
              <Typography component="p" sx={{ ...pSx, color: 'text.secondary', whiteSpace: 'pre-line' }}>{error}</Typography>
            </div>
          ) : null}
          {args !== undefined ? <Box component="pre" data-dim={cancelled || undefined} sx={preSx(cancelled)}>{show(args)}</Box> : null}
          {children}
          {requiresAction && approval ? <ToolApproval {...approval} /> : null}
          {result !== undefined && !requiresAction ? (
            <div>
              <Typography variant="caption" component="p" sx={{ m: '0 0 4px', fontWeight: 'fontWeightMedium', color: 'text.secondary' }}>{resultLabel}</Typography>
              <Box component="pre" sx={preSx()}>{show(result)}</Box>
            </div>
          ) : null}
        </Box>
      </Collapse>
    </Box>
  );
}

// Children rise in one after another when the group opens: 40ms stagger for the first 4, then all together after that.
const RISE_STAGGER_MS = 40;
const RISE = {
  '& > *': { animation: `${rise} .2s ${COLLAPSE_EASE} both` },
  '& > *:nth-of-type(2)': { animationDelay: `${RISE_STAGGER_MS}ms` },
  '& > *:nth-of-type(3)': { animationDelay: `${RISE_STAGGER_MS * 2}ms` },
  '& > *:nth-of-type(4)': { animationDelay: `${RISE_STAGGER_MS * 3}ms` },
  '& > *:nth-of-type(n+5)': { animationDelay: `${RISE_STAGGER_MS * 4}ms` },
  [REDUCED]: { '& > *': { animation: 'none' } },
};

const groupLabel = (n: number) => `${n} ${n === 1 ? 'llamada a herramienta' : 'llamadas a herramientas'}`;

/** Consecutive tool calls of one turn folded under a single trigger (MUI). Same props as the kit's ToolGroup. */
export function ToolGroup({
  count,
  active = false,
  variant = 'outline',
  open,
  defaultOpen = false,
  onOpenChange,
  label = groupLabel,
  children,
  className,
}: ToolGroupProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const id = React.useId();
  const framed = variant !== 'ghost';
  return (
    <Box className={className} data-variant={variant} sx={{
      width: '100%', borderRadius: 1,
      ...(framed ? { py: '12px', border: 1, borderColor: 'divider' } : null),
      ...(variant === 'muted' ? { bgcolor: 'ai.surfaceMuted', '& pre': { bgcolor: 'background.paper' } } : null),
    }}>
      <ButtonBase disableRipple aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(!isOpen)}
        sx={(t) => ({ ...triggerSx(t), ...(framed ? { width: '100%', px: 2, py: 0, color: 'text.primary' } : null) })}>
        {active ? <Box component="span" sx={{ display: 'inline-flex', color: 'ai.toolStatus.running' }}><CircularProgress size={10} thickness={4.4} disableShrink aria-hidden="true" sx={{ animationDuration: '.6s' }} /></Box> : null}
        <Typography variant="caption" component="span" data-active={active || undefined}
          sx={(t) => ({
            display: 'inline-block', fontWeight: framed ? t.typography.fontWeightMedium : t.typography.fontWeightRegular,
            flex: framed ? 1 : undefined, ...(active ? shimmerTextSx(t) : null),
          })}>{label(count)}</Typography>
        <Lucide name="chevron-down" size={12} sx={chevronSx(isOpen)} />
      </ButtonBase>
      <Collapse in={isOpen} id={id} sx={isOpen ? undefined : { pointerEvents: 'none' }}>
        <Stack useFlexGap sx={{
          mt: framed ? '12px' : '4px', gap: framed ? 1 : '4px',
          ...(framed ? { p: '12px 16px 0', borderTop: 1, borderColor: 'divider' } : null),
          ...(isOpen ? RISE : null),
        }}>{children}</Stack>
      </Collapse>
    </Box>
  );
}
