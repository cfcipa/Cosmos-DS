import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Copy, RefreshCw } from 'lucide-react';
import { DocumentReference } from '../../src/ai/document-reference';
import type { DocumentAnchor } from '../../src/ai/document-reference';
import { DemoBubble } from '../ui/DemoBubble';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Document reference».
const USER_MESSAGE = '¿Cuál es el plazo para legalizar CE-4492?';
const TITLE = 'politica_anticipos_v3.pdf';
const PAGES = 14;
type AnchorSet = 'two' | 'same' | 'empty';
const SETS: Record<AnchorSet, DocumentAnchor[]> = {
  two: [
    { page: 3, quote: 'El anticipo se legaliza dentro de los 15 días siguientes a su uso, con los soportes originales.' },
    { page: 9, quote: 'Las diferencias a favor del empleado se causan como cuenta por pagar.' },
  ],
  same: [
    { page: 3, quote: 'El anticipo se legaliza dentro de los 15 días siguientes a su uso, con los soportes originales.' },
    { page: 3, quote: 'Sin legalizar, el tercero no puede recibir un segundo anticipo.' },
    { page: 9, quote: 'Las diferencias a favor del empleado se causan como cuenta por pagar.' },
  ],
  empty: [],
};
const ANSWER: Record<AnchorSet, string> = {
  two: 'Tiene 15 días desde el uso del anticipo, con soportes originales. El saldo a su favor queda como cuenta por pagar.',
  same: 'Tiene 15 días desde el uso del anticipo y, mientras no lo legalice, no puede recibir otro.',
  empty: 'Leí la política de anticipos, pero no encontré un pasaje que fije el plazo de legalización.',
};

type JumpMode = 'on' | 'off';

export function DocumentReferenceDoc() {
  const [set, setSet] = React.useState<AnchorSet>('two');
  const [page, setPage] = React.useState(3);
  const [jump, setJump] = React.useState<JumpMode>('on');

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={
          <Box sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={3} sx={{ mt: 'auto', width: '100%', maxWidth: 460, mx: 'auto' }}>
              <DemoBubble>{USER_MESSAGE}</DemoBubble>
              <Stack spacing={1.5}>
                <DocumentReference title={TITLE} pages={PAGES} anchors={SETS[set]} activePage={page} onJump={jump === 'on' ? setPage : undefined} />
                <Typography variant="body1">{ANSWER[set]}</Typography>
                <Stack direction="row" spacing={0.25} sx={{ ml: -0.75 }}>
                  <Tooltip title="Copiar"><IconButton aria-label="Copiar"><Copy size={16} /></IconButton></Tooltip>
                  <Tooltip title="Regenerar"><IconButton aria-label="Regenerar"><RefreshCw size={16} /></IconButton></Tooltip>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="anchors">
              <PropToggle<AnchorSet>
                label="anchors"
                value={set}
                onChange={(v) => { setSet(v); setPage(SETS[v][0]?.page ?? 1); }}
                options={[['two', '2 pages'], ['same', 'same page ×2'], ['empty', 'empty']]}
              />
            </PropRow>
            <PropRow label="activePage">
              <PropToggle<string> label="activePage" value={String(page)} onChange={(v) => setPage(Number(v))} options={[['3', '3'], ['9', '9'], ['12', '12 (no match)']]} />
            </PropRow>
            <PropRow label="onJump">
              <PropToggle<JumpMode> label="onJump" value={jump} onChange={setJump} options={[['on', 'setActivePage'], ['off', 'none']]} />
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function DocumentReferenceCard() {
  return <Box sx={{ width: '100%' }}><DocumentReference title={TITLE} pages={PAGES} anchors={SETS.two} activePage={3} /></Box>;
}
