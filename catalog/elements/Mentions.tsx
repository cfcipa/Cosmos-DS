import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Composer, ComposerMenu, ComposerPersonItem, applyMention, handleMenuKey, useMentionMatches } from '../../src/ai/composer';
import type { ComposerPerson } from '../../src/ai/composer';
import { ComposerStage, useFakeRun } from '../ui/ComposerStage';
import { ElementPage, PropRow } from '../ui/Playground';

// Contenido del tablero «Mentions».
const PEOPLE: ComposerPerson[] = [{ name: 'Nubia', role: 'human' }, { name: 'Contable', role: 'agent' }, { name: 'Nicolás', role: 'human' }, { name: 'Tesorería', role: 'agent' }];
const LIST_ID = 'mention-list';

function MentionsDemo({ text, setText, onLog }: { text: string; setText: (t: string) => void; onLog?: (log: string) => void }) {
  const [active, setActive] = React.useState(0);
  const [closed, setClosed] = React.useState(false);
  const run = useFakeRun(() => setText(''));
  React.useEffect(() => { onLog?.(run.log); }, [run.log]); // eslint-disable-line react-hooks/exhaustive-deps
  const matches = useMentionMatches(text, PEOPLE);
  const open = matches.length > 0 && !closed;
  const current = Math.min(active, Math.max(0, matches.length - 1));
  const pick = (person: ComposerPerson) => {
    setText(applyMention(text, person.name)); setActive(0); setClosed(false);
    run.setLog(`Mencionaste a ${person.name}${person.role === 'agent' ? ' (agente)' : ''}`);
  };

  return (
    <Composer
      value={text}
      onValueChange={(v) => { setText(v); setClosed(false); setActive(0); }}
      onSubmit={() => run.send(text)}
      running={run.running}
      onCancel={run.cancel}
      placeholder="Escribe @ para mencionar"
      inputProps={{ role: 'combobox', 'aria-expanded': open, 'aria-controls': LIST_ID, 'aria-activedescendant': open ? `person-${current}` : undefined }}
      onKeyDown={(event) => {
        if (open) handleMenuKey(event, { count: matches.length, active: current, onActiveChange: setActive, onPick: (i) => pick(matches[i]), onClose: () => setClosed(true) });
      }}
      menu={open ? (
        <ComposerMenu id={LIST_ID} label="Personas y agentes">
          {matches.map((person, i) => <ComposerPersonItem key={person.name} id={`person-${i}`} person={person} active={i === current} onClick={() => pick(person)} />)}
        </ComposerMenu>
      ) : null}
    />
  );
}

export function MentionsDoc() {
  const [text, setText] = React.useState('');
  const [log, setLog] = React.useState('');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={<ComposerStage log={log}><MentionsDemo text={text} setText={setText} onLog={setLog} /></ComposerStage>}
        properties={
          <PropRow label="Try it">
            <Button variant="outlined" onClick={() => setText('Avísale a @')}>Type “Avísale a @”</Button>
            <Button variant="outlined" onClick={() => setText('@N')}>Type “@N”</Button>
          </PropRow>
        }
      />
    </Box>
  );
}

export function MentionsCard() {
  const [text, setText] = React.useState('Avísale a @N');
  return <Box sx={{ width: '100%', pt: 10 }}><MentionsDemo text={text} setText={setText} /></Box>;
}
