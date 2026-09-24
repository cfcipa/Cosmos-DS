// Cosmos DS · Kit IA · Composer: Context.
// Tablero «Context»: un anillo en el riel se llena a medida que crece la conversación y avisa cerca del límite.
// Como en assistant-ui (ComposerContext): al pasar el cursor o con el foco, el detalle por sistema, herramientas y mensajes;
// sobre el 85 % el anillo, el porcentaje y el botón pasan a rojo. El anillo es un CircularProgress de MUI (determinate).
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { paletteScale } from '../lib/paletteScale';
import { primaryTint } from '../lib/primaryTint';

export interface ComposerUsage {
  /** En miles de tokens. */
  system: number;
  tools: number;
  messages: number;
  total: number;
}

/** Desde qué fracción se avisa. */
const WARN_AT = 0.85;
const RING = 16;
/** Ancho del panel en el tablero. */
const PANEL_WIDTH = 260;

const SEGMENTS: Array<{ key: keyof Omit<ComposerUsage, 'total'>; label: string; color: (t: Theme) => string }> = [
  { key: 'system', label: 'Sistema', color: (t) => paletteScale(t, 'primary', 900) },
  { key: 'tools', label: 'Herramientas', color: (t) => t.palette.primary.main },
  { key: 'messages', label: 'Mensajes', color: (t) => paletteScale(t, 'primary', 300) },
];

export function ComposerContext({ usage, label = 'Contexto' }: { usage: ComposerUsage; label?: string }) {
  const [anchor, setAnchor] = React.useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();
  const used = usage.system + usage.tools + usage.messages;
  const fraction = usage.total ? Math.min(1, used / usage.total) : 0;
  const percent = Math.round(fraction * 100);
  const warn = fraction > WARN_AT;
  const accent = warn ? 'error.main' : 'primary.main';

  return (
    <Box data-slot="composer-context" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} sx={{ display: 'inline-flex' }}>
      <Button
        ref={setAnchor}
        variant="text"
        color={warn ? 'error' : 'primary'}
        aria-label="Uso del contexto"
        aria-describedby={open ? panelId : undefined}
        startIcon={
          <Box component="span" aria-hidden="true" sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" value={100} size={RING} thickness={5} sx={(t) => ({ color: primaryTint(t) })} />
            <CircularProgress variant="determinate" value={percent} size={RING} thickness={5} color="inherit" sx={{ position: 'absolute', inset: 0 }} />
          </Box>
        }
        sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily, fontVariantNumeric: 'tabular-nums' })}
      >
        {percent}%
      </Button>
      <Popper id={panelId} open={open && Boolean(anchor)} anchorEl={anchor} placement="top-end" disablePortal sx={{ zIndex: 'tooltip' }} modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}>
        <Paper elevation={8} sx={{ width: PANEL_WIDTH, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2">{label}</Typography>
            <Typography variant="subtitle2" color={accent} sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>{percent}%</Typography>
          </Stack>
          <Stack direction="row" aria-hidden="true" sx={(t) => ({ height: t.spacing(0.75), gap: '2px', borderRadius: 0.5, overflow: 'hidden', bgcolor: primaryTint(t) })}>
            {SEGMENTS.map((segment) => (
              <Box key={segment.key} component="span" sx={(t) => ({ width: `${usage.total ? (usage[segment.key] / usage.total) * 100 : 0}%`, bgcolor: segment.color(t) })} />
            ))}
          </Stack>
          <Stack spacing={0.5}>
            {SEGMENTS.map((segment) => (
              <Stack key={segment.key} direction="row" alignItems="center" spacing={1}>
                <Box component="span" aria-hidden="true" sx={(t) => ({ width: t.spacing(1), height: t.spacing(1), borderRadius: 0.25, bgcolor: segment.color(t) })} />
                <Typography variant="body3" sx={{ flexGrow: 1 }}>{segment.label}</Typography>
                <Typography variant="body3" sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>{usage[segment.key]}k</Typography>
              </Stack>
            ))}
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body3">Total</Typography>
            <Typography variant="body3" sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>{`${used}k / ${usage.total}k`}</Typography>
          </Stack>
        </Paper>
      </Popper>
    </Box>
  );
}
