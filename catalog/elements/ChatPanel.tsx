import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { RotateCcw } from 'lucide-react';
import { ChatPanel, ChatPanelAssistantMessage, ChatPanelComposer, ChatPanelMessages, ChatPanelTyping, ChatPanelUserMessage } from '../../src/ai/chat-panel';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { useTimers } from '../ui/useTimers';

// Contenido del tablero «Chat panel».
export const INTENTS = ['Pregunta por los anticipos que vencen este mes…', 'Concilia el extracto bancario de agosto…', 'Genera el informe de cartera por cliente…', 'Encuentra las facturas sin legalizar…'];
const START: [string, string] = ['¿Cuánto suman los anticipos pendientes?', '$3.930.000, entre tres anticipos.'];
const REPLY = 'Lo reviso en el ERP y te cuento. En este prototipo las respuestas son de ejemplo.';

type Msg = { role: 'user' | 'assistant'; text: string };

/** Pregunta → 400 ms → escribiendo → 1,9 s → respuesta (tiempos del tablero). */
function useChat() {
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [typing, setTyping] = React.useState(false);
  const { after, clear } = useTimers();
  const play = React.useCallback((q: string, a: string, reset: boolean) => {
    clear();
    setTyping(false);
    setMsgs((m) => [...(reset ? [] : m), { role: 'user', text: q }]);
    after(400, () => setTyping(true));
    after(1900, () => { setTyping(false); setMsgs((m) => [...m, { role: 'assistant', text: a }]); });
  }, [after, clear]);
  React.useEffect(() => { play(START[0], START[1], true); }, [play]);
  return { msgs, typing, play, replay: () => play(START[0], START[1], true) };
}

function ChatDemo({ withSend = true, height }: { withSend?: boolean; height?: number }) {
  const chat = useChat();
  const [text, setText] = React.useState('');
  const send = () => { if (!text.trim() || chat.typing) return; chat.play(text.trim(), REPLY, false); setText(''); };
  return (
    <ChatPanel sx={height ? { height } : undefined}>
      <ChatPanelMessages>
        {chat.msgs.map((m, i) => (m.role === 'user' ? <ChatPanelUserMessage key={i}>{m.text}</ChatPanelUserMessage> : <ChatPanelAssistantMessage key={i}>{m.text}</ChatPanelAssistantMessage>))}
        {chat.typing ? <ChatPanelTyping /> : null}
      </ChatPanelMessages>
      <ChatPanelComposer
        value={text}
        onValueChange={setText}
        onSubmit={withSend ? send : undefined}
        canSubmit={withSend && !chat.typing && text.trim().length > 0}
        placeholder={INTENTS}
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
        properties={
          <PropRow label="onSend"><PropToggle<'on' | 'off'> label="onSend" value={withSend} onChange={setWithSend} options={[['on', 'connected'], ['off', 'undefined']]} /></PropRow>
        }
      />
    </Box>
  );
}

export function ChatPanelCard() {
  return <ChatDemo height={212} />;
}
