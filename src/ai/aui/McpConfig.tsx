// Cosmos DS · Kit IA · AUI connected: MCP config dialog.
// Referente: assistant-ui «MCP config dialog» (elements/mcp-config.aui.tsx), sobre @assistant-ui/react-mcp.
// Un diálogo con los conectores de la app y los servidores MCP que agrega el usuario. Cada servidor muestra su estado
// (Conectado en primario; Conectando…, Requiere autorización, Autorizando… y Desconectado en gris; Error en rojo, con
// el borde y el aviso) y la acción que toca: Conectar si está desconectado o falló, Autorizar si pide autorización,
// Desconectar si está conectado. Los servidores propios se pueden quitar. El formulario valida nombre, URL http(s) y,
// con Bearer token, el token; Esc cierra primero el formulario y luego el diálogo. El foco no se pierde al quitar un
// servidor ni al cambiar de acción, y los cambios de estado se anuncian a los lectores de pantalla.
// Monta el administrador una vez, en el proveedor del runtime:
//   AuiConfig({ mcp: McpManagerResource({ connectors }) })  →  <AssistantRuntimeProvider runtime config>
import * as React from 'react';
import { useAuiState } from '@assistant-ui/react';
import { McpAddFormPrimitive, McpManagerPrimitive, McpServerPrimitive, type MCPConnectionState } from '@assistant-ui/react-mcp';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip, { type ChipProps } from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog, { type DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import NativeSelect from '@mui/material/NativeSelect';
import OutlinedInput, { type OutlinedInputProps } from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plug, PlugZap, Plus, Server, ShieldAlert, Trash2, X } from 'lucide-react';
import { visuallyHidden } from '@mui/utils';
import { AuiIconButton } from './AuiIconButton';

/** Medidas de assistant-ui: diálogo de 512px, avatar de 32px, íconos de 16px (14px en los botones). */
const DIALOG_WIDTH = 64;
const AVATAR = 4;
const ICON_SIZE = 16;
const BUTTON_ICON = 14;
const SPINNER = 12;
/** El anuncio para lectores de pantalla se limpia al segundo, para que el mismo estado pueda anunciarse otra vez. */
const ANNOUNCE_MS = 1000;
const HTTP_URL = /^https?:\/\/\S+$/;

export const MCP_STATUS_LABEL: Record<MCPConnectionState, string> = {
  connected: 'Conectado',
  connecting: 'Conectando…',
  authRequired: 'Requiere autorización',
  authPending: 'Autorizando…',
  error: 'Error',
  disconnected: 'Desconectado',
};
const STATUS_COLOR: Record<MCPConnectionState, ChipProps['color']> = {
  connected: 'primary', connecting: 'default', authRequired: 'default', authPending: 'default', error: 'error', disconnected: 'default',
};

const FOCUSABLE = 'button:not([disabled]), a[href]';
const firstFocusable = (el: Element | null | undefined) => (el?.matches(FOCUSABLE) ? (el as HTMLElement) : el?.querySelector<HTMLElement>(FOCUSABLE));
const indexOfServer = (list: Element, el: Element) => [...list.children].findIndex((card) => card.contains(el));
const isFocusLost = () => {
  const active = document.activeElement;
  return !active || active === document.body || active.getAttribute('role') === 'dialog';
};

export interface AuiMcpConfigDialogProps {
  /** El disparador. Default: un botón «Servidores MCP» con el ícono de enchufe. */
  children?: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
  /** Controlado (opcional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Props del Dialog de MUI (contenedor, transición…). */
  DialogProps?: Omit<Partial<DialogProps>, 'open' | 'onClose' | 'children'>;
}

export function AuiMcpConfigDialog({ children, open: controlledOpen, onOpenChange, DialogProps: dialogProps }: AuiMcpConfigDialogProps) {
  const [ownOpen, setOwnOpen] = React.useState(false);
  const open = controlledOpen ?? ownOpen;
  const setOpen = (next: boolean) => { if (controlledOpen === undefined) setOwnOpen(next); onOpenChange?.(next); };
  const [formOpen, setFormOpen] = React.useState(false);
  const titleId = React.useId();
  const trigger = children
    ? React.cloneElement(children, { onClick: (e: React.MouseEvent) => { children.props.onClick?.(e); setOpen(true); } })
    : <Button variant="outlined" size="small" startIcon={<Plug size={ICON_SIZE} />} onClick={() => setOpen(true)}>Servidores MCP</Button>;
  return (
    <>
      {trigger}
      <Dialog
        open={open}
        onClose={(_e, reason) => { if (reason === 'escapeKeyDown' && formOpen) return; setOpen(false); }}
        aria-labelledby={titleId}
        {...dialogProps}
        PaperProps={{ ...dialogProps?.PaperProps, sx: [(t) => ({ width: '100%', maxWidth: t.spacing(DIALOG_WIDTH) }), ...(Array.isArray(dialogProps?.PaperProps?.sx) ? dialogProps.PaperProps.sx : [dialogProps?.PaperProps?.sx])] }}
      >
        <DialogTitle id={titleId}>Servidores MCP</DialogTitle>
        <AuiIconButton tooltip="Cerrar" onClick={() => setOpen(false)} sx={{ position: 'absolute', top: (t) => t.spacing(2), right: (t) => t.spacing(2) }}><X /></AuiIconButton>
        <DialogContent>
          <DialogContentText variant="body2" sx={{ mb: 2 }}>
            Conecta servidores Model Context Protocol para que este asistente pueda usar sus herramientas.
          </DialogContentText>
          <McpManagerPrimitive.Root>
            <Stack spacing={2}>
              <Section title="Conectores">
                <McpManagerPrimitive.Connectors>{() => <ServerCard />}</McpManagerPrimitive.Connectors>
              </Section>
              <Divider />
              <CustomServers formOpen={formOpen} onFormOpenChange={setFormOpen} />
            </Stack>
          </McpManagerPrimitive.Root>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack component="section" spacing={1}>
      <Typography component="h3" variant="overline" color="text.secondary" sx={(t) => ({ lineHeight: t.typography.caption.lineHeight })}>{title}</Typography>
      <Stack spacing={1}>{children}</Stack>
    </Stack>
  );
}

function CustomServers({ formOpen, onFormOpenChange }: { formOpen: boolean; onFormOpenChange: (open: boolean) => void }) {
  const serverIds = useAuiState((s) => s.mcp.customServers.map((server) => server.id).join('\x1f'));
  const listRef = React.useRef<HTMLDivElement>(null);
  const focusedRef = React.useRef<{ element: Element; index: number } | null>(null);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const restoreFocus = React.useRef(false);

  React.useEffect(() => {
    if (formOpen || !restoreFocus.current) return;
    restoreFocus.current = false;
    addRef.current?.focus();
  }, [formOpen]);
  // Al quitar el servidor que tenía el foco, el foco pasa al siguiente (o a «Agregar servidor»).
  React.useEffect(() => {
    const list = listRef.current;
    const focused = focusedRef.current;
    if (!list || !focused) return;
    if (focused.element.isConnected) { focused.index = indexOfServer(list, focused.element); return; }
    focusedRef.current = null;
    if (!isFocusLost()) return;
    (firstFocusable(list.children[focused.index]) ?? firstFocusable(list.nextElementSibling))?.focus();
  }, [serverIds]);

  const close = () => { restoreFocus.current = true; onFormOpenChange(false); };
  return (
    <Stack component="section" spacing={1}>
      <Typography component="h3" variant="overline" color="text.secondary" sx={(t) => ({ lineHeight: t.typography.caption.lineHeight })}>Servidores propios</Typography>
      <Stack
        ref={listRef}
        spacing={1}
        onFocus={(e: React.FocusEvent<HTMLDivElement>) => { focusedRef.current = { element: e.target, index: indexOfServer(e.currentTarget, e.target) }; }}
        sx={{ '&:empty': { display: 'none' } }}
      >
        <McpManagerPrimitive.CustomServers>{() => <ServerCard />}</McpManagerPrimitive.CustomServers>
      </Stack>
      {formOpen ? (
        <AddServerForm onClose={close} />
      ) : (
        <McpManagerPrimitive.AddCustomTrigger asChild>
          <Button ref={addRef} variant="outlined" color="inherit" startIcon={<Plus size={ICON_SIZE} />} onClick={() => onFormOpenChange(true)} sx={{ justifyContent: 'flex-start', borderColor: 'divider' }}>
            Agregar servidor
          </Button>
        </McpManagerPrimitive.AddCustomTrigger>
      )}
    </Stack>
  );
}

function ServerCard() {
  return (
    <Paper
      component={McpServerPrimitive.Root}
      variant="outlined"
      data-slot="aui-mcp-server"
      sx={(t) => ({ display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, '&[data-connection-state="error"]': { borderColor: t.palette.error.main } })}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <ServerAvatar />
        <Stack sx={{ minWidth: 0, flex: 1 }} spacing={0.5} alignItems="flex-start">
          <Typography variant="subtitle2" noWrap sx={{ maxWidth: '100%' }}><McpServerPrimitive.Name /></Typography>
          <StatusChip />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <ServerActions />
          <McpServerPrimitive.RemoveButton asChild>
            <AuiIconButton tooltip="Quitar" size={3.5} sx={{ '&:hover': { color: 'error.main' } }}><Trash2 /></AuiIconButton>
          </McpServerPrimitive.RemoveButton>
        </Stack>
      </Stack>
      <ServerError />
      <ServerAnnouncement />
    </Paper>
  );
}

function ServerAvatar() {
  const icon = useAuiState((s) => s.mcpServer.icon ?? null);
  const name = useAuiState((s) => s.mcpServer.name);
  return (
    <Avatar
      variant="rounded"
      src={icon ?? undefined}
      alt={name}
      sx={(t) => ({ width: t.spacing(AVATAR), height: t.spacing(AVATAR), bgcolor: 'action.hover', color: 'text.secondary', border: 1, borderColor: 'divider' })}
    >
      <Server size={ICON_SIZE} />
    </Avatar>
  );
}

function StatusChip() {
  const status = useAuiState((s) => s.mcpServer.connectionState);
  const busy = status === 'connecting' || status === 'authPending';
  return (
    <Chip
      size="small"
      color={STATUS_COLOR[status]}
      label={MCP_STATUS_LABEL[status]}
      icon={busy ? <CircularProgress size={SPINNER} color="inherit" /> : undefined}
      data-slot="aui-mcp-status"
      data-state={status}
    />
  );
}

function ServerAnnouncement() {
  const status = useAuiState((s) => s.mcpServer.connectionState);
  const message = useAuiState((s) => s.mcpServer.lastError?.message ?? null);
  const [seen, setSeen] = React.useState({ status, message });
  const [announcement, setAnnouncement] = React.useState('');
  if (seen.status !== status || seen.message !== message) {
    setSeen({ status, message });
    if (message && message !== seen.message) setAnnouncement(`${MCP_STATUS_LABEL.error}: ${message}`);
    else if (status !== seen.status) setAnnouncement(MCP_STATUS_LABEL[status]);
  }
  React.useEffect(() => {
    if (!announcement) return undefined;
    const id = window.setTimeout(() => setAnnouncement(''), ANNOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [announcement]);
  return <Box role="status" sx={visuallyHidden}>{announcement}</Box>;
}


function ServerError() {
  const message = useAuiState((s) => s.mcpServer.lastError?.message ?? null);
  if (!message) return null;
  return (
    <Alert severity="error" variant="outlined" icon={<ShieldAlert size={BUTTON_ICON} />} sx={{ py: 0, '& .MuiAlert-message': (t) => ({ ...t.typography.caption, overflowWrap: 'anywhere' }) }}>
      {message}
    </Alert>
  );
}

function ServerActions() {
  const state = useAuiState((s) => s.mcpServer.connectionState);
  const connectRef = React.useRef<HTMLButtonElement>(null);
  const disconnectRef = React.useRef<HTMLButtonElement>(null);
  const focusedRef = React.useRef<Element | null>(null);
  // Si el botón con el foco desaparece al cambiar de estado, el foco pasa a la acción nueva.
  React.useEffect(() => {
    const focused = focusedRef.current;
    if (!focused || focused.isConnected) return;
    focusedRef.current = null;
    if (isFocusLost()) (connectRef.current ?? disconnectRef.current)?.focus();
  }, [state]);
  return (
    <Stack direction="row" spacing={1} onFocus={(e: React.FocusEvent) => { focusedRef.current = e.target; }}>
      <McpServerPrimitive.ConnectButton asChild>
        <Button ref={connectRef} variant="contained" size="small" startIcon={<PlugZap size={BUTTON_ICON} />}>Conectar</Button>
      </McpServerPrimitive.ConnectButton>
      <McpServerPrimitive.OAuthLink asChild>
        <Button variant="contained" size="small">Autorizar</Button>
      </McpServerPrimitive.OAuthLink>
      <McpServerPrimitive.DisconnectButton asChild>
        <Button ref={disconnectRef} variant="outlined" size="small">Desconectar</Button>
      </McpServerPrimitive.DisconnectButton>
    </Stack>
  );
}

/** El campo de texto de MUI para las primitivas del formulario: su valor, id y aria-* van al input. */
const FieldInput = React.forwardRef<HTMLInputElement, OutlinedInputProps & { 'aria-invalid'?: boolean | 'true' | 'false'; 'aria-describedby'?: string }>(function FieldInput(
  { 'aria-invalid': invalid, 'aria-describedby': describedBy, inputProps, ...rest },
  ref,
) {
  return (
    <OutlinedInput
      size="small"
      fullWidth
      inputRef={ref}
      error={invalid === true || invalid === 'true'}
      inputProps={{ ...inputProps, 'aria-invalid': invalid, 'aria-describedby': describedBy }}
      {...rest}
    />
  );
});

const FieldSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<typeof NativeSelect>>(function FieldSelect({ children, ...rest }, ref) {
  return <NativeSelect inputRef={ref} input={<OutlinedInput size="small" fullWidth />} {...rest}>{children}</NativeSelect>;
});

function FormRow({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <Stack spacing={0.75}>
      <FormLabel htmlFor={htmlFor} sx={(t) => ({ ...t.typography.caption, fontWeight: t.typography.fontWeightMedium, color: 'text.primary' })}>{label}</FormLabel>
      {children}
    </Stack>
  );
}

/** Los mensajes del formulario, en el orden en que se validan. */
function validate(form: HTMLFormElement): string | null {
  const data = new FormData(form);
  const value = (key: string) => String(data.get(key) ?? '').trim();
  if (!value('name')) return 'Escribe un nombre para el servidor.';
  if (!HTTP_URL.test(value('url'))) return 'La URL debe empezar por http:// o https://.';
  if (value('auth') === 'bearer' && !value('token')) return 'Con Bearer token, el token es obligatorio.';
  return null;
}

function AddServerForm({ onClose }: { onClose: () => void }) {
  const id = React.useId();
  const ids = { name: `${id}-name`, url: `${id}-url`, auth: `${id}-auth`, token: `${id}-token`, scopes: `${id}-scopes`, error: `${id}-error` };
  const [error, setError] = React.useState<string | null>(null);
  return (
    <Box
      onSubmitCapture={(e: React.FormEvent<HTMLDivElement>) => {
        const message = validate(e.target as HTMLFormElement);
        setError(message);
        if (message) { e.preventDefault(); e.stopPropagation(); }
      }}
      onChangeCapture={() => setError(null)}
      onKeyDownCapture={(e: React.KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}
    >
      <McpAddFormPrimitive.Root onSubmitted={onClose} onCancel={onClose} noValidate aria-describedby={error ? ids.error : undefined}>
        <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography component="h4" variant="subtitle2">Nuevo servidor</Typography>
            <McpAddFormPrimitive.Cancel asChild>
              <AuiIconButton tooltip="Cerrar el formulario" type="button"><X /></AuiIconButton>
            </McpAddFormPrimitive.Cancel>
          </Stack>
          <FormRow label="Nombre" htmlFor={ids.name}>
            <McpAddFormPrimitive.NameField asChild>
              <FieldInput id={ids.name} name="name" autoFocus placeholder="Mi servidor MCP" />
            </McpAddFormPrimitive.NameField>
          </FormRow>
          <FormRow label="URL" htmlFor={ids.url}>
            <McpAddFormPrimitive.UrlField asChild>
              <FieldInput id={ids.url} name="url" placeholder="https://ejemplo.com/mcp" />
            </McpAddFormPrimitive.UrlField>
          </FormRow>
          <FormRow label="Autenticación" htmlFor={ids.auth}>
            <McpAddFormPrimitive.AuthSelect asChild>
              <FieldSelect id={ids.auth} name="auth">
                <option value="oauth">OAuth</option>
                <option value="bearer">Bearer token</option>
                <option value="none">Ninguna</option>
              </FieldSelect>
            </McpAddFormPrimitive.AuthSelect>
          </FormRow>
          <McpAddFormPrimitive.AuthFields>
            {({ authType }) => {
              if (authType === 'bearer') {
                return (
                  <FormRow label="Token" htmlFor={ids.token}>
                    <McpAddFormPrimitive.BearerTokenField asChild>
                      <FieldInput id={ids.token} name="token" type="password" autoComplete="off" />
                    </McpAddFormPrimitive.BearerTokenField>
                  </FormRow>
                );
              }
              if (authType === 'oauth') {
                return (
                  <FormRow label="Scopes" htmlFor={ids.scopes}>
                    <McpAddFormPrimitive.ScopesField asChild>
                      <FieldInput id={ids.scopes} name="scopes" placeholder="openid profile" />
                    </McpAddFormPrimitive.ScopesField>
                  </FormRow>
                );
              }
              return null;
            }}
          </McpAddFormPrimitive.AuthFields>
          {error ? (
            <Typography id={ids.error} role="alert" variant="caption" color="error">{error}</Typography>
          ) : (
            <Typography component={McpAddFormPrimitive.Error} variant="caption" color="error" />
          )}
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <McpAddFormPrimitive.Cancel asChild>
              <Button type="button" color="inherit">Cancelar</Button>
            </McpAddFormPrimitive.Cancel>
            <McpAddFormPrimitive.Submit asChild>
              <Button type="submit" variant="contained" sx={{ '&[data-submitting] .aui-idle, &:not([data-submitting]) .aui-busy': { display: 'none' } }}>
                <span className="aui-idle">Agregar servidor</span>
                <span className="aui-busy">Agregando…</span>
              </Button>
            </McpAddFormPrimitive.Submit>
          </Stack>
        </Paper>
      </McpAddFormPrimitive.Root>
    </Box>
  );
}
