import * as React from 'react';
import { unstable_useMentionAdapter, unstable_useSlashCommandAdapter, useAui } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FileText, Globe, Landmark, Languages, Slash, Sparkles, User, Users, Wrench } from 'lucide-react';
import { AuiComposerTriggerPopover, AuiDirectiveSegments, AuiThread } from '../../src/ai/aui';
import { AuiDemoRuntime, type DemoThread } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { ThreadFrame } from '../ui/ThreadFrame';

type IconComponent = React.FC<{ className?: string }>;
/** Ícono de los elementos: 14px, como en assistant-ui. */
const ICON = 14;
/** Íconos por clave: categorías por su id, elementos por `icon`. */
const ICONS: Record<string, IconComponent> = {
  personas: Users, herramientas: Wrench, user: User, wrench: Wrench, 'file-text': FileText, landmark: Landmark, languages: Languages, globe: Globe,
};
/** Las fichas del mensaje enviado, por tipo de directiva. */
const DIRECTIVE_ICONS: Record<string, IconComponent> = { user: User, tool: Wrench, command: Slash };

const CATEGORIES = [
  { id: 'personas', label: 'Personas', items: [
    { id: 'nubia', type: 'user', label: 'Nubia Rojas', description: 'Tesorería', icon: 'user' },
    { id: 'npardo', type: 'user', label: 'Nicolás Pardo', description: 'Residente, Obra Norte', icon: 'user' },
    { id: 'cdiaz', type: 'user', label: 'Carolina Díaz', description: 'Contabilidad', icon: 'user' }] },
  { id: 'herramientas', label: 'Herramientas', items: [
    { id: 'consultar_anticipos', type: 'tool', label: 'Consultar anticipos', description: 'Lee los anticipos del ERP', icon: 'wrench' },
    { id: 'buscar_tercero', type: 'tool', label: 'Buscar tercero', description: 'Por NIT o razón social', icon: 'wrench' },
    { id: 'conciliar_banco', type: 'tool', label: 'Conciliación bancaria', description: 'Cruza extracto y libros', icon: 'wrench' }] },
];
const COMMANDS = [
  { id: 'resumir', description: 'Resume la conversación', icon: 'file-text' },
  { id: 'conciliar', description: 'Concilia la cuenta 1110', icon: 'landmark' },
  { id: 'traducir', description: 'Traduce a otro idioma', icon: 'languages' },
  { id: 'buscar', description: 'Busca en la web', icon: 'globe' },
];
const START = 'Pídele a @';
const THREADS: DemoThread[] = [{ id: 'menciones', title: 'Menciones', messages: [] }];

type Char = '@' | '/';
type Flag = 'false' | 'true';

type Unstable_TriggerAdapter = ReturnType<typeof unstable_useMentionAdapter>['adapter'];

/** Mientras carga, el adaptador aún no tiene elementos. */
const loading = (adapter: Unstable_TriggerAdapter): Unstable_TriggerAdapter => ({ ...adapter, categoryItems: () => [], search: () => [] });

/** Escribe el texto en el composer y deja el cursor al final, para que el carácter abra el selector. */
function useSeed() {
  const aui = useAui() as unknown as { composer: () => { setText: (t: string) => void } };
  return React.useCallback((text: string) => {
    aui.composer().setText(text);
    window.setTimeout(() => {
      const input = document.querySelector<HTMLTextAreaElement>('[data-slot="aui-trigger-demo"] textarea');
      if (!input) return;
      input.focus();
      input.setSelectionRange(text.length, text.length);
      input.dispatchEvent(new Event('select', { bubbles: true }));
    }, 0);
  }, [aui]);
}

function Demo({ char, isLoading, removeOnExecute, onExecuted }: { char: Char; isLoading: boolean; removeOnExecute: boolean; onExecuted: (id: string) => void }) {
  const mention = unstable_useMentionAdapter({ categories: CATEGORIES, includeModelContextTools: false, iconMap: ICONS, fallbackIcon: Sparkles });
  const commands = React.useMemo(() => COMMANDS.map((c) => ({ ...c, execute: () => onExecuted(c.id) })), [onExecuted]);
  const slash = unstable_useSlashCommandAdapter({ commands, removeOnExecute, iconMap: ICONS, fallbackIcon: Sparkles });
  const seed = useSeed();
  React.useEffect(() => {
    const id = window.setTimeout(() => seed(char === '@' ? START : '/'), 300);
    return () => window.clearTimeout(id);
  }, [char, seed]);
  const triggers = (
    <>
      <AuiComposerTriggerPopover char="@" {...mention} adapter={isLoading ? loading(mention.adapter) : mention.adapter} isLoading={isLoading} />
      <AuiComposerTriggerPopover char="/" {...slash} adapter={isLoading ? loading(slash.adapter) : slash.adapter} isLoading={isLoading} />
    </>
  );
  return (
    <Box data-slot="aui-trigger-demo" sx={{ height: '100%' }}>
      <ThreadFrame><AuiThread autoFocus={false} welcome="Escribe @ para mencionar o / para un comando." triggers={triggers} directives={{ iconMap: DIRECTIVE_ICONS, fallbackIcon: Sparkles }} /></ThreadFrame>
    </Box>
  );
}

export function AuiTriggerPopoverDoc() {
  const [char, setChar] = React.useState<Char>('@');
  const [isLoading, setLoading] = React.useState<Flag>('false');
  const [remove, setRemove] = React.useState<Flag>('false');
  const [last, setLast] = React.useState<string>();
  const onExecuted = React.useCallback((id: string) => setLast(`/${id}`), []);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <AuiDemoRuntime threads={THREADS} startIn="menciones" followups="none">
        <ElementPage
          demoHeight={540}
          demo={<Demo char={char} isLoading={isLoading === 'true'} removeOnExecute={remove === 'true'} onExecuted={onExecuted} />}
          properties={
            <>
              <PropRow label="char"><PropToggle<Char> label="char" value={char} onChange={setChar} options={[['@', '@ · Directive'], ['/', '/ · Action']]} /></PropRow>
              <PropRow label="isLoading"><PropToggle<Flag> label="isLoading" value={isLoading} onChange={setLoading} options={[['false', 'false'], ['true', 'true']]} /></PropRow>
              <PropRow label="removeOnExecute"><PropToggle<Flag> label="removeOnExecute" value={remove} onChange={setRemove} options={[['false', 'false'], ['true', 'true']]} /></PropRow>
              <PropRow label="onExecute"><Typography variant="body3" color="text.secondary" sx={(t) => ({ ...t.aiKit.code })}>{last ?? '—'}</Typography></PropRow>
            </>
          }
        />
      </AuiDemoRuntime>
    </Box>
  );
}

/** La tarjeta: la categoría Personas abierta sobre el composer; elegir inserta la mención como ficha. */
export function AuiTriggerPopoverCard() {
  const [picked, setPicked] = React.useState<(typeof CATEGORIES)[number]['items'][number]>();
  return (
    <Stack spacing={1}>
      <Paper elevation={8}>
        <MenuList dense aria-label="Personas">
          {CATEGORIES[0].items.map((p) => (
            <MenuItem key={p.id} selected={picked?.id === p.id} onClick={() => setPicked(p)}>
              <ListItemIcon><Box component={User} sx={{ width: ICON, height: ICON, color: 'primary.main' }} /></ListItemIcon>
              <ListItemText primary={p.label} secondary={p.description} primaryTypographyProps={{ variant: 'body2', fontWeight: 'fontWeightMedium' }} secondaryTypographyProps={{ variant: 'caption' }} />
            </MenuItem>
          ))}
        </MenuList>
      </Paper>
      <Typography variant="body2" component="div" sx={{ border: 1, borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1 }}>
        {picked ? <AuiDirectiveSegments text={`Pídele a :user[${picked.label}]{name=${picked.id}}`} iconMap={DIRECTIVE_ICONS} /> : START}
      </Typography>
    </Stack>
  );
}
