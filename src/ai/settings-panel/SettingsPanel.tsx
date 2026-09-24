// Cosmos DS · Kit IA · Thread: Settings panel.
// Tablero «Settings panel»: modelo, instrucciones del sistema, temperatura y lo que el asistente tiene permitido hacer.
// Como en assistant-ui: cada control es de solo lectura si no llega su callback; la temperatura se limita a 0–2 antes
// de pintarse. ToggleButtonGroup, TextField, Slider y Switch de MUI con los estilos que Cosmos define para ellos.
import * as React from 'react';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

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

const MAX_WIDTH = 448;
const clamp = (n: number, min: number, max: number) => (Number.isNaN(n) ? min : Math.min(max, Math.max(min, n)));
const fmt = (n: number) => n.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function SettingsPanel({
  model, models, systemPrompt, temperature, toggles,
  onModelChange, onSystemPromptChange, onTemperatureChange, onToggle, className, sx,
}: SettingsPanelProps) {
  const id = React.useId();
  const temp = clamp(temperature, 0, 2);
  const label = (text: string, htmlId?: string) => <Typography id={htmlId} variant="body1" color="text.secondary">{text}</Typography>;

  return (
    <Stack spacing={2.5} data-slot="settings-panel" className={className} sx={[{ width: '100%', maxWidth: MAX_WIDTH }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack spacing={0.75}>
        {label('Modelo', `${id}-model`)}
        <ToggleButtonGroup
          size="small"
          color="primary"
          exclusive
          fullWidth
          value={model}
          disabled={!onModelChange}
          aria-labelledby={`${id}-model`}
          onChange={(_e, v: string | null) => { if (v !== null) onModelChange?.(v); }}
        >
          {models.map((m) => <ToggleButton key={m} value={m} sx={{ textTransform: 'none' }}>{m}</ToggleButton>)}
        </ToggleButtonGroup>
      </Stack>

      <TextField
        label="Instrucciones del sistema"
        multiline
        rows={3}
        fullWidth
        value={systemPrompt}
        onChange={(event) => onSystemPromptChange?.(event.target.value)}
        InputProps={{ readOnly: !onSystemPromptChange }}
        sx={{ mt: 1 }}
      />

      <Stack spacing={0.75}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          {label('Temperatura', `${id}-temp`)}
          <Typography variant="subtitle1" sx={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(temp)}</Typography>
        </Stack>
        <Slider
          min={0}
          max={2}
          step={0.1}
          value={temp}
          disabled={!onTemperatureChange}
          aria-labelledby={`${id}-temp`}
          onChange={(_e, v) => onTemperatureChange?.(v as number)}
          sx={(t) => ({
            py: 1,
            '&:not(.Mui-disabled) .MuiSlider-track': { border: 0, background: `linear-gradient(90deg, ${t.palette.ai.markStart}, ${t.palette.ai.markEnd})` },
          })}
        />
      </Stack>

      <Stack spacing={0.5}>
        {label('Permisos')}
        {toggles.map((toggle) => (
          <Stack key={toggle.key} direction="row" alignItems="center" spacing={2} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography id={`${id}-${toggle.key}`} variant="body1">{toggle.label}</Typography>
              <Typography variant="body2" color="text.secondary">{toggle.detail}</Typography>
            </Stack>
            <Switch
              checked={toggle.on}
              disabled={!onToggle}
              onChange={() => onToggle?.(toggle.key)}
              inputProps={{ 'aria-labelledby': `${id}-${toggle.key}` }}
            />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
