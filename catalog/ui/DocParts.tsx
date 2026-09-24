import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useTheme } from '@mui/material/styles';

/** Bloques comunes de la página de un elemento (para el equipo: probar, usar, ajustar). */
export function DocSection({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <Box component="section" sx={{ mt: 6 }}>
      <Typography component="h2" variant="h6" sx={{ mb: lead ? 0.5 : 1.5 }}>{title}</Typography>
      {lead ? <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{lead}</Typography> : null}
      {children}
    </Box>
  );
}

export function Code({ children }: { children: string }) {
  return (
    <Box component="pre" sx={(t) => ({ m: 0, p: 2, borderRadius: 1, bgcolor: t.palette.ai.surfaceMuted, ...t.aiKit.code, fontSize: 13, lineHeight: '20px', overflowX: 'auto', color: 'text.primary' })}>{children}</Box>
  );
}

/** Filas etiqueta → contenido (guía, piezas). */
export function Facts({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <Stack divider={<Box sx={{ borderTop: 1, borderColor: 'divider' }} />} sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
      {rows.map(([k, v]) => (
        <Stack key={k} direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }} sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" sx={{ width: { sm: 180 }, flexShrink: 0, fontWeight: 500 }}>{k}</Typography>
          <Box sx={{ typography: 'body2', color: 'text.secondary', minWidth: 0 }}>{v}</Box>
        </Stack>
      ))}
    </Stack>
  );
}

/** Valor del tema con su muestra de color, resuelto en vivo para el modo actual. */
export function Token({ path }: { path: string }) {
  const t = useTheme();
  const value = path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], t.palette) as string;
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mr: 1.5, whiteSpace: 'nowrap' }}>
      <Box component="span" sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: value, border: 1, borderColor: 'divider' }} />
      <Box component="code" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.primary' }}>{path}</Box>
      <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{value}</Box>
    </Box>
  );
}

export function PropsTable({ rows }: { rows: Array<{ name: string; type: string; default?: string; description: string }> }) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflowX: 'auto' }}>
      <Table size="small">
        <TableHead><TableRow><TableCell>Prop</TableCell><TableCell>Valores</TableCell><TableCell>Por defecto</TableCell><TableCell>Para qué</TableCell></TableRow></TableHead>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={p.name}>
              <TableCell sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{p.name}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{p.type}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'nowrap' }}>{p.default || '—'}</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{p.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
