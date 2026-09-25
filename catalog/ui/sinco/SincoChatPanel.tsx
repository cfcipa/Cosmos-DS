// La plantilla «Obligaciones con chat panel»: la pantalla de Obligaciones por pagar y, al tocar un proveedor, el detalle
// de la fila en un cajón a la derecha con el Chat panel del kit dentro, que responde sobre esa obligación (estado,
// soporte, saldo, confirmación). Cada obligación guarda su conversación. Sin runtime de assistant-ui: el chat es el
// elemento presentacional, con el ritmo de streaming de las demos.
import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { X } from 'lucide-react';
import { ChatPanel, ChatPanelAssistantMessage, ChatPanelComposer, ChatPanelMessages, ChatPanelTyping, ChatPanelUserMessage } from '../../../src/ai/chat-panel';
import { FIRST_TOKEN_MS, STREAM_STEP, STREAM_TICK_MS } from '../demoStream';
import { SincoPage, SincoScreen } from './SincoHost';
import { CHIP, money, useObligaciones, type Estado, type Obligacion } from './obligaciones';
import { EstadoChip } from './parts';

/** Medidas del tablero: el cajón de 440px; el ícono de cerrar de 20px. */
const DRAWER_WIDTH = 55;
const CLOSE_ICON = 20;

/** Las preguntas sugeridas del chat vacío. */
export const CHAT_PANEL_SUGGESTIONS = ['¿Qué pasa con el soporte?', '¿Cuánto falta por pagar?', '¿Puedo confirmarla?'];
const EMPTY_TEXT = 'Pregunta sobre esta obligación: su estado, el soporte o el saldo.';

/** La respuesta del asistente sobre una obligación, según lo que se pregunte. */
export function recordAnswer(r: Obligacion, question: string) {
  const q = question.toLowerCase();
  const estado = CHIP[r.est].label.toLowerCase();
  if (/rechaz|motivo|devol/.test(q)) return r.motivo ? 'La rechazó C. Ramírez el 05/09/2026. Hay que ajustarla y volver a enviarla para confirmación.' : `No tiene rechazos. Está en estado ${estado}.`;
  if (/soporte|venc/.test(q)) return r.soporte ? `El documento soporte ${r.soporte.txt}. Súbelo antes de confirmar para no bloquear la causación.` : 'El documento soporte está al día; no tiene vencimientos.';
  if (/saldo|pag|abono/.test(q)) {
    const sd = r.saldo;
    if (sd?.tipo === 'abonos') return `Lleva ${sd.n} abonos y le queda un saldo de ${money(sd.valor ?? 0)} ${r.cur}.`;
    if (sd?.tipo === 'extracto') return 'Se paga con el extracto de la tarjeta, así que el saldo se concilia contra el extracto.';
    return 'No tiene abonos registrados.';
  }
  if (/confirm|caus/.test(q)) {
    if (r.bloqueo) return 'Tú radicaste esta obligación; la confirmación la hace otra persona.';
    return r.est === 'pendiente' ? 'Está pendiente y tú puedes confirmarla desde la fila de la tabla.' : `Está ${estado}; no necesita confirmación.`;
  }
  return `${r.ob} es una compra a ${r.prov} por ${money(r.total)} ${r.cur}, registrada el ${r.fr}. Está ${estado}.`;
}

type Turn = { role: 'user' | 'assistant'; text: string; shown?: number };

/** Una conversación por obligación: pregunta, «escribiendo» y la respuesta llegando de a poco. */
function useRecordChat(record: Obligacion | null) {
  const [convos, setConvos] = React.useState<Record<number, Turn[]>>({});
  const [typing, setTyping] = React.useState(false);
  const timers = React.useRef<number[]>([]);
  const stop = React.useCallback(() => { timers.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id); }); timers.current = []; setTyping(false); }, []);
  React.useEffect(() => stop, [stop]);
  const id = record?.id;
  React.useEffect(() => { stop(); }, [id, stop]);
  const ask = React.useCallback((text: string) => {
    if (!record || !text.trim() || typing) return;
    const key = record.id;
    const put = (fn: (c: Turn[]) => Turn[]) => setConvos((all) => ({ ...all, [key]: fn(all[key] ?? []) }));
    put((c) => [...c, { role: 'user', text: text.trim() }]);
    setTyping(true);
    timers.current.push(window.setTimeout(() => {
      const full = recordAnswer(record, text);
      setTyping(false);
      put((c) => [...c, { role: 'assistant', text: full, shown: 0 }]);
      const tick = window.setInterval(() => {
        let done = false;
        put((c) => {
          const last = c[c.length - 1];
          if (!last || last.role !== 'assistant' || last.shown === undefined) { done = true; return c; }
          const shown = Math.min(last.text.length, last.shown + STREAM_STEP);
          done = shown >= last.text.length;
          return [...c.slice(0, -1), { ...last, shown }];
        });
        if (done) window.clearInterval(tick);
      }, STREAM_TICK_MS);
      timers.current.push(tick);
    }, FIRST_TOKEN_MS));
  }, [record, typing]);
  return { turns: record ? convos[record.id] ?? [] : [], typing, ask };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      {typeof children === 'string' ? <Typography variant="body2" noWrap sx={{ fontVariantNumeric: 'tabular-nums' }}>{children}</Typography> : <Box>{children}</Box>}
    </Stack>
  );
}

/** El detalle de una obligación con su asistente. */
export function ObligacionDrawer({ record, open, onClose }: { record: Obligacion | null; open: boolean; onClose: () => void }) {
  const chat = useRecordChat(record);
  const [text, setText] = React.useState('');
  React.useEffect(() => { setText(''); }, [record?.id]);
  const sd = record?.saldo;
  const saldo = sd?.tipo === 'abonos' ? `${money(sd.valor ?? 0)} · ${sd.n} abonos` : sd?.tipo === 'extracto' ? 'Pago por extracto' : sd?.tipo === 'sin' ? 'Sin abonos' : '—';
  const send = (t: string) => { chat.ask(t); setText(''); };
  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      // Vive dentro de la pantalla, bajo el AppBar: el papel se posiciona en su contenedor, no en la ventana.
      sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', '& .MuiDrawer-paper': { position: 'absolute', pointerEvents: 'auto' } }}
      PaperProps={{ elevation: 16, role: record ? 'dialog' : undefined, 'aria-labelledby': 'obligacion-drawer-title', sx: (t) => ({ width: t.spacing(DRAWER_WIDTH), border: 0, boxShadow: t.shadows[16] }) }}
    >
      {record ? (
        <>
          <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ pt: 2, pr: 1.5, pb: 1.5, pl: 3 }}>
            <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
              <Typography id="obligacion-drawer-title" variant="h6" component="h2">{record.ob}</Typography>
              <Typography variant="body2" color="text.secondary">{record.prov} · {record.nit}</Typography>
            </Stack>
            <IconButton aria-label="Cerrar el detalle" onClick={onClose}><X size={CLOSE_ICON} /></IconButton>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 2, rowGap: 1.5, pt: 0.5, px: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Field label="Estado"><EstadoChip estado={record.est} /></Field>
            <Field label="Total">{`${money(record.total)} ${record.cur}`}</Field>
            <Field label="Fecha de compra">{record.fc ?? '—'}</Field>
            <Field label="Medio de pago">{record.mp ? `${record.mp.t}${record.mp.d ? ` · ${record.mp.d}` : ''}` : '—'}</Field>
            <Field label="Documento soporte">{record.soporte ? `Vence ${record.soporte.txt.replace('vence ', '')}` : 'Al día'}</Field>
            <Field label="Saldo por pagar">{saldo}</Field>
          </Box>
          <Typography variant="caption" component="p" color="text.secondary" sx={(t) => ({ pt: 2, px: 3, pb: 1, fontWeight: t.typography.fontWeightMedium })}>Asistente</Typography>
          <ChatPanel sx={{ flex: 1, minHeight: 0, height: 'auto', maxWidth: 'none', mx: 2, mb: 2 }}>
            <ChatPanelMessages>
              {!chat.turns.length && !chat.typing ? (
                <Stack spacing={1.5} alignItems="flex-start">
                  <Typography variant="body2" color="text.secondary">{EMPTY_TEXT}</Typography>
                  <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {CHAT_PANEL_SUGGESTIONS.map((q) => <Chip key={q} variant="outlined" clickable label={q} onClick={() => send(q)} sx={{ borderRadius: 1 }} />)}
                  </Stack>
                </Stack>
              ) : null}
              {chat.turns.map((m, i) => (m.role === 'user'
                ? <ChatPanelUserMessage key={i}>{m.text}</ChatPanelUserMessage>
                : <ChatPanelAssistantMessage key={i}>{m.shown === undefined ? m.text : m.text.slice(0, m.shown)}</ChatPanelAssistantMessage>))}
              {chat.typing ? <ChatPanelTyping /> : null}
            </ChatPanelMessages>
            <ChatPanelComposer placeholder={`Pregunta sobre ${record.ob}…`} value={text} onValueChange={setText} onSend={() => send(text)} canSend={!chat.typing && text.trim() !== ''} />
          </ChatPanel>
        </>
      ) : null}
    </Drawer>
  );
}

export interface SincoChatPanelProps {
  filter?: Estado | 'todas';
  /** La obligación abierta al inicio (por id). */
  defaultDetail?: number | null;
  onDetailChange?: (id: number | null) => void;
}

/** La plantilla completa: AppBar, pantalla y cajón de detalle con chat panel. */
export function SincoChatPanel({ filter, defaultDetail = null, onDetailChange }: SincoChatPanelProps) {
  const host = useObligaciones({ filter });
  const [detailId, setDetailId] = React.useState<number | null>(defaultDetail);
  const record = detailId === null ? null : host.rows.find((r) => r.id === detailId) ?? null;
  const setDetail = (id: number | null) => { setDetailId(id); onDetailChange?.(id); };
  return (
    <SincoScreen>
      {/* La pantalla se desplaza sola; el cajón se apoya en el borde de la pantalla, bajo el AppBar. */}
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <SincoPage state={host} askAi={false} onDetail={(r) => setDetail(r.id)} detailId={detailId} />
        <ObligacionDrawer record={record} open={record !== null} onClose={() => setDetail(null)} />
      </Box>
    </SincoScreen>
  );
}
