import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { RotateCcw } from 'lucide-react';
import { EmptyState, EmptyStateComposer, EmptyStateGreeting, EmptyStateSuggestion, EmptyStateSuggestions } from '../../src/ai/empty-state';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { INTENTS } from './ChatPanel';

// Contenido del tablero «Empty state».
const SUGGESTIONS = [
  { label: 'Anticipos del mes', prompt: 'Resume los anticipos pendientes de este mes' },
  { label: 'Carta de cobro', prompt: 'Redacta una carta de cobro para los clientes con facturas vencidas' },
  { label: 'Explicar un comprobante', prompt: 'Explica este comprobante contable línea por línea' },
];

function EmptyDemo({ withSend = true, onLog }: { withSend?: boolean; onLog?: (log: string) => void }) {
  const [text, setText] = React.useState('');
  const send = () => { if (!text.trim()) return; onLog?.(`Enviado: «${text.trim()}» · isEmpty pasa a false`); setText(''); };
  return (
    <EmptyState>
      <EmptyStateGreeting>¿En qué te ayudo hoy?</EmptyStateGreeting>
      <EmptyStateSuggestions>
        {SUGGESTIONS.map((s, i) => <EmptyStateSuggestion key={s.label} index={i} label={s.label} onClick={() => setText(s.prompt)} />)}
      </EmptyStateSuggestions>
      <EmptyStateComposer
        value={text}
        onValueChange={setText}
        onSubmit={withSend ? send : undefined}
        canSubmit={withSend && text.trim().length > 0}
        placeholder={INTENTS}
      />
    </EmptyState>
  );
}

export function EmptyStateDoc() {
  const [withSend, setWithSend] = React.useState<'on' | 'off'>('on');
  const [key, setKey] = React.useState(0);
  const [log, setLog] = React.useState('isEmpty: true');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={
          <Box sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <IconButton aria-label="Reproducir la entrada" title="Reproducir la entrada" onClick={() => { setKey((k) => k + 1); setLog('isEmpty: true'); }} sx={{ position: 'absolute', top: 8, right: 8 }}>
              <RotateCcw size={20} />
            </IconButton>
            <EmptyDemo key={key} withSend={withSend === 'on'} onLog={setLog} />
          </Box>
        }
        properties={
          <>
            <PropRow label="onSend"><PropToggle<'on' | 'off'> label="onSend" value={withSend} onChange={setWithSend} options={[['on', 'connected'], ['off', 'undefined']]} /></PropRow>
            <PropRow label="State"><Typography variant="body3" color="text.secondary" role="status">{log}</Typography></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function EmptyStateCard() {
  const [key, setKey] = React.useState(0);
  return <EmptyDemo key={key} onLog={() => window.setTimeout(() => setKey((k) => k + 1), 1200)} />;
}
