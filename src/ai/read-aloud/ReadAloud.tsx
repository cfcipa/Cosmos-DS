// Cosmos DS · Kit IA · Voice: Read aloud.
// Tablero «Read aloud»: una respuesta leída en voz alta, con la palabra que suena iluminada y la velocidad a tu alcance.
// Como en assistant-ui: lo ya leído se atenúa y la palabra actual se resalta; la barra avanza por palabras y lleva el tiempo
// en texto para el lector de pantalla; la velocidad rota 1× → 1,25× → 1,5× → 2×. Los tiempos llegan ya formateados.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Pause, Play } from 'lucide-react';
import { primaryTint } from '../lib/primaryTint';
import { REDUCED_MOTION } from '../lib/shimmerText';

export interface ReadAloudProps {
  words: readonly string[];
  /** La palabra que suena (desde 0). En words.length, la lectura terminó. */
  spokenIndex: number;
  playing: boolean;
  rate: number;
  /** Ya formateados: «0:04». */
  elapsed: string;
  duration: string;
  onToggle?: () => void;
  onRateChange?: () => void;
  className?: string;
}

const ICON_SIZE = 16;
const rateText = (rate: number) => `${String(rate).replace('.', ',')}×`;

export function ReadAloud({ words, spokenIndex, playing, rate, elapsed, duration, onToggle, onRateChange, className }: ReadAloudProps) {
  const done = Math.min(spokenIndex, words.length);
  const progress = words.length ? Math.round((done / words.length) * 100) : 0;
  // Se resalta la palabra actual mientras se lee o en pausa; no antes de empezar ni al terminar.
  const highlight = done < words.length && (playing || done > 0);
  const label = playing ? 'Pausar la lectura' : 'Leer en voz alta';

  return (
    <Stack spacing={2} className={className} data-slot="read-aloud">
      <Typography variant="body1" sx={(t) => ({ lineHeight: t.spacing(3.25) })}>
        {words.map((word, i) => (
          <React.Fragment key={`${i}-${word}`}>
            <Box
              component="span"
              sx={(t) => ({
                px: 0.25,
                borderRadius: 0.75,
                bgcolor: highlight && i === done ? primaryTint(t) : 'transparent',
                opacity: i < done ? 0.5 : 1,
                transition: t.transitions.create(['background-color', 'opacity'], { duration: t.transitions.duration.shortest }),
                [REDUCED_MOTION]: { transition: 'none' },
              })}
            >
              {word}
            </Box>{' '}
          </React.Fragment>
        ))}
      </Typography>

      <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.25, py: 1 }}>
        <Tooltip title={label}>
          <span>
            <IconButton
              aria-label={label}
              disabled={!onToggle}
              onClick={onToggle}
              sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
            >
              {playing ? <Pause size={ICON_SIZE} fill="currentColor" /> : <Play size={ICON_SIZE} fill="currentColor" />}
            </IconButton>
          </span>
        </Tooltip>
        <LinearProgress
          variant="determinate"
          value={progress}
          aria-label="Progreso de la lectura"
          aria-valuetext={`${elapsed} de ${duration}`}
          sx={{ flexGrow: 1, borderRadius: 1 }}
        />
        <Typography variant="body3" color="text.secondary" noWrap sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily, fontVariantNumeric: 'tabular-nums' })}>
          {`${elapsed} / ${duration}`}
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          disabled={!onRateChange}
          onClick={onRateChange}
          aria-label={`Velocidad ${rateText(rate)}`}
          sx={(t) => ({ minWidth: t.spacing(6.5), fontFamily: t.aiKit.code.fontFamily, color: 'text.secondary', borderColor: 'divider' })}
        >
          {rateText(rate)}
        </Button>
      </Paper>
    </Stack>
  );
}
