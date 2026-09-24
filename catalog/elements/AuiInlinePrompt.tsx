import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { ChartColumn, FileSearch, PencilLine, Sparkles, Text } from 'lucide-react';
import { AuiInlinePrompt, AuiInlinePromptAnchor, type AuiInlinePromptAction } from '../../src/ai/aui';
import { DEMO_ATTACHMENTS, demoDictation } from '../ui/AuiDemoRuntime';
import { lastUserText, textModel } from '../ui/demoStream';
import { EstadoChip } from '../ui/sinco/parts';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

type Mode = 'hover' | 'selection' | 'record';
type Key = 'concepto' | 'valor' | 'vence' | 'cc' | 'soporte' | 'record';
const ROWS: Array<{ key: Exclude<Key, 'record'>; k: string; v: string; link?: boolean }> = [
  { key: 'concepto', k: 'Concepto', v: 'Materiales de obra, torre 2' },
  { key: 'valor', k: 'Valor', v: '$ 2.400.000' },
  { key: 'vence', k: 'Vence', v: '15 oct 2026' },
  { key: 'cc', k: 'Centro de costo', v: 'CC-210 · Obra Torre 2' },
  { key: 'soporte', k: 'Soporte', v: 'FV-0932.pdf', link: true },
];
const ICON = 20;
const FIELD_ACTIONS: AuiInlinePromptAction[] = [
  { title: 'Explicar este valor', icon: <Sparkles size={ICON} /> }, { title: 'Buscar el soporte', icon: <FileSearch size={ICON} /> },
  { title: 'Comparar con el mes anterior', icon: <ChartColumn size={ICON} /> }, { title: 'Redactar una nota', icon: <PencilLine size={ICON} /> },
];
const RECORD_ACTIONS: AuiInlinePromptAction[] = [{ title: 'Resumir esta factura', icon: <Text size={ICON} /> }, ...FIELD_ACTIONS.slice(1)];
const ANSWERS: Record<Key, string> = {
  concepto: 'Son materiales de obra (cemento, varilla y bloque) para la torre 2, según la orden de compra OC-1188.',
  valor: '$ 2.400.000 es el valor total de la factura FV-0932 con IVA incluido. Coincide con la orden de compra OC-1188.',
  vence: 'Vence el 15 oct 2026: 30 días desde la emisión, el plazo pactado con Ferretería El Roble.',
  cc: 'CC-210 agrupa los costos de la obra Torre 2; esta factura suma al rubro de materiales.',
  soporte: 'FV-0932.pdf es la factura electrónica del proveedor; ya está validada ante la DIAN.',
  record: 'FV-0932 de Ferretería El Roble: $ 2.400.000 por materiales de la torre 2, centro de costo CC-210. Está pendiente y vence el 15 oct 2026.',
};
const ACTION_ANSWERS: Record<string, string> = {
  'Buscar el soporte': 'El soporte es FV-0932.pdf, cargado el 16 sep 2026 por Nubia Rojas, con la firma de recibido de almacén.',
  'Comparar con el mes anterior': 'En agosto Ferretería El Roble facturó $ 2.150.000; este mes sube $ 250.000 (11,6 %) por el cemento de la torre 2.',
  'Redactar una nota': 'Nota sugerida: «FV-0932 validada contra OC-1188; lista para causar antes del 15 oct 2026».',
};
const instructionFor = (key: Key) => (key === 'record'
  ? 'El usuario pregunta por la factura FV-0932 de Ferretería El Roble: <campo>record</campo>'
  : `El usuario pregunta por el campo ${ROWS.find((r) => r.key === key)?.k} de la factura FV-0932: <campo>${key}</campo>`);

/** Responde según el campo (que llega en el contexto) y la acción elegida. */
const MODEL = textModel(({ messages, context }) => ACTION_ANSWERS[lastUserText(messages).trim()] ?? ANSWERS[(context?.system?.match(/<campo>(\w+)<\/campo>/)?.[1] ?? 'valor') as Key]);
const ADAPTERS = { attachments: DEMO_ATTACHMENTS, dictation: demoDictation('¿Por qué subió este valor?') };

function Prompt({ id, open, onOpen }: { id: Key; open: boolean; onOpen: (k: Key | null) => void }) {
  return (
    <AuiInlinePrompt
      adapter={MODEL}
      adapters={ADAPTERS}
      instruction={instructionFor(id)}
      actions={id === 'record' ? RECORD_ACTIONS : FIELD_ACTIONS}
      placeholder={id === 'record' ? 'Pregunta sobre esta factura…' : 'Pregunta sobre este campo…'}
      open={open}
      onOpenChange={(o) => onOpen(o ? id : null)}
    />
  );
}

/** La factura del tablero: encabezado con el estado y los campos, cada uno con su disparador. */
function Record({ mode, sel, onSelect, openKey, onOpen, only }: { mode: Mode; sel: Key; onSelect: (k: Key) => void; openKey: Key | null; onOpen: (k: Key | null) => void; only?: Exclude<Key, 'record'> }) {
  const rec = mode === 'record';
  const rows = only ? ROWS.filter((r) => r.key === only) : ROWS;
  return (
    <Paper variant="outlined" data-slot="record" sx={(t) => ({ overflow: 'hidden', ...(rec && { borderColor: 'primary.main', boxShadow: `0 0 0 1px ${t.palette.primary.main}` }) })}>
      {only ? null : (
        <AuiInlinePromptAnchor show={rec ? 'always' : 'none'} sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 1.5, height: t.spacing(8), pl: 2, pr: 1.5, borderBottom: 1, borderColor: 'divider' })}>
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>Factura FV-0932 · Ferretería El Roble</Typography>
            <Typography variant="caption" color="text.secondary">NIT 900.412.387-1 · Cuentas por pagar</Typography>
          </Stack>
          <EstadoChip estado="pendiente" />
          <Prompt id="record" open={openKey === 'record'} onOpen={onOpen} />
        </AuiInlinePromptAnchor>
      )}
      <Box sx={{ py: 0.5 }}>
        {rows.map((r) => {
          const selected = mode === 'selection' && sel === r.key;
          return (
            <AuiInlinePromptAnchor
              key={r.key}
              show={only ? 'always' : rec ? 'none' : mode === 'hover' ? 'hover' : selected ? 'always' : 'none'}
              onClick={() => { if (mode === 'selection' && sel !== r.key) { onOpen(null); onSelect(r.key); } }}
              aria-selected={mode === 'selection' ? selected : undefined}
              sx={(t) => ({
                display: 'flex', alignItems: 'center', gap: 2, height: t.spacing(5.5), pl: 2, pr: 1.5,
                transition: t.transitions.create('background-color', { duration: t.transitions.duration.shorter }),
                ...(mode === 'selection' && { cursor: 'pointer' }),
                ...(mode !== 'record' && { '&:hover': { bgcolor: 'action.hover' } }),
                ...((selected || (mode === 'hover' && openKey === r.key)) && { bgcolor: selected ? alpha(t.palette.primary.main, t.palette.action.selectedOpacity) : 'action.hover' }),
              })}
            >
              <Typography variant="body2" color="text.secondary" sx={(t) => ({ width: t.spacing(16), flexShrink: 0 })}>{r.k}</Typography>
              <Typography variant="body1" noWrap color={r.link ? 'primary' : 'text.primary'} sx={{ flex: 1, minWidth: 0, fontVariantNumeric: 'tabular-nums' }}>{r.v}</Typography>
              <Prompt id={r.key} open={openKey === r.key} onOpen={onOpen} />
            </AuiInlinePromptAnchor>
          );
        })}
      </Box>
    </Paper>
  );
}

export function AuiInlinePromptDoc() {
  const [mode, setMode] = React.useState<Mode>('hover');
  const [sel, setSel] = React.useState<Key>('valor');
  const [openKey, setOpenKey] = React.useState<Key | null>(null);
  const [reset, setReset] = React.useState(0);
  const target: Key = mode === 'record' ? 'record' : mode === 'selection' ? sel : 'valor';
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={
          <Box sx={{ height: '100%', p: 3, boxSizing: 'border-box', bgcolor: 'ai.surfaceMuted' }}>
            <Record key={reset} mode={mode} sel={sel} onSelect={setSel} openKey={openKey} onOpen={setOpenKey} />
          </Box>
        }
        properties={
          <>
            <PropRow label="trigger"><PropToggle<Mode> label="trigger" value={mode} onChange={(m) => { setOpenKey(null); setMode(m); }} options={[['hover', 'Hover row'], ['selection', 'Selected row'], ['record', 'Whole record']]} /></PropRow>
            <PropRow label="open"><PropToggle label="open" value={openKey ? 'true' : 'false'} onChange={(v) => setOpenKey(v === 'true' ? target : null)} options={[['false', 'false'], ['true', 'true']]} /></PropRow>
            <PropRow label="Try it"><Button variant="outlined" onClick={() => { setOpenKey(null); setMode('hover'); setSel('valor'); setReset((n) => n + 1); }}>Reset</Button></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AuiInlinePromptCard() {
  const [openKey, setOpenKey] = React.useState<Key | null>(null);
  return <Record mode="hover" sel="valor" onSelect={() => undefined} openKey={openKey} onOpen={setOpenKey} only="valor" />;
}
