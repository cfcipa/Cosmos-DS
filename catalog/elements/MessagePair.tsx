import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { RotateCcw } from 'lucide-react';
import { MessagePair } from '../../src/ai/message-pair';
import type { MessagePairVariant } from '../../src/ai/message-pair';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Message pair».
const USER_MESSAGE = '¿Qué anticipos siguen pendientes este mes?';
const RESPONSE = 'Hay 3 anticipos pendientes de legalizar por $3.930.000. El más próximo a vencer es CE-4492, de Nubia Rojas, el 30 de septiembre.';
const TOTAL_WORDS = RESPONSE.split(' ').length;
const WORD_INTERVAL_MS = 110;

/** Reproduce la respuesta palabra a palabra. */
function useResponsePlayback() {
  const [visibleWords, setVisibleWords] = React.useState(0);
  const playbackTimer = React.useRef<number>();
  const stop = () => window.clearInterval(playbackTimer.current);

  const play = React.useCallback(() => {
    stop();
    setVisibleWords(0);
    playbackTimer.current = window.setInterval(() => {
      setVisibleWords((current) => Math.min(TOTAL_WORDS, current + 1));
    }, WORD_INTERVAL_MS);
  }, []);

  React.useEffect(() => {
    if (visibleWords >= TOTAL_WORDS) stop();
  }, [visibleWords]);
  React.useEffect(() => stop, []);

  const scrubTo = (count: number) => { stop(); setVisibleWords(count); };
  return { visibleWords, play, scrubTo };
}

export function MessagePairDoc() {
  const [variant, setVariant] = React.useState<MessagePairVariant>('bubble');
  const playback = useResponsePlayback();
  React.useEffect(() => { playback.play(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const isStreaming = playback.visibleWords < TOTAL_WORDS;

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={320}
        demo={
          <Box sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <IconButton aria-label="Reproducir de nuevo" title="Reproducir de nuevo" onClick={playback.play} sx={{ position: "absolute", top: (t) => t.spacing(1), right: (t) => t.spacing(1) }}>
              <RotateCcw size={16} />
            </IconButton>
            <Box sx={{ width: '100%', maxWidth: 460 }}>
              <MessagePair
                userMessage={USER_MESSAGE}
                response={RESPONSE}
                visibleWords={playback.visibleWords}
                streaming={isStreaming}
                variant={variant}
                onRegenerate={playback.play}
              />
            </Box>
          </Box>
        }
        properties={
          <>
            <PropRow label="variant">
              <PropToggle<MessagePairVariant> label="Variant" value={variant} onChange={setVariant} options={[['bubble', 'bubble'], ['flat', 'flat']]} />
            </PropRow>
            <PropRow label="visibleWords">
              <Slider
                size="small"
                min={0}
                max={TOTAL_WORDS}
                step={1}
                value={playback.visibleWords}
                aria-label="Visible words"
                onChange={(_event, value) => playback.scrubTo(value as number)}
                sx={{ width: 240 }}
              />
              <Typography variant="caption" color="text.secondary" sx={(t) => ({ ...t.aiKit.code, fontSize: t.typography.body3.fontSize, fontVariantNumeric: 'tabular-nums' })}>
                {playback.visibleWords} / {TOTAL_WORDS}
              </Typography>
            </PropRow>
            <PropRow label="Actions">
              <Typography variant="caption" color="text.secondary">autohide="always": hover or Tab over the response.</Typography>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function MessagePairCard() {
  return <MessagePair userMessage={USER_MESSAGE} response={RESPONSE} />;
}
