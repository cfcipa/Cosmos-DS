import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Copy, RefreshCw } from 'lucide-react';
import { ImageGeneration } from '../../src/ai/image-generation';
import { DemoBubble } from '../ui/DemoBubble';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Image generation».
const USER_MESSAGE = 'Genera una portada para el informe.';
const PROMPT = 'Portada abstracta en azules para el informe de tesorería de septiembre';
const AFTER = 'Lista la portada. Si quieres otra versión, regenérala.';
/** Cuánto tarda la generación en el tablero. */
const GENERATE_MS = 3600;

type Flag = 'true' | 'false';

export function ImageGenerationDoc() {
  const [generating, setGenerating] = React.useState(true);
  const timer = React.useRef<number>();
  const run = React.useCallback(() => {
    window.clearTimeout(timer.current);
    setGenerating(true);
    timer.current = window.setTimeout(() => setGenerating(false), GENERATE_MS);
  }, []);
  React.useEffect(() => { run(); return () => window.clearTimeout(timer.current); }, [run]);

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={
          <Box sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Stack spacing={3} sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
              <DemoBubble>{USER_MESSAGE}</DemoBubble>
              <Stack spacing={1}>
                <ImageGeneration prompt={PROMPT} generating={generating} onRegenerate={run} />
                {generating ? null : (
                  <>
                    <Typography variant="body1">{AFTER}</Typography>
                    <Stack direction="row" spacing={0.25} sx={{ ml: -0.75 }}>
                      <Tooltip title="Copiar"><IconButton aria-label="Copiar"><Copy size={16} /></IconButton></Tooltip>
                      <Tooltip title="Regenerar"><IconButton aria-label="Regenerar" onClick={run}><RefreshCw size={16} /></IconButton></Tooltip>
                    </Stack>
                  </>
                )}
              </Stack>
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="generating">
              <PropToggle<Flag>
                label="generating"
                value={generating ? 'true' : 'false'}
                onChange={(v) => { window.clearTimeout(timer.current); setGenerating(v === 'true'); }}
                options={[['true', 'true'], ['false', 'false']]}
              />
            </PropRow>
            <PropRow label="Try it">
              <Button variant="contained" startIcon={<RefreshCw size={16} />} onClick={run}>Generate again</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function ImageGenerationCard() {
  return <ImageGeneration prompt={PROMPT} generating={false} />;
}
