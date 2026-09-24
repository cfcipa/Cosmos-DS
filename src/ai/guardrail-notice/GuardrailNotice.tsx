// Cosmos DS · Kit IA · Reasoning: Guardrail notice.
// Tablero aprobado «Guardrail notice»: una negativa con forma propia, que ofrece lo más cercano que sí puede hacer.
// Colores y tipografía salen del tema.
import * as React from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { ArrowRight, ShieldAlert } from 'lucide-react';

export interface GuardrailNoticeProps {
  /** Default 'No puedo ayudarte con eso'. */
  title?: string;
  /** La política que bloqueó la solicitud: «Política de datos personales». Sin ella, no se muestra la línea. */
  policy?: string;
  /** Por qué, en una frase. */
  explanation: string;
  /** Lo más cercano que sí se puede hacer. Vacío u omitido: la sección «Prueba en su lugar» no se muestra. */
  alternatives?: string[];
  /**
   * Se llama con el texto de la alternativa elegida; en el producto, se envía como un mensaje nuevo del usuario
   * y arranca otra ejecución (en assistant-ui: `aui.thread.append(alternative)`).
   * Sin él, las alternativas se muestran como sugerencias de solo lectura, no como botones.
   */
  onPick?: (alternative: string) => void;
  /** Default 'Prueba en su lugar'. */
  alternativesLabel?: string;
  className?: string;
}

/** Medidas del tablero. */
const MAX_WIDTH = 384;
const BADGE_SIZE = 32;
const BADGE_ICON_SIZE = 18;
const ARROW_SIZE = 14;
const ALTERNATIVE_MIN_HEIGHT = 32;

/** Insignia del tablero: fondo warning[50], ícono warning.dark. */
const badgeColors = (t: Theme) => {
  const warningScale = t.palette.warning as unknown as Record<number, string | undefined>;
  return { background: warningScale[50] ?? t.palette.warning.light, icon: t.palette.warning.dark };
};

export function GuardrailNotice({
  title = 'No puedo ayudarte con eso',
  policy,
  explanation,
  alternatives = [],
  onPick,
  alternativesLabel = 'Prueba en su lugar',
  className,
}: GuardrailNoticeProps) {
  const titleId = React.useId();
  const hasAlternatives = alternatives.length > 0;

  return (
    <Stack
      role="note"
      aria-labelledby={titleId}
      spacing={1.5}
      className={className}
      sx={{
        width: '100%',
        maxWidth: MAX_WIDTH,
        boxSizing: 'border-box',
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Box
          aria-hidden="true"
          sx={(t) => ({
            width: BADGE_SIZE,
            height: BADGE_SIZE,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: badgeColors(t).background,
            color: badgeColors(t).icon,
          })}
        >
          <ShieldAlert size={BADGE_ICON_SIZE} />
        </Box>
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography id={titleId} component="span" variant="subtitle1">{title}</Typography>
          {policy ? <Typography component="span" variant="body3" color="text.secondary">{policy}</Typography> : null}
        </Stack>
      </Stack>

      <Typography component="p" variant="body1" sx={{ m: 0 }}>{explanation}</Typography>

      {hasAlternatives ? (
        <Stack spacing={0.5}>
          <Typography component="span" variant="overline" color="text.secondary">{alternativesLabel}</Typography>
          <Stack sx={{ mx: -1 }}>
            {alternatives.map((alternative) => {
              const content = (
                <>
                  <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', flexShrink: 0, color: onPick ? 'primary.main' : 'text.disabled' }}>
                    <ArrowRight size={ARROW_SIZE} />
                  </Box>
                  {alternative}
                </>
              );
              const rowSx = (t: Theme) => ({
                width: '100%',
                minHeight: ALTERNATIVE_MIN_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                textAlign: 'left' as const,
                ...t.typography.body1,
              });
              return onPick ? (
                <ButtonBase
                  key={alternative}
                  onClick={() => onPick(alternative)}
                  sx={(t) => ({
                    ...rowSx(t),
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'action.hover' },
                    '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: 2 },
                  })}
                >
                  {content}
                </ButtonBase>
              ) : (
                <Box key={alternative} component="span" sx={(t) => ({ ...rowSx(t), color: 'text.secondary' })}>
                  {content}
                </Box>
              );
            })}
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
}
