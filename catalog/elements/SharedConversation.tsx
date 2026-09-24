import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SharedConversation, type SharedTurn } from '../../src/ai/shared-conversation';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Shared conversation».
const TURNS: SharedTurn[] = [
  { id: '1', role: 'user', text: 'Concilia el extracto de agosto con la cuenta 1110' },
  { id: '2', role: 'assistant', text: 'Concilié 42 movimientos. Quedan 2 sin pareja: un abono del 14 de agosto por $1.200.000 y una comisión bancaria del 31.' },
  { id: '3', role: 'user', text: '¿El abono de qué cliente puede ser?' },
  { id: '4', role: 'assistant', text: 'Por el valor y la fecha, probablemente es el pago de la factura FV-0932 de Constructora Andes.' },
];

export function SharedConversationDoc() {
  const [withCont, setWithCont] = React.useState<'on' | 'off'>('on');
  const [log, setLog] = React.useState('');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <SharedConversation
              title="Conciliación bancaria de agosto"
              sharedBy="Nubia"
              sharedAt="hace 3 días"
              turns={TURNS}
              onContinue={withCont === 'on' ? () => setLog('app.thread.import(messages): copia creada en tus hilos') : undefined}
            />
          </Box>
        }
        properties={
          <>
            <PropRow label="onContinue"><PropToggle<'on' | 'off'> label="onContinue" value={withCont} onChange={(v) => { setWithCont(v); setLog(''); }} options={[['on', 'connected'], ['off', 'undefined']]} /></PropRow>
            <PropRow label="Result"><Typography variant="body3" color="text.secondary" role="status">{log || 'Transcripción importada, sin controles de edición.'}</Typography></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function SharedConversationCard() {
  const [continued, setContinued] = React.useState(false);
  React.useEffect(() => { if (!continued) return undefined; const id = window.setTimeout(() => setContinued(false), 1500); return () => window.clearTimeout(id); }, [continued]);
  return (
    <SharedConversation
      title="Conciliación bancaria de agosto"
      sharedBy="Nubia"
      sharedAt="hace 3 días"
      turns={TURNS}
      onContinue={continued ? undefined : () => setContinued(true)}
      sx={{ height: 212 }}
    />
  );
}
