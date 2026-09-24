import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { ToolCall, ToolGroup } from './ToolCall';
import type { ToolCallStatus } from './types';
import { DemoFrame } from '../../storybook/DemoFrame';

const ARGS = { documento: 'FAC-2231', proveedor: 'Aceros del Norte', montos: [3200000, 4230000] };
const RESULT = { confirmadas: 2, total: 7430000 };

const meta: Meta<typeof ToolCall> = {
  title: 'Elementos/Tool use/ToolCall',
  component: ToolCall,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Llamada a herramienta dentro de un mensaje del asistente. Referente: assistant-ui **ToolFallback**. ' +
          'Estado, nombre, duración, argumentos y resultado plegables; en `requires-action` queda abierta con la aprobación (human-in-the-loop).',
      },
    },
  },
  args: {
    toolName: 'confirmar_facturas',
    status: 'complete',
    args: ARGS,
    result: RESULT,
    durationMs: 1240,
    defaultOpen: false,
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['running', 'requires-action', 'complete', 'error', 'cancelled'] },
    args: { control: 'object' },
    result: { control: 'object' },
    approval: { control: 'object' },
    children: { control: false },
    onOpenChange: { action: 'onOpenChange' },
  },
  render: (a) => <DemoFrame><ToolCall key={a.status + String(a.defaultOpen)} {...a} /></DemoFrame>,
};
export default meta;
type Story = StoryObj<typeof ToolCall>;

export const Completa: Story = {};
export const Abierta: Story = { args: { defaultOpen: true } };
export const EnCurso: Story = { name: 'En curso', args: { status: 'running', result: undefined, durationMs: undefined, startedAt: Date.now() } };
export const ConError: Story = {
  name: 'Error',
  args: { status: 'error', result: undefined, error: 'El proveedor no tiene cuenta bancaria registrada.', defaultOpen: true },
};
export const Cancelada: Story = {
  args: { status: 'cancelled', result: undefined, error: 'El usuario rechazó la acción.', defaultOpen: true },
};
export const RequiereAprobacion: Story = {
  name: 'Requiere aprobación',
  args: {
    status: 'requires-action', result: undefined, durationMs: undefined,
    approval: { prompt: '¿Confirmo 2 facturas por $ 7.430.000?' },
  },
};
export const AprobacionConConfirmacion: Story = {
  name: 'Aprobación · permitir siempre',
  args: {
    status: 'requires-action', result: undefined, durationMs: undefined,
    approval: {
      prompt: '¿Permito que el asistente confirme facturas?',
      options: [
        { id: 'once', label: 'Permitir una vez', kind: 'allow' },
        { id: 'always', label: 'Permitir siempre', kind: 'allow-always', confirm: { title: '¿Permitir siempre?', description: 'El asistente podrá hacer esto sin preguntar.', grants: ['facturas.confirmar'] } },
        { id: 'reject', label: 'Rechazar', kind: 'reject' },
      ],
    },
  },
};
export const RespuestaLibre: Story = {
  name: 'Aprobación · respuesta libre',
  args: {
    status: 'requires-action', result: undefined, durationMs: undefined,
    approval: { mode: 'text', prompt: '¿Qué observación dejo en la factura?' },
  },
};

/** Flujo completo, como las demos en vivo del referente: en curso → requiere aprobación → completa / cancelada. */
export const Flujo: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [status, setStatus] = React.useState<ToolCallStatus>('running');
    const [started, setStarted] = React.useState(Date.now());
    const [dur, setDur] = React.useState<number | undefined>(undefined);
    React.useEffect(() => {
      if (status !== 'running') return undefined;
      const t = window.setTimeout(() => { setDur(Date.now() - started); setStatus('requires-action'); }, 1800);
      return () => clearTimeout(t);
    }, [status, started]);
    const restart = () => { setDur(undefined); setStarted(Date.now()); setStatus('running'); };
    return (
      <DemoFrame title="Flujo">
        <ToolCall
          toolName="confirmar_facturas" status={status} args={ARGS} startedAt={started} durationMs={dur}
          result={status === 'complete' ? RESULT : undefined}
          error={status === 'cancelled' ? 'El usuario rechazó la acción.' : undefined}
          approval={{ prompt: '¿Confirmo 2 facturas por $ 7.430.000?', onRespond: (id) => setStatus(id === 'approve' ? 'complete' : 'cancelled') }}
        />
        <Stack direction="row"><Button variant="outlined" onClick={restart}>Reiniciar</Button></Stack>
      </DemoFrame>
    );
  },
};

/** ToolGroup: llamadas consecutivas de un turno bajo un solo disparador (assistant-ui ToolGroup). */
export const Grupo: StoryObj<typeof ToolGroup> = {
  name: 'ToolGroup',
  args: { count: 3, variant: 'outline', active: false, defaultOpen: true },
  argTypes: { variant: { control: 'inline-radio', options: ['outline', 'ghost', 'muted'] } },
  render: (a) => (
    <DemoFrame>
      <ToolGroup key={a.variant + String(a.defaultOpen)} {...a}>
        <ToolCall toolName="buscar_proveedor" args={{ nit: '900123456' }} result={{ nombre: 'Aceros del Norte' }} durationMs={420} />
        <ToolCall toolName="listar_facturas" args={{ proveedor: 'Aceros del Norte' }} result={{ pendientes: 2 }} durationMs={860} />
        <ToolCall toolName="confirmar_facturas" status={a.active ? 'running' : 'complete'} args={ARGS} startedAt={Date.now()} durationMs={a.active ? undefined : 1240} />
      </ToolGroup>
    </DemoFrame>
  ),
};
