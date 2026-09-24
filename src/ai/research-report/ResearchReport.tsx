// Cosmos DS · Kit IA · Knowledge: Research report.
// Tablero «Research report»: un esquema que se llena sección por sección, cada una con las fuentes que la respaldan.
// Como en assistant-ui: el encabezado cuenta secciones listas y fuentes leídas; cada sección está pendiente (punto),
// escribiéndose (spinner, el mismo lugar que en Tool call) o lista (check), y al terminar muestra su resumen.
// Paper outlined con una lista ordenada separada por Divider.
import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import { Check } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

export type SectionState = 'pending' | 'writing' | 'done';

export interface ReportSection {
  id: string;
  heading: string;
  state: SectionState;
  /** Fuentes que respaldan la sección. En 0 no se muestra. */
  sources: number;
  preview?: string;
}

export interface ResearchReportProps {
  title: string;
  sections: readonly ReportSection[];
  sourcesRead: number;
  /** Default «N/M secciones · K fuentes leídas». */
  metaLabel?: (done: number, total: number, sourcesRead: number) => string;
  className?: string;
}

const ICON_SIZE = 16;
const STATE_LABEL: Record<SectionState, string> = { pending: 'Pendiente', writing: 'Escribiendo', done: 'Lista' };
const defaultMeta = (done: number, total: number, read: number) => `${done}/${total} secciones · ${read} ${read === 1 ? 'fuente leída' : 'fuentes leídas'}`;
const rise = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; }`;

function StateIcon({ state }: { state: SectionState }) {
  return (
    <Box
      component="span"
      role="img"
      aria-label={STATE_LABEL[state]}
      sx={(t) => ({
        width: t.spacing(ICON_SIZE / 8),
        height: t.spacing(ICON_SIZE / 8),
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: state === 'done' ? 'ai.toolStatus.complete' : 'ai.toolStatus.running',
      })}
    >
      {state === 'done' ? <Check size={ICON_SIZE} /> : null}
      {state === 'writing' ? <CircularProgress size={ICON_SIZE - 2} thickness={4.4} disableShrink color="inherit" /> : null}
      {state === 'pending' ? <Box component="span" sx={(t) => ({ width: t.spacing(0.75), height: t.spacing(0.75), borderRadius: '50%', bgcolor: 'divider' })} /> : null}
    </Box>
  );
}

export function ResearchReport({ title, sections, sourcesRead, metaLabel = defaultMeta, className }: ResearchReportProps) {
  const done = sections.filter((section) => section.state === 'done').length;
  const busy = sections.some((section) => section.state !== 'done');

  return (
    <Paper variant="outlined" className={className} data-slot="research-report" aria-busy={busy} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Stack spacing={0.25}>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="body3" color="text.secondary" role="status" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {metaLabel(done, sections.length, sourcesRead)}
        </Typography>
      </Stack>

      {sections.length ? (
        <Stack component="ol" divider={<Divider component="li" aria-hidden="true" />} sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {sections.map((section, i) => (
            <Stack key={section.id} component="li" spacing={0.25} sx={{ pt: i === 0 ? 0 : 1, pb: i === sections.length - 1 ? 0 : 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <StateIcon state={section.state} />
                <Typography
                  variant="body1"
                  noWrap
                  sx={(t) => ({
                    flexGrow: 1,
                    minWidth: 0,
                    color: section.state === 'pending' ? 'text.disabled' : 'text.primary',
                    transition: t.transitions.create('color', { duration: t.transitions.duration.shorter }),
                  })}
                >
                  {section.heading}
                </Typography>
                {section.sources > 0 ? (
                  <Typography variant="body3" color="text.secondary" sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {`${section.sources} ${section.sources === 1 ? 'fuente' : 'fuentes'}`}
                  </Typography>
                ) : null}
              </Stack>
              {section.preview ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={(t) => ({ pl: 3, animation: `${rise} ${t.transitions.duration.standard}ms ${t.transitions.easing.easeOut} both`, [REDUCED_MOTION]: { animation: 'none' } })}
                >
                  {section.preview}
                </Typography>
              ) : null}
            </Stack>
          ))}
        </Stack>
      ) : null}
    </Paper>
  );
}
