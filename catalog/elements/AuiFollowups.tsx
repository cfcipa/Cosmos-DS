import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AuiSuggestions, AuiThread } from '../../src/ai/aui';
import { userBubbleSx } from '../../src/ai/lib/thread';
import { AuiAsk } from '../ui/AuiAsk';
import { AuiDemoRuntime, FOLLOWUP_SETS } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { ThreadFrame } from '../ui/ThreadFrame';

const QUESTION = '¿Cuál anticipo vence primero?';
/** Las tandas estáticas del tablero. */
const STATIC = [['¿Qué vence esta semana?', 'Muéstrame un ejemplo de legalización', '¿Qué sigue?'], ['Resume en una línea', 'Compáralo con agosto', 'Envía el reporte a Tesorería']];
type Design = 'runtime' | 'static';
type Count = 'some' | 'none';
type Variant = 'pills' | 'list';

function StaticDemo({ variant, cycle }: { variant: Variant; cycle: number }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  React.useEffect(() => setSelected(null), [cycle]);
  return (
    <Stack spacing={3} alignItems="center" sx={{ height: '100%', justifyContent: 'center', px: 3 }}>
      <Typography variant="body1" sx={{ ...userBubbleSx(), alignSelf: 'center' }}>{QUESTION}</Typography>
      <AuiSuggestions variant={variant} suggestions={STATIC[cycle % STATIC.length]} selectedSuggestion={selected} cycle={cycle} onSuggestion={setSelected} />
      <Typography variant="caption" color="text.secondary">{selected ? `Elegida: ${selected}` : ' '}</Typography>
    </Stack>
  );
}

export function AuiFollowupsDoc() {
  const [design, setDesign] = React.useState<Design>('runtime');
  const [send, setSend] = React.useState<'true' | 'false'>('true');
  const [count, setCount] = React.useState<Count>('some');
  const [variant, setVariant] = React.useState<Variant>('pills');
  const [cycle, setCycle] = React.useState(0);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={design === 'runtime' ? (
          <AuiDemoRuntime key={count} followups={count === 'some' ? 'sets' : 'none'}>
            <AuiAsk question={QUESTION} />
            <ThreadFrame><AuiThread autoFocus={false} followupSend={send === 'true'} /></ThreadFrame>
          </AuiDemoRuntime>
        ) : <StaticDemo variant={variant} cycle={cycle} />}
        properties={
          <>
            <PropRow label="design"><PropToggle<Design> label="design" value={design} onChange={setDesign} options={[['runtime', 'ThreadFollowupSuggestions'], ['static', 'Suggestions (static)']]} /></PropRow>
            {design === 'runtime' ? (
              <>
                <PropRow label="send"><PropToggle label="send" value={send} onChange={setSend} options={[['true', 'true'], ['false', 'false']]} /></PropRow>
                <PropRow label="suggestions"><PropToggle<Count> label="suggestions" value={count} onChange={setCount} options={[['some', `${FOLLOWUP_SETS[0].length} from runtime`], ['none', '[] (hidden)']]} /></PropRow>
              </>
            ) : (
              <>
                <PropRow label="variant"><PropToggle<Variant> label="variant" value={variant} onChange={setVariant} options={[['pills', 'pills'], ['list', 'list']]} /></PropRow>
                <PropRow label="cycle"><Button variant="outlined" onClick={() => setCycle((c) => c + 1)}>New batch</Button></PropRow>
              </>
            )}
          </>
        }
      />
    </Box>
  );
}

export function AuiFollowupsCard() {
  const [selected, setSelected] = React.useState<string | null>(null);
  return <AuiSuggestions suggestions={STATIC[0]} selectedSuggestion={selected} cycle={0} onSuggestion={setSelected} />;
}
