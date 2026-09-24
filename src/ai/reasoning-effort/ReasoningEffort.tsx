// Cosmos DS · Kit IA · Reasoning: Reasoning effort.
// Tablero aprobado «Reasoning effort»: cuánto pensar, y cuánto de ese presupuesto gastó de verdad la ejecución.
// Selector de nivel (ToggleButtonGroup) + barra de consumo (LinearProgress), todo desde el tema.
import * as React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { useControllable } from '../lib/useControllable';

export interface ReasoningEffortLevel {
  key: string;
  label: string;
  /** Presupuesto de tokens de razonamiento de este nivel. */
  budget: number;
}

export interface ReasoningEffortProps {
  levels: ReasoningEffortLevel[];
  /** Nivel elegido: controlado / no controlado. Default: el primero. */
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string) => void;
  /** Tokens gastados en la ejecución. La barra se llena hasta el 100 % aunque se pase del presupuesto. */
  spent?: number;
  /** Default 'Esfuerzo de razonamiento'. */
  label?: string;
  className?: string;
}

/** Medidas del tablero. */
const LEVEL_HEIGHT = 36;
const BAR_HEIGHT = 4;
const BAR_TRANSITION = 'transform 200ms linear';

const formatTokens = (tokens: number) => Math.round(tokens).toLocaleString('es-CO');

/** Pista de la barra: el tinte claro del primary en modo claro, la superficie seleccionada en oscuro. */
const trackColor = (t: Theme) => {
  const primaryScale = t.palette.primary as unknown as Record<number, string | undefined>;
  return t.palette.mode === 'dark' ? t.palette.action.selected : primaryScale[100] ?? t.palette.action.selected;
};

export function ReasoningEffort({
  levels,
  selectedKey,
  defaultSelectedKey,
  onSelect,
  spent = 0,
  label = 'Esfuerzo de razonamiento',
  className,
}: ReasoningEffortProps) {
  const labelId = React.useId();
  const [currentKey, setCurrentKey] = useControllable(selectedKey, defaultSelectedKey ?? levels[0]?.key ?? '', onSelect);
  const currentLevel = levels.find((level) => level.key === currentKey);
  const budget = currentLevel?.budget ?? 0;
  const percent = budget ? Math.max(0, Math.min(100, (spent / budget) * 100)) : 0;

  return (
    <Stack spacing={1.25} className={className} sx={{ width: '100%', maxWidth: 384 }}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={1.5}>
        <Typography id={labelId} component="span" variant="subtitle1">{label}</Typography>
        <Box
          component="span"
          sx={(t) => ({
            ...t.aiKit.code,
            fontSize: t.typography.body3.fontSize,
            lineHeight: t.typography.body3.lineHeight,
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
          })}
        >
          {`${formatTokens(spent)} / ${formatTokens(budget)}`}
        </Box>
      </Stack>

      <ToggleButtonGroup
        exclusive
        fullWidth
        color="primary"
        size="small"
        value={currentKey}
        aria-labelledby={labelId}
        onChange={(_event, key: string | null) => { if (key !== null) setCurrentKey(key); }}
      >
        {levels.map((level) => (
          <ToggleButton key={level.key} value={level.key} sx={{ height: LEVEL_HEIGHT, textTransform: 'none' }}>
            {level.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <LinearProgress
        variant="determinate"
        value={percent}
        aria-labelledby={labelId}
        aria-valuetext={`${formatTokens(spent)} de ${formatTokens(budget)}`}
        sx={(t) => ({
          height: BAR_HEIGHT,
          borderRadius: BAR_HEIGHT / 2,
          bgcolor: trackColor(t),
          '& .MuiLinearProgress-bar': { transition: BAR_TRANSITION, [REDUCED_MOTION]: { transition: 'none' } },
        })}
      />
    </Stack>
  );
}
