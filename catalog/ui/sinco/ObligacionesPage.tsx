// La plantilla «Obligaciones · Composer flotante»: la pantalla completa de Obligaciones por pagar de Sinco, como en el
// lienzo. AppBar denso con el módulo, la organización y la empresa; Obligaciones / Extractos; pestañas Compras,
// Anticipos y Devoluciones con la barra de selección; filtros por estado, la columna «Saldo por pagar» y «Nueva compra»;
// la tabla con soporte, proveedor, fechas, medio de pago, total, estado y acciones rápidas; paginación y avisos.
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import {
  ArrowLeftRight, Banknote, Check, ChevronDown, CircleDollarSign, CreditCard, Eye, FileText, Grip, History, Info, Plus, ReceiptText, Undo2, Wallet,
} from 'lucide-react';
import { visuallyHidden } from '@mui/utils';
import { EstadoChip, FilterChip, SelectionBar } from './parts';
import { BLOQUEO, NEXT, flashIn, money, nObl, type Estado, type MedioPago, type Obligacion, type ObligacionesState } from './obligaciones';
import { SincoLogo } from './SincoLogo';

const ESTADOS: Array<{ k: Estado | 'todas'; label: string }> = [
  { k: 'todas', label: 'Todas' }, { k: 'borrador', label: 'Borradores' }, { k: 'pendiente', label: 'Pendientes' }, { k: 'rechazada', label: 'Rechazadas' },
  { k: 'confirmada', label: 'Confirmadas' }, { k: 'causada', label: 'Causadas' }, { k: 'pagada', label: 'Pagadas' }, { k: 'descartado', label: 'Descartadas' },
];
const VACIOS: Record<Estado | 'todas', [string, string]> = {
  borrador: ['No tienes obligaciones en borrador', 'Aquí encontrarás las obligaciones que hayas guardado con información pendiente por completar.'],
  pendiente: ['Todo al día por ahora', 'No tienes obligaciones pendientes. Cuando haya una nueva, aparecerá aquí para que puedas gestionarla.'],
  rechazada: ['No tienes obligaciones devueltas', 'Si alguna obligación requiere ajustes y es rechazada, aparecerá aquí para que puedas revisarla.'],
  confirmada: ['Aún no hay obligaciones confirmadas', 'Las obligaciones aparecerán aquí a medida que sean confirmadas.'],
  causada: ['Aún no hay obligaciones causadas', 'Las obligaciones aparecerán aquí cuando sean causadas.'],
  pagada: ['Aún no hay obligaciones pagadas', 'Las obligaciones aparecerán aquí cuando el pago quede aplicado.'],
  descartado: ['No tienes obligaciones descartadas', 'Aquí quedarán las obligaciones que descartes, para consulta.'],
  todas: ['Sin obligaciones registradas', 'Cuando radiques una compra, aparecerá en esta lista.'],
};
const TABS = [['compras', 'Compras'], ['anticipos', 'Anticipos'], ['devoluciones', 'Devoluciones']] as const;
type TabKey = (typeof TABS)[number][0];

/** Medidas del tablero: AppBar denso de 48px, íconos de 16px, marca de medio de pago de 24 × 16, avatar de 28px. */
export const SINCO_APPBAR = 6;
const ICON = 16;
const SMALL_ICON = 14;
const PAYMARK = { w: 3, h: 2 };
const AVATAR = 3.5;
const ROWS_PER_PAGE = [10, 25, 50];
/** Por debajo de este ancho del contenedor (no de la ventana: la plantilla vive en el marco del playground), el AppBar
 * deja solo el módulo. */
const NARROW = '@container (max-width: 599px)';

/** El AppBar de la aplicación: el módulo, la organización y la empresa. */
export function SincoAppBar({ module = 'Obligaciones por pagar', compact = false }: { module?: string; compact?: boolean }) {
  return (
    <Stack
      component="header"
      direction="row"
      alignItems="center"
      spacing={1}
      sx={(t) => ({ position: 'relative', zIndex: t.zIndex.appBar, flexShrink: 0, height: t.spacing(SINCO_APPBAR), px: 3, bgcolor: 'background.paper', boxShadow: t.shadows[4] })}
    >
      <IconButton size="small" aria-label="Aplicaciones" sx={{ ml: -1 }}><Grip size={20} /></IconButton>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', flexShrink: 0 }}><SincoLogo /></Box>
        <Typography variant="h6" component="span" noWrap sx={{ '&::before': { content: '"· "', color: 'text.disabled' } }}>{module}</Typography>
      </Stack>
      {compact ? null : <Button size="small" endIcon={<ChevronDown size={ICON} />} aria-haspopup="menu" sx={{ textTransform: 'none', flexShrink: 0, [NARROW]: { display: 'none' } }}>Administración</Button>}
      <Box sx={{ flex: 1 }} />
      {compact ? null : <Typography variant="body2" color="text.secondary" noWrap sx={{ [NARROW]: { display: 'none' } }}>Empresa de insumos S.A.S</Typography>}
      <Avatar sx={(t) => ({ width: t.spacing(AVATAR), height: t.spacing(AVATAR), flexShrink: 0 })} alt="" />
    </Stack>
  );
}

function PayMethod({ mp }: { mp: MedioPago }) {
  const Icon = mp.icon === 'transfer' ? ArrowLeftRight : mp.icon === 'cash' ? Banknote : mp.icon === 'other' ? CircleDollarSign : null;
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {Icon ? <Box component={Icon} sx={{ width: ICON, height: ICON, color: 'action.active', flexShrink: 0 }} /> : (
        <Box
          component="span"
          sx={(t) => ({ ...t.typography.overline, fontSize: t.spacing(0.75), lineHeight: 1, letterSpacing: 0, fontWeight: t.typography.fontWeightBold, width: t.spacing(PAYMARK.w), height: t.spacing(PAYMARK.h), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0.5, border: 1, borderColor: 'divider', bgcolor: 'action.hover', color: 'text.secondary' })}
        >
          {mp.brand}
        </Box>
      )}
      <Box>
        <Typography variant="body2" noWrap>{mp.t}</Typography>
        {mp.d ? (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {mp.d}{mp.mask ? <Box component={Eye} sx={{ width: SMALL_ICON - 2, height: SMALL_ICON - 2 }} /> : null}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}

function SaldoCell({ r }: { r: Obligacion }) {
  const sd = r.saldo ?? { tipo: 'na' };
  const off = (text: string) => <Typography variant="caption" color="text.disabled">{text}</Typography>;
  if (sd.tipo === 'extracto') return r.est === 'pagada' ? <Link component="button" variant="caption" underline="hover" sx={{ fontWeight: 'fontWeightMedium' }}>Ver extracto</Link> : off('Pago por extracto');
  if (sd.tipo === 'na') return off('-');
  return (
    <Stack alignItems="flex-end">
      {sd.valor !== undefined ? <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>{money(sd.valor)} <Typography component="span" variant="caption" color="text.secondary">{r.cur}</Typography></Typography> : null}
      {sd.tipo === 'abonos' ? <Link component="button" variant="caption" underline="hover" sx={{ fontWeight: 'fontWeightMedium' }}>{sd.n} abonos</Link> : off('Sin abonos')}
    </Stack>
  );
}

type QuickAction = { label: string; icon: React.ElementType; run: () => void };

export interface ObligacionesPageProps {
  state: ObligacionesState;
  /** La acción «Preguntar a la IA» en la barra de selección. Default true. */
  askAi?: boolean;
  /** Tocar el nombre del proveedor abre el detalle de la fila (la plantilla con chat panel). Sin él, solo avisa. */
  onDetail?: (row: Obligacion) => void;
  /** La fila cuyo detalle está abierto: se ve seleccionada. */
  detailId?: number | null;
}

/** El contenido de la pantalla (bajo el AppBar). */
export function ObligacionesPage({ state: s, askAi = true, onDetail, detailId = null }: ObligacionesPageProps) {
  const [seg, setSeg] = React.useState<'obl' | 'ext'>('obl');
  const [tab, setTab] = React.useState<TabKey>('compras');
  const [saldo, setSaldo] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rpp, setRpp] = React.useState(25);
  const [notice, setNotice] = React.useState<string | null>(null);
  React.useEffect(() => { setPage(0); }, [s.filter]);
  const counts = React.useMemo(() => {
    const c: Record<string, number> = { todas: s.rows.length };
    s.rows.forEach((r) => { c[r.est] = (c[r.est] ?? 0) + 1; });
    return c;
  }, [s.rows]);
  const all = s.filter === 'todas' ? s.rows : s.rows.filter((r) => r.est === s.filter);
  const visible = all.slice(page * rpp, page * rpp + rpp);
  const selectable = all.filter((r) => !r.bloqueo);
  const nSel = s.selRows.length;
  const total = s.selRows.reduce((a, r) => a + r.total, 0);
  const allOn = nSel > 0 && nSel === selectable.length;
  const toggle = (id: number) => { const n = new Set(s.selected); if (n.has(id)) n.delete(id); else n.add(id); s.setSelected(n); };
  const actionsFor = (r: Obligacion): QuickAction[] => {
    const hist = { label: 'Historial', icon: History, run: () => setNotice(`Historial de ${r.ob}.`) };
    const devolver = { label: 'Devolver compra', icon: Undo2, run: () => setNotice(`Devolución de ${r.ob}: el flujo vive en Devoluciones.`) };
    if (r.est === 'pendiente') return r.bloqueo ? [hist] : [hist, { label: 'Confirmar', icon: Check, run: () => s.setEst([r.id], 'confirmada', `${r.ob} quedó confirmada.`) }];
    if (r.est === 'confirmada') return [devolver, hist, { label: 'Causar', icon: Check, run: () => s.setEst([r.id], 'causada', `${r.ob} quedó causada.`) }];
    if (r.est === 'causada' || r.est === 'pagada') return [devolver, hist];
    return [];
  };
  const empty = VACIOS[s.filter];
  return (
    <Box sx={{ flex: '1 0 auto', bgcolor: 'background.default', pb: 3 }}>
      <Stack alignItems="center" sx={{ py: 2 }}>
        <ToggleButtonGroup size="small" color="primary" exclusive value={seg} onChange={(_e, v) => { if (v) { setSeg(v); s.setSelected(new Set()); } }} aria-label="Módulo" sx={{ bgcolor: 'background.paper' }}>
          <ToggleButton value="obl" sx={{ gap: 1, textTransform: 'none' }}><ReceiptText size={ICON} />Obligaciones</ToggleButton>
          <ToggleButton value="ext" sx={{ gap: 1, textTransform: 'none' }}><CreditCard size={ICON} />Extractos</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Box sx={{ px: 3 }}>
        <Paper sx={{ overflow: 'hidden' }}>
          {seg === 'ext' ? (
            <Empty title="Extractos no está en este anfitrión" text="El anfitrión de los templates es Obligaciones · Compras. La conciliación de extractos vive en su propio artefacto." />
          ) : (
            <>
              <Stack direction="row" alignItems="center" sx={{ borderBottom: 1, borderColor: 'divider', pr: 1, minHeight: 48 }}>
                <Tabs value={tab} onChange={(_e, v: TabKey) => { setTab(v); s.setSelected(new Set()); }} aria-label="Tipo de obligación">
                  {TABS.map(([k, label]) => <Tab key={k} value={k} label={label} sx={{ textTransform: 'none', minWidth: 90 }} />)}
                </Tabs>
                <Box sx={{ flex: 1 }} />
                {tab === 'compras' && nSel > 0 ? (
                  <SelectionBar
                    count={nSel}
                    total={total}
                    askAi={askAi}
                    action={<Button size="small" variant="contained" onClick={() => s.kind && s.setEst(s.selRows.map((r) => r.id), NEXT[s.kind], `${nObl(nSel)} ${s.kind === 'Confirmar' ? 'confirmada' : 'causada'}${nSel === 1 ? '.' : 's.'}`)}>{s.kind}</Button>}
                  />
                ) : null}
              </Stack>
              {tab !== 'compras' ? (
                <Empty title={`${tab === 'anticipos' ? 'Anticipos' : 'Devoluciones'} no está en este anfitrión`} text="Este anfitrión trae solo la pestaña Compras del artefacto Obligaciones por pagar." />
              ) : (
                <>
                  <Stack direction="row" useFlexGap flexWrap="wrap" alignItems="flex-start" spacing={1} sx={{ px: 2, py: 1.5 }}>
                    <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} role="group" aria-label="Filtrar por estado">
                      {ESTADOS.map((e) => {
                        const on = s.filter === e.k;
                        return (
                          <FilterChip
                            key={e.k}
                            on={on}
                            label={<>{e.label} <Box component="span" sx={{ color: on ? 'primary.main' : 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{counts[e.k] ?? 0}</Box></>}
                            onClick={() => s.setFilter(e.k)}
                          />
                        );
                      })}
                    </Stack>
                    <FilterChip on={saldo} icon={<Wallet size={ICON} />} label="Saldo por pagar" onClick={() => setSaldo((v) => !v)} sx={{ ml: 'auto !important' }} />
                    <Button size="small" startIcon={<Plus size={ICON} />} onClick={() => setNotice('El formulario de radicación vive en el flujo de Registro.')} sx={{ textTransform: 'none' }}>Nueva compra</Button>
                  </Stack>
                  {visible.length === 0 ? <Empty title={empty[0]} text={empty[1]} /> : (
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table size="small" aria-label="Obligaciones" sx={{ minWidth: 1020, '& td, & th': { whiteSpace: 'nowrap' }, '& tbody tr:hover [data-slot="quick-actions"], & tbody tr:focus-within [data-slot="quick-actions"]': { opacity: 1 } }}>
                        <TableHead>
                          <TableRow>
                            {s.kind ? <TableCell padding="checkbox"><Checkbox size="small" checked={allOn} indeterminate={nSel > 0 && !allOn} onChange={() => s.setSelected(allOn ? new Set() : new Set(selectable.map((r) => r.id)))} inputProps={{ 'aria-label': 'Seleccionar todo' }} /></TableCell> : null}
                            <TableCell padding="checkbox"><Box component="span" sx={visuallyHidden}>Soporte</Box></TableCell>
                            <TableCell>Proveedor</TableCell>
                            <TableCell>Fecha compra</TableCell>
                            <TableCell>N.º de obligación</TableCell>
                            <TableCell>Medio de pago</TableCell>
                            <TableCell align="right">Total / Moneda</TableCell>
                            {saldo ? <TableCell align="right">Saldo por pagar</TableCell> : null}
                            <TableCell>Fecha registro</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell><Box component="span" sx={visuallyHidden}>Acciones</Box></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visible.map((r) => {
                            const sel = (s.selected.has(r.id) && !!s.kind) || r.id === detailId;
                            return (
                              <TableRow key={r.id} hover selected={sel} sx={(t) => (s.flash.has(r.id) ? { '--flash': alpha(t.palette.primary.main, t.palette.action.focusOpacity), animation: `${flashIn} 1.6s ease-out` } : {})}>
                                {s.kind ? (
                                  <TableCell padding="checkbox">
                                    {r.bloqueo ? (
                                      <Tooltip title={BLOQUEO}><span><Checkbox size="small" disabled inputProps={{ 'aria-label': 'No puedes confirmar esta obligación' }} /></span></Tooltip>
                                    ) : <Checkbox size="small" checked={sel} onChange={() => toggle(r.id)} inputProps={{ 'aria-label': `Seleccionar ${r.ob}` }} />}
                                  </TableCell>
                                ) : null}
                                <TableCell padding="checkbox">
                                  <Tooltip title="Ver soporte"><IconButton size="small" color="primary" aria-label="Ver documento soporte" onClick={() => setNotice(`Soporte de ${r.ob}.`)}><FileText size={ICON} /></IconButton></Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Link component="button" variant="body2" underline="hover" color="text.primary" onClick={() => (onDetail ? onDetail(r) : setNotice(`Detalle de ${r.prov} · ${r.ob}.`))} sx={(t) => ({ display: 'block', fontWeight: t.typography.fontWeightMedium, maxWidth: t.spacing(25), overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'start', '&:hover': { color: 'primary.main' } })}>{r.prov}</Link>
                                  <Typography variant="caption" color="text.secondary">{r.nit}</Typography>
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{r.fc}</TableCell>
                                <TableCell>
                                  <Typography variant="body2">{r.ob}</Typography>
                                  {r.soporte ? (
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: r.soporte.dias <= 1 ? 'error.main' : r.soporte.dias <= 4 ? 'warning.dark' : 'text.secondary' }}>
                                      Doc. soporte · {r.soporte.txt}<Info size={SMALL_ICON - 2} />
                                    </Typography>
                                  ) : null}
                                </TableCell>
                                <TableCell>{r.mp ? <PayMethod mp={r.mp} /> : null}</TableCell>
                                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{money(r.total)} <Typography component="span" variant="caption" color="text.secondary">{r.cur}</Typography></TableCell>
                                {saldo ? <TableCell align="right"><SaldoCell r={r} /></TableCell> : null}
                                <TableCell sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{r.fr}</TableCell>
                                <TableCell>
                                  <EstadoChip estado={r.est} motivo={r.motivo} />
                                </TableCell>
                                <TableCell align="right" sx={{ pr: 1 }}>
                                  <Stack direction="row" justifyContent="flex-end" data-slot="quick-actions" sx={(t) => ({ opacity: 0, transition: t.transitions.create('opacity', { duration: t.transitions.duration.shortest }) })}>
                                    {actionsFor(r).map((a) => (
                                      <Tooltip key={a.label} title={a.label}><IconButton size="small" aria-label={a.label} onClick={a.run}><a.icon size={ICON} /></IconButton></Tooltip>
                                    ))}
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Box>
                  )}
                  <TablePagination
                    component="div"
                    count={all.length}
                    page={Math.min(page, Math.max(0, Math.ceil(all.length / rpp) - 1))}
                    onPageChange={(_e, p) => setPage(p)}
                    rowsPerPage={rpp}
                    rowsPerPageOptions={ROWS_PER_PAGE}
                    onRowsPerPageChange={(e) => { setRpp(Number(e.target.value)); setPage(0); }}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                    getItemAriaLabel={(type) => (type === 'previous' ? 'Página anterior' : type === 'next' ? 'Página siguiente' : type === 'first' ? 'Primera página' : 'Última página')}
                    data-slot="table-pagination"
                  />
                </>
              )}
            </>
          )}
        </Paper>
      </Box>
      <Snackbar
        open={!!s.snack || !!notice}
        autoHideDuration={s.snack?.undo ? 6000 : 3200}
        onClose={() => { s.setSnack(null); setNotice(null); }}
        message={s.snack?.text ?? notice}
        action={s.snack?.undo ? <Button color="inherit" size="small" onClick={s.undo}>Deshacer</Button> : undefined}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ position: 'absolute' }}
      />
    </Box>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <Stack alignItems="center" spacing={1} sx={{ py: 8, px: 3, textAlign: 'center' }}>
      <Typography variant="h6" component="h2">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>{text}</Typography>
    </Stack>
  );
}
