import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

/**
 * Playground de un elemento, igual a los tableros aprobados del lienzo:
 * (sección · título · descripción) → demo en contexto → Properties → código.
 */
export function ElementPage({ section, title, description, demoHeight = 440, demo, properties, code }: {
  section?: string; title?: string; description?: string; demoHeight?: number;
  demo: React.ReactNode; properties?: React.ReactNode; code?: string;
}) {
  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {title ? <Stack spacing={0.5}>
        <Typography variant="overline" sx={{ color: 'primary.main', lineHeight: '24px' }}>{section}</Typography>
        <Typography component="h1" variant="h5" sx={{ m: 0 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
      </Stack> : null}
      <Box sx={{ position: 'relative', height: demoHeight, flexShrink: 0, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper', overflow: 'hidden' }}>
        {demo}
      </Box>
      {properties ? (
        <Stack spacing={1.5}>
          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: '24px' }}>Properties</Typography>
          {properties}
        </Stack>
      ) : null}
      {code ? (
        <Box component="pre" sx={(t) => ({ m: 0, p: 1.5, borderRadius: 1, bgcolor: t.palette.ai.surfaceMuted, ...t.aiKit.code, fontSize: 12, lineHeight: '18px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'text.primary' })}>{code}</Box>
      ) : null}
    </Stack>
  );
}

/** Fila de propiedad: etiqueta a la izquierda (112px), control a la derecha. */
export function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ minHeight: 32 }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 112, flexShrink: 0 }}>{label}</Typography>
      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>{children}</Stack>
    </Stack>
  );
}

/** Selector segmentado de una propiedad (ToggleButtonGroup de MUI). */
export function PropToggle<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: Array<[T, string]>; onChange: (v: T) => void;
}) {
  return (
    <ToggleButtonGroup size="small" color="primary" exclusive value={value} aria-label={label} onChange={(_e, v) => { if (v !== null) onChange(v as T); }}>
      {options.map(([v, l]) => <ToggleButton key={v} value={v} sx={{ textTransform: 'none', px: 1.25, whiteSpace: 'nowrap' }}>{l}</ToggleButton>)}
    </ToggleButtonGroup>
  );
}
