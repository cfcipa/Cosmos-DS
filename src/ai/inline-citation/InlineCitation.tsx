// Cosmos DS · Kit IA · Knowledge: Inline citation.
// Tablero «Inline citation»: referencias numeradas dentro de la frase, cada una con una vista previa de su fuente.
// Como en assistant-ui (PreviewCard): una sola vista previa abierta a la vez (openIndex controlado); se abre al pasar el
// cursor, con el foco o con un clic (el clic no la cierra), y se cierra al salir, al perder el foco o con Esc.
// La vista previa muestra el sitio (favicon o inicial), el título y el fragmento. Es un Popper + Paper de MUI.
import * as React from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SourceIcon } from '../web-search';
import { primaryTint } from '../lib/primaryTint';

export interface CitationSource {
  domain: string;
  title: string;
  snippet: string;
  /** Favicon del sitio. Si no carga, se muestra la inicial del dominio. */
  iconUrl?: string;
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
        onClick={() => onOpenChange(true)}
        onKeyDown={(event) => { if (event.key === 'Escape') onOpenChange(false); }}
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
      {/* Popper ya lleva role="tooltip"; el id es el que describe al número. */}
      <Popper id={previewId} open={open && Boolean(anchor)} anchorEl={anchor} placement="top-start" sx={{ zIndex: 'tooltip' }} modifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}>
        <Paper elevation={8} sx={{ width: PREVIEW_WIDTH, px: 1.5, py: 1.25 }}>
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <SourceIcon domain={source.domain} iconUrl={source.iconUrl} />
              <Typography variant="caption" color="text.secondary" noWrap>{source.domain}</Typography>
            </Stack>
            <Typography variant="subtitle2">{source.title}</Typography>
            <Typography variant="body3" color="text.secondary">{source.snippet}</Typography>
          </Stack>
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
