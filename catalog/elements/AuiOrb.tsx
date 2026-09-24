import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { AuiVoiceControl, AuiVoiceOrb, type VoiceOrbState, type VoiceOrbVariant } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

/** Tamaño del orbe en la demo del tablero: 150px. */
const DEMO_ORB = 150;
type StateOpt = 'auto' | VoiceOrbState;

function OrbDemo({ variant = 'default', state = 'auto', size = DEMO_ORB }: { variant?: VoiceOrbVariant; state?: StateOpt; size?: number }) {
  return (
    <Stack alignItems="center" spacing={3}>
      <AuiVoiceOrb variant={variant} state={state === 'auto' ? undefined : state} sx={{ width: size, height: size }} />
      <AuiVoiceControl sx={(t) => ({ minHeight: t.spacing(5.5), boxSizing: 'border-box', py: 0.5, pl: 1.75, pr: 0.75, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' })} />
    </Stack>
  );
}

export function AuiOrbDoc() {
  const [variant, setVariant] = React.useState<VoiceOrbVariant>('primary');
  const [state, setState] = React.useState<StateOpt>('auto');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AuiDemoRuntime voice><OrbDemo variant={variant} state={state} /></AuiDemoRuntime></Box>}
        properties={
          <>
            <PropRow label="state"><PropToggle<StateOpt> label="state" value={state} onChange={setState} options={[['auto', 'runtime'], ['idle', 'idle'], ['connecting', 'connecting'], ['listening', 'listening'], ['speaking', 'speaking'], ['muted', 'muted']]} /></PropRow>
            <PropRow label="variant"><PropToggle<VoiceOrbVariant> label="variant" value={variant} onChange={setVariant} options={[['default', 'default'], ['primary', 'primary'], ['secondary', 'secondary'], ['success', 'success']]} /></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AuiOrbCard() {
  return <AuiDemoRuntime voice><OrbDemo variant="primary" size={96} /></AuiDemoRuntime>;
}
