import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Check, Copy, RefreshCw, Search } from 'lucide-react';
import { SourceIcon, WebSearch } from '../../src/ai/web-search';
import type { WebSearchResult } from '../../src/ai/web-search';
import { DemoBubble } from '../ui/DemoBubble';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Web search».
const USER_MESSAGE = '¿Cuáles son las tarifas de retención en la fuente para 2026?';
const QUERY = 'tarifas de retención en la fuente 2026';
const favicon = (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`;
const RESULTS: WebSearchResult[] = [
  { title: 'Retención en la fuente: bases y tarifas 2026', domain: 'dian.gov.co', url: 'https://www.dian.gov.co/normatividad' },
  { title: 'Configurar conceptos de retención en Sinco', domain: 'sinco.com.co', url: 'https://www.sinco.com.co/ayuda/retencion' },
  { title: 'Tabla de retención en la fuente 2026', domain: 'actualicese.com', url: 'https://actualicese.com/tabla-de-retencion-en-la-fuente' },
].map((r) => ({ ...r, iconUrl: favicon(r.domain) }));
const ANSWER = 'Para 2026 las tarifas generales se mantienen: compras 2,5 % desde 27 UVT, servicios generales 4 % desde 4 UVT y honorarios 11 %. En Sinco se ajustan en cada concepto de retención.';
const EMPTY = 'No encontré fuentes para esa búsqueda. ¿La intento con otros términos?';
/** Tiempos del tablero: la búsqueda arranca y cada resultado llega después. */
const PHASES = [1800, 500, 500, 500];
const DONE_MS = 3300;
const COPIED_MS = 1500;

type Flag = 'true' | 'false';
type ResultsMode = 'full' | 'empty';

export function WebSearchDoc() {
  const [visible, setVisible] = React.useState(0);
  const [searching, setSearching] = React.useState(true);
  const [cycle, setCycle] = React.useState(0);
  const [open, setOpen] = React.useState(true);
  const [ms, setMs] = React.useState(0);
  const [mode, setMode] = React.useState<ResultsMode>('full');
  const [copied, setCopied] = React.useState(false);
  const [lastOpened, setLastOpened] = React.useState('');
  const timers = React.useRef<number[]>([]);
  const clock = React.useRef<number>();
  const conversationRef = React.useRef<HTMLDivElement>(null);
  const results = mode === 'empty' ? [] : RESULTS;

  const stop = () => { timers.current.forEach((id) => window.clearTimeout(id)); timers.current = []; window.clearInterval(clock.current); };
  const startClock = () => { const t0 = Date.now(); window.clearInterval(clock.current); clock.current = window.setInterval(() => setMs(Date.now() - t0), 100); return t0; };

  const run = React.useCallback((nextMode: ResultsMode = mode) => {
    stop();
    const total = nextMode === 'empty' ? 0 : RESULTS.length;
    setVisible(0); setSearching(true); setCycle((c) => c + 1); setOpen(true); setMs(0); setCopied(false);
    const t0 = startClock();
    let at = 0;
    for (let step = 1; step <= total + 1; step += 1) {
      at += PHASES[Math.min(step - 1, PHASES.length - 1)];
      timers.current.push(window.setTimeout(() => {
        if (step <= total) setVisible(step);
        else { window.clearInterval(clock.current); setSearching(false); setMs(Date.now() - t0); }
      }, at));
    }
  }, [mode]);
  React.useEffect(() => { run(); return stop; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' });
  }, [visible, searching, open]);

  // En la demo los enlaces no salen del catálogo: solo se anota a dónde irían.
  const openResult = (domain: string, event: React.MouseEvent) => { event.preventDefault(); setLastOpened(domain); };
  const copy = () => { setCopied(true); timers.current.push(window.setTimeout(() => setCopied(false), COPIED_MS)); };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={
          <Box ref={conversationRef} sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Stack spacing={3} sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
              <DemoBubble>{USER_MESSAGE}</DemoBubble>
              <Stack spacing={0.5}>
                <WebSearch
                  query={QUERY}
                  results={results}
                  visibleResults={visible}
                  searching={searching}
                  cycle={cycle}
                  durationMs={ms}
                  open={open}
                  onOpenChange={setOpen}
                  onOpenResult={(result, event) => openResult(result.domain, event)}
                />
                {searching ? null : (
                  <>
                    <Typography variant="body1">{results.length ? ANSWER : EMPTY}</Typography>
                    {results.length ? (
                      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1, pt: 1 }}>
                        {results.map((result) => (
                          <Chip
                            key={result.domain}
                            size="small"
                            variant="outlined"
                            clickable
                            component="a"
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${result.domain} (se abre en una pestaña nueva)`}
                            onClick={(event: React.MouseEvent) => openResult(result.domain, event)}
                            avatar={<SourceIcon domain={result.domain} iconUrl={result.iconUrl} size={1.5} />}
                            label={result.domain}
                          />
                        ))}
                      </Stack>
                    ) : null}
                    <Stack direction="row" spacing={0.25} sx={{ ml: -0.75, pt: 0.5 }}>
                      <Tooltip title={copied ? 'Copiado' : 'Copiar'}>
                        <IconButton aria-label="Copiar" onClick={copy} sx={copied ? { color: 'success.main' } : undefined}>
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Regenerar"><IconButton aria-label="Regenerar" onClick={() => run()}><RefreshCw size={16} /></IconButton></Tooltip>
                    </Stack>
                  </>
                )}
              </Stack>
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="Try it">
              <Button variant="contained" startIcon={<Search size={16} />} onClick={() => run()}>Search again</Button>
              <Typography variant="body3" color="text.secondary" noWrap>
                {lastOpened ? `opens ${lastOpened} in a new tab` : `bumps cycle to ${cycle + 1}`}
              </Typography>
            </PropRow>
            <PropRow label="searching">
              <PropToggle<Flag>
                label="searching"
                value={searching ? 'true' : 'false'}
                onChange={(v) => {
                  stop();
                  setSearching(v === 'true');
                  if (v === 'true') { setMs(0); startClock(); } else setMs((m) => m || DONE_MS);
                }}
                options={[['true', 'true'], ['false', 'false']]}
              />
            </PropRow>
            <PropRow label="visibleResults">
              <PropToggle<string>
                label="visibleResults"
                value={String(Math.min(visible, results.length))}
                onChange={(v) => { stop(); setVisible(Number(v)); }}
                options={[['0', '0'], ['1', '1'], ['2', '2'], ['3', '3']]}
              />
            </PropRow>
            <PropRow label="results">
              <PropToggle<ResultsMode>
                label="results"
                value={mode}
                onChange={(v) => { stop(); setMode(v); setSearching(false); setVisible(v === 'empty' ? 0 : RESULTS.length); setMs((m) => m || DONE_MS); }}
                options={[['full', '3 results'], ['empty', 'empty []']]}
              />
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function WebSearchCard() {
  return <Box sx={{ width: '100%' }}><WebSearch query={QUERY} results={RESULTS} visibleResults={RESULTS.length} searching={false} durationMs={DONE_MS} /></Box>;
}
