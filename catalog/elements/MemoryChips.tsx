import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Copy, RefreshCw } from 'lucide-react';
import { MemoryChips } from '../../src/ai/memory-chips';
import type { MemoryItem } from '../../src/ai/memory-chips';
import { DemoBubble } from '../ui/DemoBubble';
import { DemoComposer } from '../ui/DemoComposer';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Memory».
const ASK = 'Recuerda que manejo la cuenta 1110 y que ahora quiero los informes en Excel.';
const ANSWER = 'Listo. Desde ahora tus informes de la cuenta 1110 van en Excel.';
const ANSWER_EXISTING = 'Sigo con lo que ya sabía de ti; no guardé nada nuevo.';
const ANSWER_EMPTY = 'Aún no tengo nada guardado sobre ti.';
const ANSWER_SAVED = 'Entendido, lo tendré en cuenta en las próximas conversaciones.';
const ANSWER_NOTHING = 'No guardé nada nuevo en la memoria para este mensaje.';
const base = (): MemoryItem[] => [
  { id: 'm1', text: 'Trabaja en Tesorería', change: 'existing' },
  { id: 'm2', text: 'Cierra el mes el día 5', change: 'existing' },
];
const incoming = (): MemoryItem[] => [
  { id: 'm3', text: 'Maneja la cuenta 1110', change: 'added' },
  { id: 'm4', text: 'Prefiere informes en Excel', change: 'updated' },
];
/** Cada recuerdo del turno llega como su propio chip (tablero). */
const FIRST_MS = 900;
const NEXT_MS = 700;
const MAX_CHARS = 44;
const clip = (text: string) => {
  if (text.length <= MAX_CHARS) return text;
  const cut = text.slice(0, MAX_CHARS);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
};

type ChipSet = 'fresh' | 'existing' | 'empty';
type ForgetMode = 'on' | 'off';

export function MemoryChipsDoc() {
  const [set, setSet] = React.useState<ChipSet>('fresh');
  const [chips, setChips] = React.useState<MemoryItem[]>(() => [...base(), ...incoming()]);
  const [forget, setForget] = React.useState<ForgetMode>('on');
  const [ask, setAsk] = React.useState(ASK);
  const [answer, setAnswer] = React.useState(ANSWER);
  const [draft, setDraft] = React.useState('');
  const nextId = React.useRef(5);
  const timers = React.useRef<number[]>([]);
  const conversationRef = React.useRef<HTMLDivElement>(null);
  const clear = () => { timers.current.forEach((id) => window.clearTimeout(id)); timers.current = []; };
  React.useEffect(() => clear, []);
  React.useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' });
  }, [chips, answer]);

  /** Como en la demo de la referencia: primero lo que ya recordaba y luego cada recuerdo del turno. */
  const play = (prior: MemoryItem[], arriving: MemoryItem[], nextAsk: string, nextAnswer: string) => {
    clear();
    setChips(prior); setAsk(nextAsk); setAnswer(nextAnswer);
    let at = 0;
    arriving.forEach((chip, i) => {
      at += i === 0 ? FIRST_MS : NEXT_MS;
      timers.current.push(window.setTimeout(() => setChips((current) => [...current, chip]), at));
    });
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const match = text.match(/^recuerda\s+(que\s+)?(.+)$/i);
    const fact = match ? match[2].replace(/[.!]+$/, '') : '';
    const prior = chips.map((chip) => ({ ...chip, change: 'existing' as const }));
    const arriving: MemoryItem[] = fact ? [{ id: `m${nextId.current}`, text: clip(fact.charAt(0).toUpperCase() + fact.slice(1)), change: 'added' }] : [];
    nextId.current += 1;
    setDraft(''); setSet('fresh');
    play(prior, arriving, text, fact ? ANSWER_SAVED : ANSWER_NOTHING);
  };

  const pickSet = (next: ChipSet) => {
    clear();
    setSet(next); setAsk(ASK);
    setAnswer(next === 'fresh' ? ANSWER : next === 'existing' ? ANSWER_EXISTING : ANSWER_EMPTY);
    setChips(next === 'fresh' ? [...base(), ...incoming()] : next === 'existing' ? base() : []);
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={
          <Stack spacing={2} sx={{ height: '100%', p: 3, pb: 2, boxSizing: 'border-box' }}>
            <Box ref={conversationRef} sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <Stack spacing={3} sx={{ mt: 'auto' }}>
                <DemoBubble>{ask}</DemoBubble>
                <Stack spacing={1.5}>
                  <Typography variant="body1">{answer}</Typography>
                  <MemoryChips chips={chips} onForget={forget === 'on' ? (id) => setChips((current) => current.filter((chip) => chip.id !== id)) : undefined} />
                  <Stack direction="row" spacing={0.25} sx={{ ml: -0.75 }}>
                    <Tooltip title="Copiar"><IconButton aria-label="Copiar"><Copy size={16} /></IconButton></Tooltip>
                    <Tooltip title="Regenerar"><IconButton aria-label="Regenerar"><RefreshCw size={16} /></IconButton></Tooltip>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
            <DemoComposer value={draft} onChange={setDraft} onSend={send} placeholder="Pídele que recuerde algo…" />
          </Stack>
        }
        properties={
          <>
            <PropRow label="chips">
              <PropToggle<ChipSet> label="chips" value={set} onChange={pickSet} options={[['fresh', 'this turn'], ['existing', 'existing only'], ['empty', 'empty']]} />
            </PropRow>
            <PropRow label="onForget">
              <PropToggle<ForgetMode> label="onForget" value={forget} onChange={setForget} options={[['on', 'forgetMemory'], ['off', 'none']]} />
            </PropRow>
            <PropRow label="Try it">
              <Button variant="outlined" onClick={() => { setSet('fresh'); play(base(), incoming(), ASK, ANSWER); }}>Replay turn</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements: la misma demo, en pequeño y funcionando. */
export function MemoryChipsCard() {
  const [chips, setChips] = React.useState<MemoryItem[]>(() => [...base(), ...incoming()]);
  React.useEffect(() => { if (chips.length === 0) { const id = window.setTimeout(() => setChips([...base(), ...incoming()]), 1200); return () => window.clearTimeout(id); } return undefined; }, [chips]);
  return <MemoryChips chips={chips} onForget={(id) => setChips((current) => current.filter((chip) => chip.id !== id))} />;
}
