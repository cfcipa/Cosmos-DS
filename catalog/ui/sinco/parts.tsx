// Piezas de la pantalla de Obligaciones que se repiten entre tableros: la barra de selección de la tabla, el chip de
// estado y el chip de filtro.
import * as React from 'react';
import Box from '@mui/material/Box';
import Chip, { type ChipProps } from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { Check, Reply } from 'lucide-react';
import { AuiAskAiAction } from '../../../src/ai/aui';
import { CHIP, money, type Estado } from './obligaciones';

const ICON = 16;
const SMALL_ICON = 14;
/** Alto de la barra de selección: el de la fila de pestañas menos su margen. */
const BAR_MIN_HEIGHT = 4.75;

/** La barra «n seleccionadas» de la tabla (MUI EnhancedTableToolbar): total, «Preguntar a la IA» y la acción. */
export function SelectionBar({ count, total, askAi = true, action }: { count: number; total?: number; askAi?: boolean; action?: React.ReactNode }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      role="toolbar"
      aria-label="Selección"
      data-slot="selection-bar"
      sx={(t) => ({ display: 'inline-flex', bgcolor: alpha(t.palette.primary.main, t.palette.action.selectedOpacity), borderRadius: 1, py: 0.5, pr: 0.5, pl: 1.5, minHeight: t.spacing(BAR_MIN_HEIGHT) })}
    >
      <Typography variant="subtitle1" color="primary" noWrap>{count === 1 ? '1 seleccionada' : `${count} seleccionadas`}</Typography>
      <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
      {total !== undefined ? <Typography variant="body2" noWrap sx={{ fontVariantNumeric: 'tabular-nums' }}>Total de {money(total)}</Typography> : null}
      {askAi ? <AuiAskAiAction /> : null}
      {action ? <><Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />{action}</> : null}
    </Stack>
  );
}

/** El estado de una obligación, en su tono suave; con motivo (rechazo), el ícono lo muestra al pasar. */
export function EstadoChip({ estado, motivo }: { estado: Estado; motivo?: string }) {
  const chip = CHIP[estado];
  return (
    <Chip
      size="small"
      label={motivo ? (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          {chip.label}
          <Tooltip title={motivo}><Box component="span" tabIndex={0} aria-label={motivo} sx={{ display: 'inline-flex' }}><Reply size={SMALL_ICON} /></Box></Tooltip>
        </Box>
      ) : chip.label}
      sx={(t: Theme) => ({
        borderRadius: 1,
        ...(chip.color === 'grey'
          ? { bgcolor: t.palette.grey[200], color: 'text.secondary' }
          : { bgcolor: alpha(t.palette[chip.color].main, t.palette.action.selectedOpacity), color: `${chip.color}.dark` }),
      })}
    />
  );
}

/** Un chip de filtro (Chip outlined): marcado lleva el check y el tono de primary. */
export function FilterChip({ on, icon, ...props }: { on: boolean } & Omit<ChipProps, 'variant' | 'color'>) {
  return (
    <Chip
      {...props}
      variant="outlined"
      color={on ? 'primary' : 'default'}
      icon={icon ?? (on ? <Check size={ICON} /> : undefined)}
      aria-pressed={on}
      sx={[(t) => ({ borderRadius: 1, ...(on && { bgcolor: alpha(t.palette.primary.main, t.palette.action.selectedOpacity) }) }), ...(Array.isArray(props.sx) ? props.sx : [props.sx])]}
    />
  );
}
