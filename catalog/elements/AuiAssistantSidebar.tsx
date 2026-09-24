import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AuiAssistantSidebar } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Assistant sidebar»: la pantalla de la aplicación a la izquierda.
const ROWS = [['CE-4492', 'Nubia Rojas', '$1.850.000'], ['CE-4471', 'Nicolás Pardo', '$1.280.000'], ['CE-4410', 'Andrés Gil', '$800.000']];

function AppScreen() {
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      <Typography variant="subtitle1" component="h2" sx={{ m: 0 }}>Anticipos por legalizar</Typography>
      {ROWS.map(([id, who, amount]) => (
        <Stack key={id} direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="body2">{`${id} · ${who}`}</Typography>
          <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>{amount}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export function AuiAssistantSidebarDoc() {
  const [minSize, setMinSize] = React.useState(25);
  const [handle, setHandle] = React.useState<'true' | 'false'>('true');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={
          <Box sx={{ height: '100%', p: 2.5, boxSizing: 'border-box' }}>
            <Box sx={{ height: '100%', border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
              <AuiDemoRuntime><AuiAssistantSidebar minSize={minSize} withHandle={handle === 'true'}><AppScreen /></AuiAssistantSidebar></AuiDemoRuntime>
            </Box>
          </Box>
        }
        properties={
          <>
            <PropRow label="minSize"><Slider size="small" aria-label="Min size" min={10} max={45} value={minSize} onChange={(_e, v) => setMinSize(v as number)} sx={{ width: 200 }} /><Typography variant="body3" color="text.secondary">{`${minSize}%`}</Typography></PropRow>
            <PropRow label="withHandle"><PropToggle<'true' | 'false'> label="withHandle" value={handle} onChange={setHandle} options={[['true', 'true'], ['false', 'false']]} /></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AuiAssistantSidebarCard() {
  return (
    <Box sx={{ height: 212, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
      <AuiDemoRuntime><AuiAssistantSidebar withHandle defaultSize={45}><AppScreen /></AuiAssistantSidebar></AuiDemoRuntime>
    </Box>
  );
}
