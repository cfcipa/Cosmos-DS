// Cosmos DS · Kit IA · Thread: Settings panel.
// Referente: assistant-ui «Settings panel» (elements/settings-panel.tsx): modelo, instrucciones del sistema,
// temperatura y lo que el asistente tiene permitido hacer. Cada control es de solo lectura si no llega su callback;
// la temperatura se limita a 0–2 antes de pintarse.
import * as React from 'react';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { fieldSx } from '../lib/thread';

export interface SettingToggle {
  key: string;
  label: string;
  detail: string;
  on: boolean;
}

export interface SettingsPanelProps {
  model: string;
  models: readonly string[];
  systemPrompt: string;
  temperature: number;
  toggles: readonly SettingToggle[];
  onModelChange?: (model: string) => void;
  onSystemPromptChange?: (prompt: string) => void;
  onTemperatureChange?: (temperature: number) => void;
  onToggle?: (key: string) => void;
  className?: string;
  sx?: SxProps<Theme>;
}

const MAX_WIDTH = 384;
const clamp = (n: number, min: number, max: number) => (Number.isNaN(n) ? min : Math.min(max, Math.max(min, n)));
const fmt = (n: number) => n.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function SettingsPanel({
  model, models, systemPrompt, temperature, toggles,
  onModelChange, onSystemPromptChange, onTemperatureChange, onToggle, className, sx,
}: SettingsPanelProps) {
  const id = React.useId();
  const temp = clamp(temperature, 0, 2);
  const label = (text: string, htmlId: string) => <Typography id={htmlId} variant="caption" color="text.disabled">{text}</Typography>;

  return (
    <Paper
      variant="outlined"
      data-slot="settings-panel"
      className={className}
      sx={[{ width: '100%', maxWidth: MAX_WIDTH, boxSizing: 'border-box', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack spacing={0.75}>
        {label('modelo', `${id}-model`)}
        <ToggleButtonGroup
          size="small"
          exclusive
          fullWidth
          value={model}
          disabled={!onModelChange}
          aria-labelledby={`${id}-model`}
          onChange={(_e, v: string | null) => { if (v !== null) onModelChange?.(v); }}
          sx={(t) => ({
            ...fieldSx(),
            p: 0.25,
            gap: 0.25,
            borderRadius: 1,
            '& .MuiToggleButton-root': { ...t.typography.body3, fontWeight: t.typography.fontWeightMedium, textTransform: 'none', border: 0, borderRadius: `${t.shape.borderRadius}px !important`, py: 0.5, color: 'text.secondary' },
            '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover': { bgcolor: 'background.paper', color: 'text.primary', boxShadow: t.shadows[1] },
          })}
        >
          {models.map((m) => <ToggleButton key={m} value={m}>{m}</ToggleButton>)}
        </ToggleButtonGroup>
      </Stack>

      <Stack spacing={0.75}>
        {label('instrucciones del sistema', `${id}-prompt`)}
        <InputBase
          multiline
          rows={3}
          value={systemPrompt}
          onChange={(event) => onSystemPromptChange?.(event.target.value)}
          readOnly={!onSystemPromptChange}
          inputProps={{ 'aria-labelledby': `${id}-prompt` }}
          sx={(t) => ({ ...fieldSx(), ...t.typography.body3, borderRadius: 1, px: 1.5, py: 1, '&.Mui-focused': { outline: `1px solid ${t.palette.ai.focusRing}` } })}
        />
      </Stack>

      <Stack spacing={0.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          {label('temperatura', `${id}-temp`)}
          <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(temp)}</Typography>
        </Stack>
        <Slider
          size="small"
          min={0}
          max={2}
          step={0.1}
          value={temp}
          disabled={!onTemperatureChange}
          aria-labelledby={`${id}-temp`}
          onChange={(_e, v) => onTemperatureChange?.(v as number)}
        />
      </Stack>

      <Stack spacing={1.25}>
        {toggles.map((toggle) => (
          <Stack key={toggle.key} direction="row" alignItems="center" spacing={1.5}>
            <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography id={`${id}-${toggle.key}`} variant="body2" noWrap>{toggle.label}</Typography>
              <Typography variant="body3" color="text.disabled" noWrap>{toggle.detail}</Typography>
            </Stack>
            <Switch
              size="small"
              checked={toggle.on}
              disabled={!onToggle}
              onChange={() => onToggle?.(toggle.key)}
              inputProps={{ role: 'switch', 'aria-labelledby': `${id}-${toggle.key}` }}
            />
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
