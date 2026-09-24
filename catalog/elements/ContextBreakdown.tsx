import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { ContextBreakdown } from '../../src/ai/context-breakdown';
import type { ContextSegment } from '../../src/ai/context-breakdown';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Context breakdown».
const FIXED: ContextSegment[] = [
  { label: 'Prompt del sistema', tokens: 810 },
  { label: 'Herramientas', tokens: 1890 },
  { label: 'Archivos adjuntos', tokens: 17325 },
];
const CONVERSATION = 30780;
const CONVERSATION_MAX = 110000;
const fmt = (n: number) => Math.round(n).toLocaleString('es-CO');

type Limit = '128000' | '200000';

export function ContextBreakdownDoc() {
  const [conversation, setConversation] = React.useState(CONVERSATION);
  const [limit, setLimit] = React.useState<Limit>('128000');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={
          <Box sx={{ height: '100%', p: 3, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 400 }}>
              <ContextBreakdown segments={[...FIXED, { label: 'Conversación', tokens: conversation }]} limit={Number(limit)} />
            </Box>
          </Box>
        }
        properties={
          <>
            <PropRow label="Conversation">
              <Slider size="small" min={0} max={CONVERSATION_MAX} step={500} value={conversation} aria-label="Conversation tokens" onChange={(_e, v) => setConversation(v as number)} sx={{ width: 240 }} />
              <Typography variant="body3" color="text.secondary" sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>{fmt(conversation)}</Typography>
            </PropRow>
            <PropRow label="limit"><PropToggle<Limit> label="Limit" value={limit} onChange={setLimit} options={[['128000', '128,000'], ['200000', '200,000']]} /></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function ContextBreakdownCard() {
  const [conversation, setConversation] = React.useState(CONVERSATION);
  React.useEffect(() => {
    const id = window.setInterval(() => setConversation((c) => (c >= 90000 ? CONVERSATION : c + 6000)), 900);
    return () => window.clearInterval(id);
  }, []);
  return <Box sx={{ width: '100%' }}><ContextBreakdown segments={[...FIXED, { label: 'Conversación', tokens: conversation }]} limit={128000} /></Box>;
}
