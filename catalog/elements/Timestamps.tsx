import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { RotateCcw } from 'lucide-react';
import { DaySeparator } from '../../src/ai/day-separator';
import type { DatedMessage } from '../../src/ai/day-separator';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Timestamps».
const START: DatedMessage[] = [
  { id: 'a', day: 'Ayer', time: '16:04', role: 'user', text: '¿Quedó cerrado el periodo de agosto?' },
  { id: 'b', day: 'Ayer', time: '16:04', role: 'assistant', text: 'Sí. Lo cerró Nubia a las 15:40, sin movimientos pendientes.' },
  { id: 'c', day: 'Hoy', time: '09:12', role: 'user', text: '¿Qué anticipos vencen esta semana?' },
  { id: 'd', day: 'Hoy', time: '09:12', role: 'assistant', text: 'Solo CE-4492, el 30 de septiembre.' },
];
const MORE: Array<Pick<DatedMessage, 'role' | 'text'>> = [
  { role: 'user', text: 'Recuérdale a Nubia que lo legalice' },
  { role: 'assistant', text: 'Listo, le envié el recordatorio.' },
];

type ShowTimes = 'hover' | 'always';
const currentTime = () => new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });

export function TimestampsDoc() {
  const [messages, setMessages] = React.useState<DatedMessage[]>(START);
  const [showTimes, setShowTimes] = React.useState<ShowTimes>('hover');
  const added = React.useRef(0);
  const conversationRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const addTodayMessage = () => {
    const next = MORE[added.current % MORE.length];
    setMessages((current) => [...current, { id: `n${added.current}`, day: 'Hoy', time: currentTime(), ...next }]);
    added.current += 1;
  };
  const reset = () => { setMessages(START); added.current = 0; };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={320}
        demo={
          <Box ref={conversationRef} sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Box sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
              <DaySeparator messages={messages} showTimes={showTimes} />
            </Box>
          </Box>
        }
        properties={
          <>
            <PropRow label="Times">
              <PropToggle<ShowTimes> label="Show times" value={showTimes} onChange={setShowTimes} options={[['hover', 'hover'], ['always', 'always']]} />
            </PropRow>
            <PropRow label="messages">
              <Button variant="contained" onClick={addTodayMessage}>Add today's message</Button>
              <Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={reset}>Reset</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function TimestampsCard() {
  return <Box sx={{ width: '100%' }}><DaySeparator messages={START} showTimes="always" /></Box>;
}
