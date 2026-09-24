import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { RotateCcw } from 'lucide-react';
import { ChatPanel, ChatPanelAssistantMessage, ChatPanelComposer, ChatPanelMessages, ChatPanelTyping, ChatPanelUserMessage } from '../../src/ai/chat-panel';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { useTimers } from '../ui/useTimers';

// Contenido del tablero «Chat panel». Historia de assistant-ui: pregunta → escribiendo → la respuesta llega palabra a palabra.
export const INTENTS = ['Pregunta por los anticipos que vencen este mes…', 'Concilia el extracto bancario de agosto…', 'Genera el informe de cartera por cliente…', 'Encuentra las facturas sin legalizar…'];
const START: [string, string] = ['¿Cuánto suman los anticipos pendientes?', '$3.930.000, entre tres anticipos. El más próximo a vencer es CE-4492, el 30 de septiembre.'];
const REPLY = 'Lo reviso en el ERP y te cuento. En este prototipo las respuestas son de ejemplo.';
/** Tiempos: 400 ms hasta escribiendo, 1,5 s escribiendo, una palabra cada 90 ms. */
const TYPING_AT = 400;
const STREAM_AT = 1900;
const WORD_MS = 90;

type Msg = { role: 'user' | 'assistant'; text: string; shown?: number };

function useChat() {
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [typing, setTyping] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const { after, clear } = useTimers();
  const play = React.useCallback((q: string, a: string, reset: boolean) => {
    clear();
    setTyping(false); setBusy(true);
    setMsgs((m) => [...(reset ? [] : m), { role: 'user', text: q }]);
    after(TYPING_AT, () => setTyping(true));
    const words = a.split(' ').length;
    after(STREAM_AT, () => { setTyping(false); setMsgs((m) => [...m, { role: 'assistant', text: a, shown: 1 }]); });
    for (let i = 2; i <= words; i++) {
      after(STREAM_AT + (i - 1) * WORD_MS, () => setMsgs((m) => m.map((x, k) => (k === m.length - 1 ? { ...x, shown: i } : x))));
    }
    after(STREAM_AT + words * WORD_MS, () => setBusy(false));
  }, [after, clear]);
  React.useEffect(() => { play(START[0], START[1], true); }, [play]);
  return { msgs, typing, busy, play };
}

function ChatDemo({ withSend = true, height }: { withSend?: boolean; height?: number }) {
  const chat = useChat();
  const [text, setText] = React.useState('');
  const send = () => { chat.play(text.trim(), REPLY, false); setText(''); };
  return (
    <ChatPanel sx={height ? { height } : undefined}>
      <ChatPanelMessages>
        {chat.msgs.map((m, i) => (m.role === 'user'
          ? <ChatPanelUserMessage key={i}>{m.text}</ChatPanelUserMessage>
          : <ChatPanelAssistantMessage key={i}>{m.text.split(' ').slice(0, m.shown).join(' ')}</ChatPanelAssistantMessage>))}
        {chat.typing ? <ChatPanelTyping /> : null}
      </ChatPanelMessages>
      <ChatPanelComposer
        placeholder="Mensaje"
        value={text}
        onValueChange={setText}
        onSend={withSend ? send : undefined}
        canSend={!chat.busy && text.trim() !== ''}
      />
    </ChatPanel>
  );
}

export function ChatPanelDoc() {
  const [withSend, setWithSend] = React.useState<'on' | 'off'>('on');
  const [key, setKey] = React.useState(0);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={
          <Box sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <IconButton aria-label="Reproducir de nuevo" title="Reproducir de nuevo" onClick={() => setKey((k) => k + 1)} sx={{ position: 'absolute', top: 8, right: 8 }}>
              <RotateCcw size={20} />
            </IconButton>
            <ChatDemo key={key} withSend={withSend === 'on'} />
          </Box>
        }
        properties={<PropRow label="onSend"><PropToggle<'on' | 'off'> label="onSend" value={withSend} onChange={setWithSend} options={[['on', 'connected'], ['off', 'undefined']]} /></PropRow>}
      />
    </Box>
  );
}

export function ChatPanelCard() {
  return <ChatDemo height={212} />;
}
