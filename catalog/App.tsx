import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import ButtonBase from '@mui/material/ButtonBase';
import { Sun, Moon, ChevronRight, Search } from 'lucide-react';
import { CosmosProvider } from '../src/CosmosProvider';
import { SECTIONS, findElement } from './registry';
import type { ElementEntry, Section } from './registry';
import { McpAuthorizePage, McpCallbackPage } from './elements/AuiMcpConfig';
import { DesignPage } from './DesignPage';
import { PlaygroundPage } from './playground/Playground';

type Mode = 'light' | 'dark';
const load = (): Mode => { try { return localStorage.getItem('cds-mode') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } };

function useHash() {
  const get = () => (window.location.hash.replace(/^#/, '') || '/elements');
  const [h, setH] = React.useState(get);
  React.useEffect(() => { const on = () => { setH(get()); window.scrollTo(0, 0); }; window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on); }, []);
  return h;
}
const go = (path: string) => { window.location.hash = path; };

export function App() {
  const [mode, setMode] = React.useState<Mode>(load);
  const path = useHash();
  const toggle = () => { const m: Mode = mode === 'light' ? 'dark' : 'light'; setMode(m); try { localStorage.setItem('cds-mode', m); } catch { /* sin storage */ } };
  return (
    <CosmosProvider mode={mode}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.paper', color: 'text.primary' }}>
        <TopBar mode={mode} onToggle={toggle} path={path} />
        {path.split('/')[1] === 'playground' ? (
          // El playground ocupa todo el ancho bajo la barra, sin la barra lateral del catálogo.
          <Box component="main" sx={{ height: 'calc(100vh - 56px)' }}><PlaygroundPage /></Box>
        ) : (
          <Box sx={{ display: 'flex', maxWidth: 1360, mx: 'auto' }}>
            <Sidebar path={path} />
            <Box component="main" sx={{ flex: 1, minWidth: 0, px: { xs: 2, md: 6 }, py: 5 }}>
              <Route path={path} />
            </Box>
          </Box>
        )}
      </Box>
    </CosmosProvider>
  );
}

function TopBar({ mode, onToggle, path }: { mode: Mode; onToggle: () => void; path: string }) {
  const onDesign = path.split('/')[1] === 'design';
  const onPlayground = path.split('/')[1] === 'playground';
  return (
    <Stack direction="row" alignItems="center" sx={{ position: 'sticky', top: 0, zIndex: 10, height: 56, px: 3, gap: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <ButtonBase onClick={() => go('/elements')} sx={{ gap: 1, borderRadius: 1 }}>
        <Box sx={(t) => ({ width: 22, height: 22, borderRadius: '6px', background: `linear-gradient(135deg, ${t.palette.ai.markStart}, ${t.palette.ai.markEnd})` })} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Cosmos DS</Typography>
        <Typography variant="caption" color="text.secondary">MUI · Kit IA</Typography>
      </ButtonBase>
      <ButtonBase onClick={() => go('/design')} sx={{
        px: 1, py: 0.5, borderRadius: 1, typography: 'body2', color: onDesign ? 'primary.main' : 'text.secondary',
        fontWeight: onDesign ? 'fontWeightMedium' : 'fontWeightRegular', '&:hover': { color: 'text.primary' },
      }}>
        Diseño
      </ButtonBase>
      <ButtonBase onClick={() => go('/playground')} sx={{
        px: 1, py: 0.5, borderRadius: 1, typography: 'body2', color: onPlayground ? 'primary.main' : 'text.secondary',
        fontWeight: onPlayground ? 'fontWeightMedium' : 'fontWeightRegular', '&:hover': { color: 'text.primary' },
      }}>
        Playground
      </ButtonBase>
      <Box sx={{ flex: 1 }} />
      <Tooltip title={mode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
        <IconButton size="small" onClick={onToggle} aria-label="Cambiar modo">{mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}</IconButton>
      </Tooltip>
    </Stack>
  );
}

function NavItem({ label, href, active }: { label: string; href: string; active?: boolean }) {
  return (
    <ButtonBase onClick={() => go(href)} sx={{
      width: '100%', justifyContent: 'flex-start', textAlign: 'left', px: 1.5, py: 0.75, borderRadius: 1, typography: 'body2',
      color: active ? 'primary.main' : 'text.secondary', bgcolor: active ? 'action.selected' : 'transparent',
      fontWeight: active ? 500 : 400, '&:hover': { bgcolor: active ? 'action.selected' : 'action.hover', color: active ? 'primary.main' : 'text.primary' },
    }}>{label}</ButtonBase>
  );
}
function NavGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="caption" sx={{ display: 'block', px: 1.5, mb: 0.5, fontWeight: 600, color: 'text.primary' }}>{title}</Typography>
      {children}
    </Box>
  );
}
/** Cuántos elementos hay en total, para el contador junto a «Elements» (como en assistant-ui/elements). */
const TOTAL_ELEMENTS = SECTIONS.reduce((n, s) => n + s.elements.length, 0);

function SidebarSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Box sx={{ px: 1.5, mb: 1 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 1.5, py: 0.75, borderRadius: 1, bgcolor: 'action.hover', color: 'text.secondary', '&:focus-within': { bgcolor: 'action.selected' } }}
      >
        <Search size={16} aria-hidden="true" />
        <InputBase
          fullWidth
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar"
          inputProps={{ 'aria-label': 'Buscar elementos' }}
          sx={{ typography: 'body2', color: 'text.primary' }}
        />
      </Stack>
    </Box>
  );
}

function Sidebar({ path }: { path: string }) {
  const [filter, setFilter] = React.useState('');
  const query = filter.trim().toLowerCase();
  const groups = query
    ? SECTIONS.map((s) => ({ ...s, elements: s.elements.filter((e) => e.title.toLowerCase().includes(query)) })).filter((s) => s.elements.length > 0)
    : SECTIONS;
  return (
    <Box component="nav" sx={{ display: { xs: 'none', md: 'block' }, width: 248, flexShrink: 0, position: 'sticky', top: 56, alignSelf: 'flex-start', height: 'calc(100vh - 56px)', overflowY: 'auto', py: 4, px: 2, borderRight: 1, borderColor: 'divider' }}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ px: 1.5, mb: 1 }}>
        <ButtonBase onClick={() => go('/elements')} sx={{ typography: 'caption', fontWeight: 600, color: 'text.primary', borderRadius: 0.5 }}>Elements</ButtonBase>
        <Typography variant="caption" color="text.secondary">{TOTAL_ELEMENTS}</Typography>
      </Stack>
      <SidebarSearch value={filter} onChange={setFilter} />
      {groups.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 1.5 }}>Ningún elemento coincide.</Typography>
      ) : (
        groups.map((s) => (
          <NavGroup key={s.id} title={s.title}>
            {s.elements.map((e) => <NavItem key={e.slug} label={e.title} href={'/elements/' + e.slug} active={path === '/elements/' + e.slug} />)}
          </NavGroup>
        ))
      )}
    </Box>
  );
}

function Route({ path }: { path: string }) {
  const [, root, slug] = path.split('/');
  if (root === 'mcp-autorizar') return <McpAuthorizePage />;
  if (root === 'mcp-callback') return <McpCallbackPage />;
  if (root === 'design') return <DesignPage />;
  if (root === 'elements' && slug) {
    const hit = findElement(slug);
    if (hit) return <ElementDetail section={hit.section} element={hit.element} />;
  }
  return <ElementsIndex />;
}

function PageHead({ overline, title, description, maxWidth = 880, children }: { overline?: string; title: string; description: string; maxWidth?: number; children: React.ReactNode }) {
  return (
    <Box sx={{ maxWidth }}>
      {overline ? <Typography variant="overline" sx={{ color: 'primary.main' }}>{overline}</Typography> : null}
      <Typography component="h1" variant="h4" sx={{ mb: 1 }}>{title}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 680 }}>{description}</Typography>
      {children}
    </Box>
  );
}

function ElementsIndex() {
  return (
    <PageHead maxWidth={1040} title="Elements" description="Componentes del asistente, construidos con MUI y el tema Cosmos. Cada tarjeta es una demo en vivo.">
      {SECTIONS.map((s) => (
        <Box key={s.id} component="section" sx={{ mb: 6 }}>
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>{s.title}</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
            {s.elements.map((e) => <ElementCard key={e.slug} element={e} />)}
          </Box>
        </Box>
      ))}
    </PageHead>
  );
}

function ElementCard({ element: e }: { element: ElementEntry }) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', transition: 'border-color .15s', '&:hover': { borderColor: 'text.disabled' } }}>
      <Box sx={{ height: 260, overflow: 'hidden', position: 'relative', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Box sx={{ width: '100%', maxWidth: 420, pointerEvents: 'auto' }}><e.Card /></Box>
      </Box>
      <ButtonBase onClick={() => go('/elements/' + e.slug)} sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', gap: 2, px: 2, py: 1.5, borderTop: 1, borderColor: 'divider', '&:hover .cds-go': { transform: 'translateX(2px)' } }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{e.title}</Typography>
          <Typography variant="body2" color="text.secondary">{e.description}</Typography>
        </Box>
        <Box className="cds-go" sx={{ display: 'inline-flex', color: 'text.secondary', transition: 'transform .15s' }}><ChevronRight size={18} /></Box>
      </ButtonBase>
    </Box>
  );
}

function ElementDetail({ section, element: e }: { section: Section; element: ElementEntry }) {
  return (
    <PageHead overline={section.title} title={e.title} description={e.description}>
      <e.Doc />
    </PageHead>
  );
}
