import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AuiConversationMap, AuiThread } from '../../src/ai/aui';
import { AuiDemoRuntime, type DemoThread } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

/** La conversación del tablero «Conversation map»: el cierre de agosto en nueve turnos. */
const TURNS: Array<[string, string]> = [
  ['Resume el cierre de agosto', 'Bancos conciliados salvo dos movimientos. Anticipos: queda uno pendiente por legalizar. Cuentas por pagar al día y la depreciación del mes ya está contabilizada.'],
  ['¿Cuáles son los dos movimientos sin conciliar?', 'Un abono del 14 de agosto por $1.200.000 sin referencia y una comisión bancaria del 31 por $38.500.'],
  ['¿De quién es el abono?', 'Por el valor y la fecha coincide con la factura FV-0932 de Constructora Andes, que vencía el 12 de agosto.'],
  ['Regístralo contra esa factura', 'Te propongo el registro: débito a Bancos y crédito a Clientes por $1.200.000, aplicado a FV-0932. Confírmalo para aplicarlo.'],
  ['Confirmo', 'Listo, el abono quedó aplicado y FV-0932 aparece como pagada. Solo queda la comisión por clasificar.'],
  ['Clasifícala como gasto bancario', 'Hecho. La comisión quedó en gastos bancarios y agosto está listo para cerrar.'],
  ['¿Qué falta para cerrar el periodo?', 'Legalizar el anticipo CE-4492 de Nubia Rojas y aprobar el comprobante de depreciación. Lo demás está conciliado.'],
  ['Recuérdale a Nubia el anticipo', 'Le envié un recordatorio con la fecha de vencimiento, el 30 de septiembre, y el enlace para cargar los soportes.'],
  ['Genera el informe de cierre', 'Listo el borrador del informe de cierre de agosto con balance, estado de resultados y las notas de conciliación. Revísalo antes de enviarlo a gerencia.'],
];
const CLOSE_THREAD: DemoThread[] = [{
  id: 'cierre-agosto', title: 'Cierre de agosto',
  messages: TURNS.flatMap(([q, a]) => [{ role: 'user' as const, content: q }, { role: 'assistant' as const, content: a }]),
}];

type Side = 'left' | 'right';

/** Lee del riel qué turno está activo y cuáles se ven, para mostrarlo en Properties. */
function useRailReadout(root: React.RefObject<HTMLElement>) {
  const [readout, setReadout] = React.useState({ active: '', visible: '' });
  React.useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const read = () => {
      const ticks = [...el.querySelectorAll<HTMLElement>('[data-slot="aui-conversation-map-tick"]')];
      const label = (i: number) => `"turno-${i + 1}"`;
      const active = ticks.findIndex((t) => t.getAttribute('aria-current') === 'true');
      const visible = ticks.flatMap((t, i) => (t.querySelector('[data-in-view]') ? [label(i)] : []));
      setReadout({ active: active >= 0 ? label(active) : '—', visible: `[${visible.join(', ')}]` });
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(el, { subtree: true, attributes: true, childList: true, attributeFilter: ['aria-current', 'data-in-view'] });
    return () => observer.disconnect();
  }, [root]);
  return readout;
}

function MapThread({ side, height }: { side: Side; height: number | string }) {
  return (
    <AuiDemoRuntime threads={CLOSE_THREAD} startIn="cierre-agosto">
      <Box sx={{ height, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
        <AuiThread autoFocus={false} conversationMap={side} />
      </Box>
    </AuiDemoRuntime>
  );
}

export function AuiConversationMapDoc() {
  const [side, setSide] = React.useState<Side>('left');
  const ref = React.useRef<HTMLDivElement>(null);
  const { active, visible } = useRailReadout(ref);
  const mono = (t: import('@mui/material/styles').Theme) => ({ ...t.aiKit.code });
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={<Box ref={ref} sx={{ height: '100%', p: 2.5, boxSizing: 'border-box' }}><MapThread side={side} height="100%" /></Box>}
        properties={
          <>
            <PropRow label="side"><PropToggle<Side> label="side" value={side} onChange={setSide} options={[['left', 'left'], ['right', 'right']]} /></PropRow>
            <PropRow label="activeId"><Typography variant="body3" color="text.secondary" sx={mono}>{active}</Typography></PropRow>
            <PropRow label="visibleIds"><Typography variant="body3" color="text.secondary" sx={mono}>{visible}</Typography></PropRow>
          </>
        }
      />
    </Box>
  );
}

const CARD_ENTRIES = TURNS.map(([q, a], i) => ({ id: `turno-${i + 1}`, title: q, preview: a }));
const CARD_STEP = 1400;

/** La tarjeta recorre el hilo: el turno leído avanza y con él los visibles. */
export function AuiConversationMapCard() {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => { const id = window.setInterval(() => setActive((a) => (a + 1) % TURNS.length), CARD_STEP); return () => window.clearInterval(id); }, []);
  const entry = CARD_ENTRIES[active];
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ height: 180 }}>
      <AuiConversationMap entries={CARD_ENTRIES} activeId={entry.id} visibleIds={[entry.id, CARD_ENTRIES[active + 1]?.id].filter(Boolean) as string[]} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2">{entry.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{entry.preview}</Typography>
      </Box>
    </Stack>
  );
}
