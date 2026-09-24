// Cosmos DS · Kit IA · Knowledge: Inline citation.
// Tablero «Inline citation»: referencias numeradas dentro de la frase, cada una con una vista previa de su fuente.
// Como en assistant-ui: una sola vista previa abierta a la vez (openIndex controlado); se abre al pasar el cursor,
// con el foco o con un clic, y el número abierto queda relleno. La vista previa es un Popper + Paper de MUI.
import * as React from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import { primaryTint } from '../lib/primaryTint';

export interface CitationSource {
  domain: string;
  title: string;
  snippet: string;
}

/** Un tramo del texto; si trae `source`, al final lleva la referencia a sources[source]. */
export interface CitedSegment {
  text: string;
  source?: number;
}

export interface InlineCitationProps {
  segments: readonly CitedSegment[];
  sources: readonly CitationSource[];
  /** La referencia abierta (desde 0) o null. */
  openIndex: number | null;
  onOpenIndexChange: (index: number | null) => void;
  className?: string;
}

/** Ancho de la vista previa en el tablero. */
const PREVIEW_WIDTH = 240;

function Citation({ index, source, open, onOpenChange }: { index: number; source: CitationSource; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [anchor, setAnchor] = React.useState<HTMLButtonElement | null>(null);
  const previewId = React.useId();

  return (
    <>
      <ButtonBase
        ref={setAnchor}
        aria-label={`Fuente ${index + 1}`}
        aria-expanded={open}
        aria-describedby={open ? previewId : undefined}
        onMouseEnter={() => onOpenChange(true)}
        onMouseLeave={() => onOpenChange(false)}
        onFocus={() => onOpenChange(true)}
        onBlur={() => onOpenChange(false)}
        onClick={() => onOpenChange(!open)}
        sx={(t) => ({
          minWidth: t.spacing(2),
          height: t.spacing(2),
          ml: 0.25,
          px: 0.5,
          borderRadius: t.spacing(1),
          verticalAlign: 'super',
          fontFamily: t.aiKit.code.fontFamily,
          fontSize: t.typography.caption.fontSize,
          lineHeight: t.spacing(2),
          fontVariantNumeric: 'tabular-nums',
          bgcolor: open ? 'primary.main' : primaryTint(t),
          color: open ? 'primary.contrastText' : 'primary.dark',
          transition: t.transitions.create(['background-color', 'color'], { duration: t.transitions.duration.shortest }),
          '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: 2 },
        })}
      >
        {index + 1}
      </ButtonBase>
      <Popper open={open && Boolean(anchor)} anchorEl={anchor} placement="top-start" sx={{ zIndex: 'tooltip' }} modifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}>
        <Paper id={previewId} role="tooltip" elevation={8} sx={{ width: PREVIEW_WIDTH, px: 1.5, py: 1.25 }}>
          <Typography variant="body3">{`${source.domain} · ${source.title} — ${source.snippet}`}</Typography>
        </Paper>
      </Popper>
    </>
  );
}

export function InlineCitation({ segments, sources, openIndex, onOpenIndexChange, className }: InlineCitationProps) {
  return (
    // Interlineado del tablero (28px, en la escala de spacing): deja sitio a los números sobre la línea.
    <Typography variant="body1" className={className} data-slot="inline-citation" sx={(t) => ({ lineHeight: t.spacing(3.5) })}>
      {segments.map((segment, i) => {
        const source = segment.source !== undefined ? sources[segment.source] : undefined;
        return (
          <React.Fragment key={i}>
            {segment.text}
            {source && segment.source !== undefined ? (
              <Citation
                index={segment.source}
                source={source}
                open={openIndex === segment.source}
                onOpenChange={(open) => onOpenIndexChange(open ? (segment.source as number) : null)}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </Typography>
  );
}
