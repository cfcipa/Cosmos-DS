import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RotateCcw } from 'lucide-react';
import { EditMessage } from '../../src/ai/edit-message';
import { MessageBranches } from '../../src/ai/message-branches';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Edit a sent message».
const ORIGINAL = { question: 'Resume los anticipos de agosto', answer: 'En agosto se legalizaron 11 anticipos y quedó 1 pendiente, CE-4410.' };
const answerFor = (question: string) => `Listo. Para "${question}" encontré 3 anticipos pendientes por $3.930.000.`;

type Discarded = '0' | '1' | '3';
type Branch = { question: string; answer: string };

export function EditMessageDoc() {
  const [branches, setBranches] = React.useState<Branch[]>([ORIGINAL]);
  const [branchIndex, setBranchIndex] = React.useState(0);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [discarded, setDiscarded] = React.useState<Discarded>('3');
  const current = branches[branchIndex];

  const startEdit = () => { setDraft(current.question); setEditing(true); };
  const cancelEdit = () => { setEditing(false); setDraft(''); };
  /** Enviar crea una rama nueva; la original sigue como versión 1. */
  const saveEdit = () => {
    const question = draft.trim();
    if (!question) return;
    const next = [...branches, { question, answer: answerFor(question) }];
    setBranches(next);
    setBranchIndex(next.length - 1);
    setEditing(false);
  };
  const reset = () => { setBranches([ORIGINAL]); setBranchIndex(0); setEditing(false); setDraft(''); };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={320}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 460 }}>
              <EditMessage
                value={editing ? draft : current.question}
                discardedReplies={Number(discarded)}
                editing={editing}
                onStartEdit={startEdit}
                onValueChange={setDraft}
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
              <Box sx={{ opacity: editing ? 0.38 : 1 }}>
                <MessageBranches
                  variants={branches.map((branch) => branch.answer)}
                  index={branchIndex}
                  onIndexChange={setBranchIndex}
                  navigation="stop"
                  previousLabel="Versión anterior"
                  nextLabel="Versión siguiente"
                />
              </Box>
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="discardedReplies">
              <PropToggle<Discarded> label="Discarded replies" value={discarded} onChange={setDiscarded} options={[['0', '0'], ['1', '1'], ['3', '3']]} />
            </PropRow>
            <PropRow label="Shortcuts">
              <Typography variant="caption" color="text.secondary">Enter sends · Esc cancels. The original stays as version 1.</Typography>
            </PropRow>
            <PropRow label="Demo">
              <Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={reset}>Reset</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function EditMessageCard() {
  return <Box sx={{ width: '100%' }}><EditMessage value={ORIGINAL.question} discardedReplies={3} editing={false} /></Box>;
}
