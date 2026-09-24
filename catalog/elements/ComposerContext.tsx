import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { Composer, ComposerContext } from '../../src/ai/composer';
import { ComposerStage } from '../ui/ComposerStage';
import { ElementPage, PropRow } from '../ui/Playground';

// Contenido del tablero «Context».
const BASE = { system: 12, tools: 8, total: 200 };
const DEMO_MESSAGES = 54;
const NEAR_MESSAGES = 164;
const MAX_MESSAGES = 180;

function ContextDemo({ messages }: { messages: number }) {
  const [text, setText] = React.useState('');
  return (
    <Composer value={text} onValueChange={setText} placeholder="Escribe un mensaje…" toolbarEnd={<ComposerContext usage={{ ...BASE, messages }} />} />
  );
}

export function ComposerContextDoc() {
  const [messages, setMessages] = React.useState(DEMO_MESSAGES);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={<ComposerStage log="Pasa el cursor o tabula al anillo para ver el detalle."><ContextDemo messages={messages} /></ComposerStage>}
        properties={
          <>
            <PropRow label="messages">
              <Slider size="small" min={0} max={MAX_MESSAGES} step={1} value={messages} aria-label="Message tokens (thousands)" onChange={(_e, v) => setMessages(v as number)} sx={{ width: 240 }} />
              <Typography variant="body3" color="text.secondary" sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>{messages}k</Typography>
            </PropRow>
            <PropRow label="Prefixes">
              <Button variant="outlined" onClick={() => setMessages(DEMO_MESSAGES)}>Demo 74k</Button>
              <Button variant="outlined" onClick={() => setMessages(NEAR_MESSAGES)}>Near the limit</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

export function ComposerContextCard() {
  return <Box sx={{ width: '100%', pt: 18 }}><ContextDemo messages={DEMO_MESSAGES} /></Box>;
}
