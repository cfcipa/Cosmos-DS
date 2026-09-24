import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Check, Copy, FileText, RefreshCw, Search } from 'lucide-react';
import { ResearchReport } from '../../src/ai/research-report';
import type { ReportSection } from '../../src/ai/research-report';
import { SourceIcon } from '../../src/ai/web-search';
import { DemoBubble } from '../ui/DemoBubble';
import { useTimers } from '../ui/useTimers';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Research report».
const USER_MESSAGE = 'Prepárame un informe del estado de los anticipos de septiembre.';
const TITLE = 'Estado de los anticipos · septiembre 2026';
const SECTIONS = [
  { heading: 'Anticipos entregados', preview: '14 anticipos por $18.450.000; 11 ya legalizados con factura.' },
  { heading: 'Pendientes por legalizar', preview: 'CE-4492, CE-4480 y CE-4471 suman $3.930.000 sin soporte.' },
  { heading: 'Responsables y vencimientos', preview: 'CE-4492 de Nubia Rojas vence el 30 de septiembre; los otros dos, en octubre.' },
  { heading: 'Recomendaciones', preview: 'Enviar recordatorio esta semana y frenar nuevos anticipos con saldo vencido.' },
];
const ANSWER = 'Listo el informe. Lo más urgente es CE-4492 de Nubia Rojas por $1.250.000, que vence el 30 de septiembre.';
const EMPTY_ANSWER = 'No encontré anticipos para septiembre, así que el informe quedó sin secciones.';
const DOC_SOURCES = ['Auxiliar 133005.xlsx', 'Política de anticipos.pdf'];
const WEB_SOURCE = { domain: 'sinco.com.co', url: 'https://www.sinco.com.co/ayuda/anticipos' };
/** Cada sección tarda esto en escribirse (tablero). */
const SECTION_MS = 1100;
const COPIED_MS = 1500;

/** Estado de cada sección según cuántas van listas (el conteo de fuentes es el del tablero). */
const sectionsAt = (phase: number): ReportSection[] => SECTIONS.map((section, i) => {
  const state = i < phase ? 'done' : i === phase ? 'writing' : 'pending';
  return { id: String(i), heading: section.heading, state, sources: i < phase ? 4 - i : 0, preview: i < phase ? section.preview : undefined };
});

type SectionsMode = 'full' | 'empty';

export function ResearchReportDoc() {
  const [phase, setPhase] = React.useState(0);
  const [mode, setMode] = React.useState<SectionsMode>('full');
  const [copied, setCopied] = React.useState(false);
  const [log, setLog] = React.useState('');
  const timers = React.useRef<number[]>([]);
  const conversationRef = React.useRef<HTMLDivElement>(null);
  const stop = () => { timers.current.forEach((id) => window.clearTimeout(id)); timers.current = []; };

  const run = React.useCallback(() => {
    stop();
    setPhase(0); setMode('full'); setCopied(false);
    for (let k = 1; k <= SECTIONS.length; k += 1) timers.current.push(window.setTimeout(() => setPhase(k), SECTION_MS * k));
  }, []);
  React.useEffect(() => { run(); return stop; }, [run]);
  React.useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' });
  }, [phase, mode]);

  const isEmpty = mode === 'empty';
  const sections = isEmpty ? [] : sectionsAt(phase);
  const complete = isEmpty || phase >= SECTIONS.length;
  const sourcesRead = isEmpty ? 0 : 6 + phase * 3;
  const status = log || (complete ? 'status: complete' : `status: running · section ${phase + 1} writing`);

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={
          <Box ref={conversationRef} sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Stack spacing={3} sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
              <DemoBubble>{USER_MESSAGE}</DemoBubble>
              <Stack spacing={1.5}>
                <ResearchReport title={TITLE} sections={sections} sourcesRead={sourcesRead} />
                {complete ? (
                  <>
                    <Typography variant="body1">{isEmpty ? EMPTY_ANSWER : ANSWER}</Typography>
                    {isEmpty ? null : (
                      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {DOC_SOURCES.map((name) => <Chip key={name} size="small" icon={<FileText size={14} />} label={name} />)}
                        <Chip
                          size="small"
                          variant="outlined"
                          clickable
                          component="a"
                          href={WEB_SOURCE.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${WEB_SOURCE.domain} (se abre en una pestaña nueva)`}
                          onClick={(event: React.MouseEvent) => { event.preventDefault(); setLog(`opens ${WEB_SOURCE.domain} in a new tab`); }}
                          avatar={<SourceIcon domain={WEB_SOURCE.domain} size={1.5} />}
                          label={WEB_SOURCE.domain}
                        />
                      </Stack>
                    )}
                    <Stack direction="row" spacing={0.25} sx={{ ml: -0.75 }}>
                      <Tooltip title={copied ? 'Copiado' : 'Copiar'}>
                        <IconButton
                          aria-label="Copiar"
                          sx={copied ? { color: 'success.main' } : undefined}
                          onClick={() => {
                            navigator.clipboard?.writeText(ANSWER).catch(() => undefined);
                            setCopied(true);
                            timers.current.push(window.setTimeout(() => setCopied(false), COPIED_MS));
                          }}
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Regenerar"><IconButton aria-label="Regenerar" onClick={run}><RefreshCw size={16} /></IconButton></Tooltip>
                    </Stack>
                  </>
                ) : null}
              </Stack>
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="Try it">
              <Button variant="contained" startIcon={<Search size={16} />} onClick={() => { setLog(''); run(); }}>Research again</Button>
              <Typography variant="body3" color="text.secondary" noWrap>{status}</Typography>
            </PropRow>
            <PropRow label="progress">
              <PropToggle<string>
                label="progress"
                value={String(isEmpty ? 0 : phase)}
                onChange={(v) => { stop(); setMode('full'); setPhase(Number(v)); }}
                options={[['0', '0/4'], ['1', '1/4'], ['2', '2/4'], ['3', '3/4'], ['4', '4/4']]}
              />
            </PropRow>
            <PropRow label="sections">
              <PropToggle<SectionsMode>
                label="sections"
                value={mode}
                onChange={(v) => { stop(); setMode(v); setPhase(v === 'empty' ? 0 : SECTIONS.length); }}
                options={[['full', '4 sections'], ['empty', 'empty []']]}
              />
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements: la misma demo, en pequeño y funcionando. */
export function ResearchReportCard() {
  const { after, clear } = useTimers();
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    clear();
    for (let k = 1; k <= SECTIONS.length; k += 1) after(SECTION_MS * k, () => setPhase(k));
  }, [after, clear]);
  return <Box sx={{ width: '100%' }}><ResearchReport title={TITLE} sections={sectionsAt(phase)} sourcesRead={6 + phase * 3} /></Box>;
}
