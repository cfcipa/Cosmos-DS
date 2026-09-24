// Cosmos DS · Kit IA · Messages: Message branches.
// Tablero aprobado «Message branches»: recorre las versiones regeneradas de una misma respuesta sin perder tu lugar.
// Como en assistant-ui: regenerar no reemplaza la respuesta, crea una rama hermana; el stepper «n / m» se mueve entre ellas.
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
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

/** Medidas y tiempos del tablero. */
const STEP_BUTTON_SIZE = 28;
const ICON_SIZE = 16;
const COUNTER_MIN_WIDTH = 40;
const MESSAGE_MIN_HEIGHT = 72;

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
      <Box sx={{ minHeight: MESSAGE_MIN_HEIGHT }}>
        <Box
          key={`${currentIndex}-${message}`}
          component="p"
          sx={(t) => ({
            m: 0,
            ...t.typography.body1,
            color: 'text.primary',
            animation: `${fadein} .3s ease-out`,
            [REDUCED_MOTION]: { animation: 'none' },
          })}
        >
          {message}
        </Box>
      </Box>

      {showStepper ? (
        <Stack direction="row" alignItems="center" spacing={0.25} sx={{ ml: -0.75 }}>
          <IconButton
            aria-label={previousLabel}
            disabled={!hasNavigation || (!wraps && isFirst)}
            onClick={goPrevious}
            sx={{ width: STEP_BUTTON_SIZE, height: STEP_BUTTON_SIZE }}
          >
            <ChevronLeft size={ICON_SIZE} />
          </IconButton>
          <Box
            component="span"
            aria-live="polite"
            sx={(t) => ({
              minWidth: COUNTER_MIN_WIDTH,
              textAlign: 'center',
              ...t.aiKit.code,
              fontSize: t.typography.body3.fontSize,
              lineHeight: t.typography.body3.lineHeight,
              color: 'text.secondary',
              fontVariantNumeric: 'tabular-nums',
            })}
          >
            {count === 0 ? '0 / 0' : `${currentIndex + 1} / ${count}`}
          </Box>
          <IconButton
            aria-label={nextLabel}
            disabled={!hasNavigation || (!wraps && isLast)}
            onClick={goNext}
            sx={{ width: STEP_BUTTON_SIZE, height: STEP_BUTTON_SIZE }}
          >
            <ChevronRight size={ICON_SIZE} />
          </IconButton>
        </Stack>
      ) : null}
    </Stack>
  );
}
