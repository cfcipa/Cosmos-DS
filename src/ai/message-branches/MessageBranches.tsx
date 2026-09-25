// Cosmos DS · Kit IA · Messages: Message branches.
// Tablero aprobado «Message branches»: recorre las versiones regeneradas de una misma respuesta sin perder tu lugar.
// Como en assistant-ui: regenerar no reemplaza la respuesta, crea una rama hermana; el stepper «n / m» se mueve entre ellas.
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

/**
 * 'wrap': al pasar la última vuelve a la primera (el elemento de assistant-ui, sin runtime).
 * 'stop': se detiene en los extremos (BranchPickerPrimitive, con runtime).
 */
export type MessageBranchesNavigation = 'wrap' | 'stop';

export interface MessageBranchesProps {
  /** Las versiones de la respuesta, en orden. */
  variants: readonly string[];
  /** La versión visible (desde 0). */
  index: number;
  onIndexChange: (index: number) => void;
  /** Default 'wrap'. */
  navigation?: MessageBranchesNavigation;
  /** Oculta el stepper cuando solo hay una versión. Default true. */
  hideWhenSingle?: boolean;
  /** Etiquetas accesibles. Default 'Ver la respuesta anterior' / 'Ver la respuesta siguiente'. */
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

const ICON_SIZE = 16;
/** Líneas que reserva la respuesta, para que el stepper no salte entre versiones (min-h de la referencia). */
const RESERVED_LINES = 3;
/** Ancho del contador en caracteres: «10 / 10» no mueve las flechas. */
const COUNTER_CH = 7;

const fadein = keyframes`from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; }`;

export function MessageBranches({
  variants,
  index,
  onIndexChange,
  navigation = 'wrap',
  hideWhenSingle = true,
  previousLabel = 'Ver la respuesta anterior',
  nextLabel = 'Ver la respuesta siguiente',
  className,
}: MessageBranchesProps) {
  const count = variants.length;
  const currentIndex = index >= 0 && index < count ? index : 0;
  const message = variants[currentIndex] ?? '';
  const hasNavigation = count > 1;
  const wraps = navigation === 'wrap';
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === count - 1;

  const goPrevious = () => {
    if (!hasNavigation) return;
    if (isFirst) { if (wraps) onIndexChange(count - 1); return; }
    onIndexChange(currentIndex - 1);
  };
  const goNext = () => {
    if (!hasNavigation) return;
    if (isLast) { if (wraps) onIndexChange(0); return; }
    onIndexChange(currentIndex + 1);
  };

  const showStepper = !(hideWhenSingle && count <= 1);

  return (
    <Stack spacing={1.5} className={className} data-slot="message-branches">
      <Box sx={(t) => ({ minHeight: `calc(${t.typography.body1.lineHeight} * ${RESERVED_LINES})` })}>
        <Typography
          key={`${currentIndex}-${message}`}
          variant="body1"
          sx={(t) => ({
            animation: `${fadein} ${t.transitions.duration.complex}ms ${t.transitions.easing.easeOut}`,
            [REDUCED_MOTION]: { animation: 'none' },
          })}
        >
          {message}
        </Typography>
      </Box>

      {showStepper ? (
        <MessageBranchesStepper
          index={currentIndex}
          count={count}
          onPrevious={goPrevious}
          onNext={goNext}
          previousDisabled={!hasNavigation || (!wraps && isFirst)}
          nextDisabled={!hasNavigation || (!wraps && isLast)}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
        />
      ) : null}
    </Stack>
  );
}

export interface MessageBranchesStepperProps {
  /** La versión visible (desde 0). */
  index: number;
  count: number;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  /** Default 'Ver la respuesta anterior' / 'Ver la respuesta siguiente'. */
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

/** El stepper «n / m» solo, para ponerlo bajo una respuesta que ya se muestra (el hilo conectado). */
export function MessageBranchesStepper({
  index,
  count,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
  previousLabel = 'Ver la respuesta anterior',
  nextLabel = 'Ver la respuesta siguiente',
  className,
}: MessageBranchesStepperProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.25} className={className} data-slot="message-branches-stepper" sx={{ ml: -0.75 }}>
      <IconButton aria-label={previousLabel} disabled={previousDisabled} onClick={onPrevious}>
        <ChevronLeft size={ICON_SIZE} />
      </IconButton>
      <Typography
        variant="body3"
        component="span"
        color="text.secondary"
        aria-live="polite"
        sx={(t) => ({ minWidth: `${COUNTER_CH}ch`, textAlign: 'center', fontFamily: t.aiKit.code.fontFamily, fontVariantNumeric: 'tabular-nums' })}
      >
        {count === 0 ? '0 / 0' : `${index + 1} / ${count}`}
      </Typography>
      <IconButton aria-label={nextLabel} disabled={nextDisabled} onClick={onNext}>
        <ChevronRight size={ICON_SIZE} />
      </IconButton>
    </Stack>
  );
}
