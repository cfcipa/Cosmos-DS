import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

const meta: Meta = { title: 'Tema', parameters: { demoWidth: 960, controls: { disable: true } } };
export default meta;

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
      <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: value, border: 1, borderColor: 'divider', flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{name}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{value}</Typography>
      </Box>
    </Stack>
  );
}
function Group({ title, items }: { title: string; items: Array<[string, string]> }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>{title}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
        {items.map(([n, v]) => <Swatch key={n} name={n} value={v} />)}
      </Box>
    </Box>
  );
}

export const Colores: StoryObj = {
  render: () => {
    const t = useTheme();
    const p = t.palette;
    const main = (k: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success') =>
      [['main', p[k].main], ['light', p[k].light], ['dark', p[k].dark], ['contrastText', p[k].contrastText]].map(([a, b]) => [k + '.' + a, b]) as Array<[string, string]>;
    const ai = p.ai;
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>Colores · {p.mode}</Typography>
        <Group title="Primary" items={main('primary')} />
        <Group title="Secondary" items={main('secondary')} />
        <Group title="Semánticos" items={[...main('error'), ...main('warning'), ...main('info'), ...main('success')]} />
        <Group title="Texto y fondo" items={[['text.primary', p.text.primary], ['text.secondary', p.text.secondary], ['text.disabled', p.text.disabled], ['divider', p.divider], ['background.default', p.background.default], ['background.paper', p.background.paper]]} />
        <Group title="Kit IA · palette.ai (derivado de la marca)" items={[
          ['ai.markStart', ai.markStart], ['ai.markEnd', ai.markEnd], ['ai.userBubble', ai.userBubble], ['ai.surfaceMuted', ai.surfaceMuted],
          ['ai.focusRing', ai.focusRing], ['toolStatus.running', ai.toolStatus.running], ['toolStatus.complete', ai.toolStatus.complete],
          ['toolStatus.error', ai.toolStatus.error], ['toolStatus.requiresAction', ai.toolStatus.requiresAction], ['toolStatus.cancelled', ai.toolStatus.cancelled],
        ]} />
      </Box>
    );
  },
};

const VARIANTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'body3', 'button', 'caption', 'overline'] as const;
export const Tipografia: StoryObj = {
  name: 'Tipografía',
  render: () => {
    const t = useTheme();
    return (
      <Stack spacing={2}>
        {VARIANTS.map((v) => {
          const s = (t.typography as unknown as Record<string, React.CSSProperties>)[v] || {};
          return (
            <Stack key={v} direction="row" spacing={3} alignItems="baseline">
              <Typography variant="caption" color="text.secondary" sx={{ width: 180, flexShrink: 0, fontFamily: 'monospace' }}>
                {v} · {String(s.fontSize)} / {String(s.lineHeight)} · {String(s.fontWeight)}
              </Typography>
              <Typography variant={v}>Asistente Cosmos</Typography>
            </Stack>
          );
        })}
      </Stack>
    );
  },
};
