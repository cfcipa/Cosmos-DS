import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowUp, Plus } from 'lucide-react';
import {
  AuiContextDisplayBar, AuiContextDisplayRing, AuiContextDisplayText, AuiIconButton,
  type AuiContextSide, type AuiTokenUsage,
} from '../../src/ai/aui';
import { userBubbleSx } from '../../src/ai/lib/thread';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

/** La ventana y los niveles del tablero «Context display»; cada mensaje suma ~9k tokens. */
const WINDOW = 128_000;
type Level = 'empty' | 'normal' | 'warning' | 'critical' | 'custom';
const LEVELS: Record<Exclude<Level, 'custom'>, AuiTokenUsage | undefined> = {
  empty: undefined,
  normal: { inputTokens: 23600, cachedInputTokens: 20100, outputTokens: 7200, reasoningTokens: 2900 },
  warning: { inputTokens: 45000, cachedInputTokens: 30000, outputTokens: 12200, reasoningTokens: 5000 },
  critical: { inputTokens: 71300, cachedInputTokens: 41200, outputTokens: 4100, reasoningTokens: 0 },
};
const TURN = { inputTokens: 3200, cachedInputTokens: 3900, outputTokens: 1500, reasoningTokens: 400 };
const addTurn = (u: AuiTokenUsage | undefined): AuiTokenUsage => ({
  inputTokens: (u?.inputTokens ?? 0) + TURN.inputTokens,
  cachedInputTokens: (u?.cachedInputTokens ?? 0) + TURN.cachedInputTokens,
  outputTokens: (u?.outputTokens ?? 0) + TURN.outputTokens,
  reasoningTokens: (u?.reasoningTokens ?? 0) + TURN.reasoningTokens,
});
type Preset = 'ring' | 'bar' | 'text';
const PRESET = { ring: AuiContextDisplayRing, bar: AuiContextDisplayBar, text: AuiContextDisplayText };

function Demo({ preset, usage, side, onSend }: { preset: Preset; usage: AuiTokenUsage | undefined; side: AuiContextSide; onSend: () => void }) {
  const Display = PRESET[preset];
  const [text, setText] = React.useState('');
  const submit = () => { if (!text.trim()) return; setText(''); onSend(); };
  return (
    <Stack spacing={3} sx={{ height: '100%', maxWidth: 480, mx: 'auto', justifyContent: 'flex-end' }}>
      <Typography variant="body1" sx={userBubbleSx()}>Resume los anticipos pendientes de septiembre.</Typography>
      <Typography variant="body1" sx={{ px: 1 }}>Hay 3 anticipos pendientes por $3.930.000. El primero en vencer es CE-4492, de Nubia Rojas, el 30 de septiembre.</Typography>
      <Box component="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); submit(); }}>
        <Paper variant="outlined" sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1, '&:focus-within': { borderColor: 'primary.main' } }}>
          <InputBase
            multiline
            placeholder="Mensaje"
            inputProps={{ 'aria-label': 'Mensaje' }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            sx={{ px: 1.25, py: 0.5 }}
          />
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <AuiIconButton tooltip="Agregar adjunto" size={3.5}><Plus /></AuiIconButton>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Display modelContextWindow={WINDOW} usage={usage} side={side} />
              <AuiIconButton tooltip="Enviar mensaje" size={3.5} disabled={!text.trim()} onClick={submit} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' } }}><ArrowUp /></AuiIconButton>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}

export function AuiContextDisplayDoc() {
  const [preset, setPreset] = React.useState<Preset>('ring');
  const [level, setLevel] = React.useState<Level>('warning');
  const [usage, setUsage] = React.useState<AuiTokenUsage | undefined>(LEVELS.warning);
  const [side, setSide] = React.useState<AuiContextSide>('top');
  const pick = (l: Level) => { setLevel(l); if (l !== 'custom') setUsage(LEVELS[l]); };
  const more = () => { setUsage((u) => addTurn(u)); setLevel('custom'); };
  // «none»: sin uso controlado lo lee del hilo, que aún no reporta nada, y no se dibuja.
  const shown = level === 'empty' ? undefined : usage;
  return (
    <Box sx={{ maxWidth: 640 }}>
      <AuiDemoRuntime>
        <ElementPage
          demoHeight={400}
          demo={<Box sx={{ height: '100%', p: 3, boxSizing: 'border-box' }}><Demo preset={preset} usage={shown} side={side} onSend={more} /></Box>}
          properties={
            <>
              <PropRow label="preset"><PropToggle<Preset> label="preset" value={preset} onChange={setPreset} options={[['ring', 'Ring'], ['bar', 'Bar'], ['text', 'Text']]} /></PropRow>
              <PropRow label="usage"><PropToggle<Level> label="usage" value={level} onChange={pick} options={[['empty', 'none'], ['normal', 'normal · 42%'], ['warning', 'warning · 72%'], ['critical', 'critical · 91%']]} /></PropRow>
              <PropRow label="side"><PropToggle<AuiContextSide> label="side" value={side} onChange={setSide} options={[['top', 'top'], ['right', 'right'], ['bottom', 'bottom'], ['left', 'left']]} /></PropRow>
              <PropRow label="Try it"><Button variant="outlined" onClick={more}>Send a message</Button></PropRow>
            </>
          }
        />
      </AuiDemoRuntime>
    </Box>
  );
}

export function AuiContextDisplayCard() {
  return (
    <AuiDemoRuntime>
      <Stack spacing={2} alignItems="center">
        <AuiContextDisplayRing modelContextWindow={WINDOW} usage={LEVELS.normal} />
        <AuiContextDisplayBar modelContextWindow={WINDOW} usage={LEVELS.warning} />
        <AuiContextDisplayText modelContextWindow={WINDOW} usage={LEVELS.critical} />
      </Stack>
    </AuiDemoRuntime>
  );
}
