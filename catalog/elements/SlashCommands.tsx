import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { AlignLeft, ArrowRightLeft, Search, Table } from 'lucide-react';
import { Composer, ComposerCommandItem, ComposerMenu, handleMenuKey, useSlashMatches } from '../../src/ai/composer';
import type { ComposerCommand } from '../../src/ai/composer';
import { ComposerStage, useFakeRun } from '../ui/ComposerStage';
import { ElementPage, PropRow } from '../ui/Playground';

// Contenido del tablero «Slash commands».
const COMMANDS: ComposerCommand[] = [
  { name: 'resumir', description: 'Resume el hilo hasta aquí', icon: AlignLeft },
  { name: 'conciliar', description: 'Concilia un extracto bancario', icon: ArrowRightLeft },
  { name: 'consultar', description: 'Consulta un documento del ERP', icon: Search },
  { name: 'reporte', description: 'Genera un reporte en Excel', icon: Table },
];
const LIST_ID = 'slash-commands';
/** Ancho del menú en el tablero. */
const MENU_WIDTH = 400;

function SlashDemo({ text, setText, onLog }: { text: string; setText: (t: string) => void; onLog?: (log: string) => void }) {
  const [active, setActive] = React.useState(0);
  const [closed, setClosed] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const run = useFakeRun(() => setText(''));
  React.useEffect(() => { onLog?.(run.log); }, [run.log]); // eslint-disable-line react-hooks/exhaustive-deps
  const matches = useSlashMatches(text, COMMANDS);
  const open = matches.length > 0 && !closed;
  const current = Math.min(active, Math.max(0, matches.length - 1));

  const pick = (command: ComposerCommand) => {
    setText(`/${command.name} `); setClosed(false); setActive(0);
    run.setLog(`onCommand(/${command.name})`);
    window.setTimeout(() => { const el = inputRef.current; if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 0);
  };

  return (
    <Composer
      value={text}
      onValueChange={(v) => { setText(v); setClosed(false); setActive(0); }}
      onSubmit={() => run.send(text)}
      running={run.running}
      onCancel={run.cancel}
      placeholder="Escribe / para ver los comandos"
      inputRef={inputRef}
      inputProps={{ role: 'combobox', 'aria-expanded': open, 'aria-controls': LIST_ID, 'aria-activedescendant': open ? `cmd-${matches[current].name}` : undefined }}
      onKeyDown={(event) => {
        if (open) handleMenuKey(event, { count: matches.length, active: current, onActiveChange: setActive, onPick: (i) => pick(matches[i]), onClose: () => setClosed(true), tabPicks: true });
      }}
      menu={open ? (
        <ComposerMenu id={LIST_ID} label="Comandos" width={MENU_WIDTH}>
          {matches.map((command, i) => <ComposerCommandItem key={command.name} id={`cmd-${command.name}`} command={command} active={i === current} onClick={() => pick(command)} />)}
        </ComposerMenu>
      ) : null}
    />
  );
}

export function SlashCommandsDoc() {
  const [text, setText] = React.useState('');
  const [log, setLog] = React.useState('');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={<ComposerStage log={log}><SlashDemo text={text} setText={setText} onLog={setLog} /></ComposerStage>}
        properties={
          <PropRow label="Try it">
            <Button variant="outlined" onClick={() => setText('/')}>Type “/”</Button>
            <Button variant="outlined" onClick={() => setText('/co')}>Type “/co”</Button>
          </PropRow>
        }
      />
    </Box>
  );
}

export function SlashCommandsCard() {
  const [text, setText] = React.useState('/co');
  return <Box sx={{ width: '100%', pt: 10 }}><SlashDemo text={text} setText={setText} /></Box>;
}
