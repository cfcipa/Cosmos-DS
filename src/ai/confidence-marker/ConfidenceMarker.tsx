// Cosmos DS · Kit IA · Messages: Confidence.
// Tablero aprobado «Confidence»: qué afirmaciones vienen de una fuente, cuáles se infirieron y cuáles son suposiciones.
// Como en assistant-ui: cada afirmación se subraya según su confianza y, al pasar el cursor o con el foco,
// su fundamento aparece debajo sin mover el texto. La diferencia no depende solo del color: grosor y punteado cambian.
import * as React from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';

export type Confidence = 'grounded' | 'inferred' | 'uncertain';

export interface ConfidenceClaim {
  id: string;
  text: string;
  confidence: Confidence;
  /** De dónde sale: «consultar_anticipos · 22 sep 2026». */
  basis: string;
}

export interface ConfidenceMarkerProps {
  claims: readonly ConfidenceClaim[];
  hoveredId: string;
  onHover?: (id: string) => void;
  /** Muestra la leyenda de los tres subrayados. Default true. */
  showLegend?: boolean;
  className?: string;
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = { grounded: 'Con fuente', inferred: 'Inferido', uncertain: 'Incierto' };

/** Subrayado con el degradado de IA del kit: 2px continuo, 1px continuo o 2px punteado. */
const underline = (confidence: Confidence, highlighted: boolean) => (t: Theme) => {
  const gradient = `linear-gradient(90deg, ${t.palette.ai.markStart}, ${t.palette.ai.markEnd})`;
  const thickness = confidence === 'inferred' ? '1px' : '2px';
  const surface = highlighted ? t.palette.action.selected : t.palette.background.paper;
  const dots = confidence === 'uncertain' ? `repeating-linear-gradient(90deg, transparent 0 2px, ${surface} 2px 4px) left bottom / 100% ${thickness} no-repeat, ` : '';
  const tint = highlighted ? `, linear-gradient(${t.palette.action.selected}, ${t.palette.action.selected})` : '';
  return { background: `${dots}${gradient} left bottom / 100% ${thickness} no-repeat${tint}`, WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' } as const;
};

export function ConfidenceMarker({ claims, hoveredId, onHover, showLegend = true, className }: ConfidenceMarkerProps) {
  const basisId = React.useId();
  const hovered = claims.find((claim) => claim.id === hoveredId);

  return (
    <Stack spacing={2} className={className} data-slot="confidence-marker">
      <Typography component="p" variant="body1" sx={{ m: 0, lineHeight: 1.9 }}>
        {claims.map((claim) => {
          const isHovered = claim.id === hoveredId;
          return (
            <React.Fragment key={claim.id}>
              {/* span: un <button> no fluye en línea; ButtonBase le da rol, foco y teclado. */}
              <ButtonBase
                component="span"
                disableRipple
                aria-describedby={isHovered ? basisId : undefined}
                onMouseEnter={() => onHover?.(claim.id)}
                onMouseLeave={() => onHover?.('')}
                onFocus={() => onHover?.(claim.id)}
                onBlur={() => onHover?.('')}
                sx={(t) => ({
                  display: 'inline',
                  px: 0.25,
                  pb: 0.375,
                  borderRadius: 1,
                  font: 'inherit',
                  color: 'inherit',
                  textAlign: 'left',
                  verticalAlign: 'baseline',
                  cursor: 'help',
                  ...underline(claim.confidence, isHovered)(t),
                  '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: 2 },
                })}
              >
                {claim.text}
              </ButtonBase>{' '}
            </React.Fragment>
          );
        })}
      </Typography>

      {/* Alto reservado: el fundamento aparece sin mover el resto. */}
      <Box sx={{ minHeight: (t) => t.spacing(4), display: 'flex', alignItems: 'center' }}>
        {hovered ? (
          <Chip
            id={basisId}
            size="small"
            variant="outlined"
            label={<><Box component="span" sx={{ fontWeight: 'fontWeightMedium' }}>{CONFIDENCE_LABEL[hovered.confidence]}</Box>{' '}<Box component="span" sx={{ color: 'text.secondary' }}>{hovered.basis}</Box></>}
            sx={{ maxWidth: '100%' }}
          />
        ) : null}
      </Box>

      {showLegend ? (
        <Stack direction="row" spacing={2}>
          {(Object.keys(CONFIDENCE_LABEL) as Confidence[]).map((confidence) => (
            <Typography key={confidence} variant="body3" color="text.secondary" sx={(t) => ({ pb: 0.375, ...underline(confidence, false)(t) })}>
              {CONFIDENCE_LABEL[confidence]}
            </Typography>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
