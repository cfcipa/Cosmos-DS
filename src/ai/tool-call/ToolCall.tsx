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
import { formatToolDuration } from './types';
import type { ToolCallProps, ToolCallStatus, ToolApprovalProps, ToolApprovalOption, ToolGroupProps } from './types';


const EASE = 'cubic-bezier(.32, .72, 0, 1)';
const shimmer = keyframes`from { background-position: 100% 0; } to { background-position: -100% 0; }`;
const REDUCED = '@media (prefers-reduced-motion: reduce)';

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
  prompt, options = DEFAULT_OPTIONS, mode = 'buttons', onRespond, disabled = false, error,
  answer, defaultAnswer = '', onAnswerChange, fieldLabel = 'Respuesta', placeholder = 'Escribe tu respuesta',
  submitLabel = 'Enviar', dismissLabel = 'Descartar', confirmLabel = 'Confirmar', backLabel = 'Volver',
  emptyError = 'La respuesta no puede estar vacía.',
}: ToolApprovalProps) {
  const [confirming, setConfirming] = React.useState<string | null>(null);
  const [text, setText] = useControllable(answer, defaultAnswer, onAnswerChange);
  const [localErr, setLocalErr] = React.useState('');
  const conf = confirming ? options.find((o) => o.id === confirming) : undefined;
  const respond = (oid: string, a?: string) => { setConfirming(null); if (onRespond) onRespond(oid, a); };
  const err = error || localErr;
  return (
    <Stack data-slot={conf ? 'approval-confirm' : 'approval'} useFlexGap
      sx={{ alignItems: 'flex-start', gap: 1, pt: '4px', alignSelf: mode === 'text' ? 'stretch' : undefined }}>
      {conf && conf.confirm ? (
        <>
          <Typography component="p" sx={{ ...pSx, fontWeight: 'fontWeightBold', color: 'text.primary' }}>{conf.confirm.title}</Typography>
          {conf.confirm.description ? <Typography component="p" sx={{ ...pSx, color: 'text.secondary' }}>{conf.confirm.description}</Typography> : null}
          {conf.confirm.grants && conf.confirm.grants.length ? (
            <Stack component="ul" useFlexGap sx={{ listStyle: 'none', m: 0, p: 0, gap: '4px' }}>
              {conf.confirm.grants.map((g) => (
                <li key={g}><Box component="code" sx={(t) => ({ ...t.aiKit.code, fontSize: t.typography.caption.fontSize, lineHeight: t.typography.caption.lineHeight, display: 'inline-block', px: '6px', py: '2px', borderRadius: 1, bgcolor: 'ai.surfaceMuted' })}>{g}</Box></li>
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
              {options.map((o, i) => (
                <Button key={o.id} variant={i === 0 ? 'contained' : 'outlined'} disabled={disabled}
                  onClick={() => { if (o.confirm && o.kind !== 'reject') setConfirming(o.id); else respond(o.id); }}>{o.label}</Button>
              ))}
            </Actions>
          ) : (
            <>
              <TextField label={fieldLabel} placeholder={placeholder} value={text} disabled={disabled} multiline fullWidth
                onChange={(e) => { setText(e.target.value); if (localErr) setLocalErr(''); }}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: '4px', '& .MuiOutlinedInput-root': { p: '12px 14px' }, '& textarea': { minHeight: 32 } }} />
              <Actions>
                <Button variant="contained" disabled={disabled} onClick={() => { if (!text.trim()) { setLocalErr(emptyError); return; } respond('submit', text.trim()); }}>{submitLabel}</Button>
                <Button variant="outlined" disabled={disabled} onClick={() => respond('dismiss')}>{dismissLabel}</Button>
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
/** Pretty JSON with arrays of scalars kept on one line (the board's look). */
const show = (v: string | object) => (typeof v === 'string' ? v
  : JSON.stringify(v, null, 2).replace(/\[\s+([^\[\]{}]*?)\s+\]/g, (_m, items: string) => '[' + items.split(/,\s+/).join(', ') + ']'));

const rise = keyframes`from { opacity: 0; translate: 0 4px; } to { opacity: 1; translate: 0 0; }`;
/** Running label: the secondary text with a moving highlight (plain secondary text under reduced motion). */
const shimmerSx = (t: Theme) => ({
  color: 'transparent', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', animation: shimmer + ' 2s linear infinite',
  backgroundImage: 'linear-gradient(90deg, ' + ([[t.palette.text.secondary, 0], [t.palette.text.secondary, 35], [t.palette.ai.iconDisabled, 50], [t.palette.text.secondary, 65], [t.palette.text.secondary, 100]] as Array<[string, number]>).map(([c, p]) => c + ' ' + p + '%').join(', ') + ')',
  [REDUCED]: { color: 'text.secondary', backgroundImage: 'none', animation: 'none' },
});
const triggerSx = (t: Theme) => ({
  width: 'fit-content', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1, py: '6px', px: 0,
  borderRadius: 1, textAlign: 'left', ...font(t.typography.body1), color: 'text.secondary', transformOrigin: 'left',
  transition: 'color .15s, transform .1s', '&:hover': { color: 'text.primary' }, '&:active': { transform: 'scale(.98)' },
  '&.Mui-focusVisible': { outline: '2px solid ' + t.palette.ai.focusRing, outlineOffset: 2 },
});
const chevronSx = (open: boolean) => ({ flexShrink: 0, transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .2s ' + EASE });
const preSx = (dim?: boolean) => (t: Theme) => ({
  m: 0, p: '10px', borderRadius: 1, bgcolor: 'ai.surfaceMuted', ...t.aiKit.code, color: 'text.primary',
  whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', opacity: dim ? 0.6 : 1,
});
const bodySx = (open: boolean) => (t: Theme) => ({
  display: 'flex', flexDirection: 'column', gap: 1, p: '4px 0 8px 24px', ...font(t.typography.body1),
  transition: ['opacity', 'transform', 'filter'].map((p) => p + ' .2s ' + EASE).join(', '),
  ...(open ? null : { opacity: 0, transform: 'translateY(-4px)', filter: 'blur(2px)' }),
});

/** A tool call inside an assistant message (ToolFallback) on MUI: status icon, name, duration, collapsible args/result, and the approval when it requires action. */
export function ToolCall({
  toolName, status = 'complete', args, result, error, durationMs, startedAt, open, defaultOpen = false, onOpenChange,
  approval, children, usedLabel = 'Herramienta usada', cancelledLabel = 'Herramienta cancelada', requiresActionLabel = 'Requiere aprobación',
  errorTitle = 'Error:', cancelTitle = 'Motivo de la cancelación:', resultLabel = 'Resultado:', className,
}: ToolCallProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const [, tick] = React.useState(0);
  const live = status === 'running' && durationMs === undefined && startedAt !== undefined;
  React.useEffect(() => {
    if (!live) return undefined;
    const t = window.setInterval(() => tick((n) => n + 1), 100);
    return () => clearInterval(t);
  }, [live]);
  const ra = status === 'requires-action';
  const expanded = ra || isOpen;
  const ms = durationMs !== undefined ? durationMs : live ? Date.now() - (startedAt as number) : undefined;
  const verb = status === 'cancelled' ? cancelledLabel : ra ? requiresActionLabel : usedLabel;
  const hasErr = (status === 'error' || status === 'cancelled') && !!error;
  const running = status === 'running';
  const cancelled = status === 'cancelled';
  return (
    <Box className={className} data-status={status} sx={{ width: '100%', fontFamily: 'fontFamily' }}>
      <ButtonBase disableRipple aria-expanded={expanded} onClick={() => { if (!ra) setOpen(!isOpen); }} sx={triggerSx}>
        <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0, width: 16, height: 16, alignItems: 'center', justifyContent: 'center', color: STATUS_COLOR[status] }}>
          {running ? <CircularProgress size={13} thickness={4.4} disableShrink aria-hidden="true" sx={{ animationDuration: '.6s' }} />
            : <Lucide name={status === 'complete' ? 'check' : ra ? 'circle-alert' : 'circle-x'} />}
        </Box>
        <Box component="span" sx={(t) => ({
          minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          ...(cancelled ? { textDecoration: 'line-through', color: 'ai.toolStatus.cancelled' } : null),
          ...(running ? shimmerSx(t) : null),
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
          {ra && approval ? <ToolApproval {...approval} /> : null}
          {result !== undefined && !ra ? (
            <div>
              <Typography variant="caption" component="p" sx={{ m: '0 0 4px', fontWeight: 500, color: 'text.secondary' }}>{resultLabel}</Typography>
              <Box component="pre" sx={preSx()}>{show(result)}</Box>
            </div>
          ) : null}
        </Box>
      </Collapse>
    </Box>
  );
}

/** Children rise in one after another when the group opens (40ms stagger, like the kit). */
const RISE: Record<string, object> = { '& > *': { animation: rise + ' .2s ' + EASE + ' both' }, '& > *:nth-of-type(n+5)': { animationDelay: '160ms' }, [REDUCED]: { '& > *': { animation: 'none' } } };
[2, 3, 4].forEach((n) => { RISE['& > *:nth-of-type(' + n + ')'] = { animationDelay: (n - 1) * 40 + 'ms' }; });

const groupLabel = (n: number) => n + (n === 1 ? ' llamada a herramienta' : ' llamadas a herramientas');

/** Consecutive tool calls of one turn folded under a single trigger (MUI). Same props as the kit's ToolGroup. */
export function ToolGroup({
  count, active = false, variant = 'outline', open, defaultOpen = false, onOpenChange, label = groupLabel, children, className,
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
          sx={(t) => ({ display: 'inline-block', fontWeight: framed ? 500 : 400, flex: framed ? 1 : undefined, ...(active ? shimmerSx(t) : null) })}>{label(count)}</Typography>
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
