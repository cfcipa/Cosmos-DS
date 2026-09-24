import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { InlineCitation } from '../../src/ai/inline-citation';
import type { CitationSource, CitedSegment } from '../../src/ai/inline-citation';
import { ElementPage, PropRow } from '../ui/Playground';

// Contenido del tablero «Inline citation».
const favicon = (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`;
const SOURCES: CitationSource[] = [
  { domain: 'dian.gov.co', title: 'Retención en la fuente', snippet: 'La base de retención es el valor del pago antes de IVA, según el concepto.' },
  { domain: 'sinco.com.co', title: 'Conceptos de retención', snippet: 'Cada concepto define su tarifa y el mínimo a partir del cual se practica.' },
].map((source) => ({ ...source, iconUrl: favicon(source.domain) }));
const SEGMENTS: CitedSegment[] = [
  { text: 'La retención se calcula sobre la base gravable antes de IVA', source: 0 },
  { text: ', con la tarifa del concepto y solo si la base supera el mínimo del año', source: 1 },
  { text: '. Sinco toma la tarifa del concepto configurado.' },
];

export function InlineCitationDoc() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, boxSizing: 'border-box' }}>
            <Box sx={{ width: '100%', maxWidth: 440 }}>
              <InlineCitation segments={SEGMENTS} sources={SOURCES} openIndex={openIndex} onOpenIndexChange={setOpenIndex} />
            </Box>
          </Box>
        }
        properties={
          <PropRow label="openIndex">
            <Typography variant="body3" color="text.secondary" sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>{String(openIndex)}</Typography>
          </PropRow>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements: la misma demo, en pequeño y funcionando. */
export function InlineCitationCard() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  return <Box sx={{ width: '100%' }}><InlineCitation segments={SEGMENTS} sources={SOURCES} openIndex={openIndex} onOpenIndexChange={setOpenIndex} /></Box>;
}
