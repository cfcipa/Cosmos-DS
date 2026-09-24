// Cosmos DS · Kit IA · Knowledge: Memory.
// Tablero «Memory»: lo que ahora recuerda de ti, escrito durante el turno y que puedes quitar.
// Como en assistant-ui: el encabezado cuenta solo lo agregado o actualizado en este turno («Recordé N»; si no hay, «Memoria»);
// agregados y actualizados comparten el mismo aspecto (primary) y lo que ya estaba queda neutro. Con onForget cada chip se
// puede olvidar (Chip de MUI con onDelete: también con Supr o Retroceso cuando tiene el foco).
import * as React from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';
import { Brain, X } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

export type MemoryChange = 'added' | 'updated' | 'existing';

export interface MemoryItem {
  id: string;
  text: string;
  change: MemoryChange;
}

export interface MemoryChipsProps {
  chips: readonly MemoryItem[];
  /** Olvida un recuerdo. Sin él, los chips no se pueden quitar. */
  onForget?: (id: string) => void;
  /** Default «Recordé N» cuando hay cambios en el turno, 'Memoria' si no. */
  label?: (fresh: number) => string;
  className?: string;
}

const defaultLabel = (fresh: number) => (fresh > 0 ? `Recordé ${fresh}` : 'Memoria');
const pop = keyframes`from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: none; }`;

export function MemoryChips({ chips, onForget, label = defaultLabel, className }: MemoryChipsProps) {
  const fresh = chips.filter((chip) => chip.change !== 'existing').length;

  return (
    <Stack spacing={1} className={className} data-slot="memory-chips">
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'action.active' }}>
        <Brain size={14} aria-hidden="true" />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'fontWeightMedium', fontVariantNumeric: 'tabular-nums' }}>
          {label(fresh)}
        </Typography>
      </Stack>
      {chips.length ? (
        <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {chips.map((chip) => {
            const isFresh = chip.change !== 'existing';
            return (
              <Chip
                key={chip.id}
                size="small"
                variant="outlined"
                color={isFresh ? 'primary' : 'default'}
                label={chip.text}
                title={chip.text}
                onDelete={onForget ? () => onForget(chip.id) : undefined}
                deleteIcon={
                  <Tooltip title="Olvidar">
                    <X size={14} aria-label={`Olvidar «${chip.text}»`} />
                  </Tooltip>
                }
                sx={(t) => ({
                  maxWidth: '100%',
                  bgcolor: isFresh ? alpha(t.palette.primary.main, t.palette.action.hoverOpacity) : 'background.paper',
                  animation: `${pop} ${t.transitions.duration.standard}ms ${t.transitions.easing.easeInOut} both`,
                  [REDUCED_MOTION]: { animation: 'none' },
                })}
              />
            );
          })}
        </Stack>
      ) : null}
    </Stack>
  );
}
