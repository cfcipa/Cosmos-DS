import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { RefreshCw } from 'lucide-react';
import { MessageBranches } from '../../src/ai/message-branches';
import type { MessageBranchesNavigation } from '../../src/ai/message-branches';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Message branches».
const QUESTION = '¿Cuánto suman los anticipos pendientes?';
const POOL = [
  'Los anticipos pendientes suman $3.930.000: CE-4471, CE-4480 y CE-4492.',
  'Suman $3.930.000 entre tres anticipos. El mayor es CE-4471, por $2.400.000.',
  'Son $3.930.000 en total. Si quieres, te los ordeno por fecha de vencimiento.',
  'Total pendiente: $3.930.000, repartido en tres anticipos de septiembre.',
];
const INITIAL_VARIANTS = 3;

type Toggle = 'on' | 'off';

export function MessageBranchesDoc() {
  const [variants, setVariants] = React.useState(POOL.slice(0, INITIAL_VARIANTS));
  const [index, setIndex] = React.useState(0);
  const [navigation, setNavigation] = React.useState<MessageBranchesNavigation>('wrap');
  const [hideWhenSingle, setHideWhenSingle] = React.useState<Toggle>('on');

  /** Regenerar agrega una rama hermana y la muestra; las anteriores siguen disponibles. */
  const regenerate = () => {
    const next = [...variants, POOL[variants.length % POOL.length]];
    setVariants(next);
    setIndex(next.length - 1);
  };
  const keepOnlyOne = () => {
    setVariants(POOL.slice(0, 1));
    setIndex(0);
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={320}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 460 }}>
              <Box
                sx={(t) => ({
                  alignSelf: 'flex-end',
                  maxWidth: 340,
                  px: 2,
                  py: 1.5,
                  borderRadius: 1,
                  bgcolor: 'ai.userBubble',
                  color: 'ai.userBubbleText',
                  ...t.typography.body1,
                })}
              >
                {QUESTION}
              </Box>
              <MessageBranches
                variants={variants}
                index={index}
                onIndexChange={setIndex}
                navigation={navigation}
                hideWhenSingle={hideWhenSingle === 'on'}
              />
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="Mode">
              <PropToggle<MessageBranchesNavigation>
                label="Mode"
                value={navigation}
                onChange={setNavigation}
                options={[['wrap', 'standalone: wraps'], ['stop', 'runtime: stops']]}
              />
            </PropRow>
            <PropRow label="hideWhenSingle">
              <PropToggle<Toggle> label="Hide with a single branch" value={hideWhenSingle} onChange={setHideWhenSingle} options={[['on', 'true'], ['off', 'false']]} />
            </PropRow>
            <PropRow label="variants">
              <Button variant="contained" startIcon={<RefreshCw size={16} />} onClick={regenerate}>Regenerate</Button>
              <Button variant="outlined" onClick={keepOnlyOne}>Keep only one</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function MessageBranchesCard() {
  const [index, setIndex] = React.useState(1);
  return <MessageBranches variants={POOL.slice(0, INITIAL_VARIANTS)} index={index} onIndexChange={setIndex} />;
}
