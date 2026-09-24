import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AuiImage, AuiThread, type AuiImageSize, type AuiImageVariant } from '../../src/ai/aui';
import { userBubbleSx } from '../../src/ai/lib/thread';
import { AuiAsk } from '../ui/AuiAsk';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { CHART_FILENAME, CHART_IMAGE } from '../ui/demoScripts';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { ThreadFrame } from '../ui/ThreadFrame';

const ASK = 'Grafica los anticipos por responsable.';
type Status = 'complete' | 'broken' | 'running' | 'blocked';
/** Regenerar tarda lo del tablero. */
const REGENERATE_MS = 1200;
const STATUS = {
  complete: { type: 'complete' },
  broken: { type: 'complete' },
  running: { type: 'running' },
  blocked: { type: 'incomplete', reason: 'content-filter' },
} as const;

export function AuiImageDoc() {
  const [status, setStatus] = React.useState<Status>('complete');
  const [variant, setVariant] = React.useState<AuiImageVariant>('outline');
  const [size, setSize] = React.useState<AuiImageSize>('default');
  const [actions, setActions] = React.useState<'off' | 'on'>('on');
  const [key, setKey] = React.useState(0);
  const src = status === 'broken' ? './imagenes/anticipos_por_responsable.png' : CHART_IMAGE;
  const regenerate = () => new Promise<void>((r) => window.setTimeout(() => { setKey((k) => k + 1); r(); }, REGENERATE_MS));
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={460}
        demo={
          <Stack spacing={2} sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Typography variant="body1" sx={userBubbleSx()}>{ASK}</Typography>
            <Box sx={{ px: 1 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>Estos son los 3 anticipos pendientes, por responsable:</Typography>
              <AuiImage
                key={`${key}-${status}`}
                type="image"
                image={src}
                filename={CHART_FILENAME}
                {...{ status: STATUS[status] }}
                variant={variant}
                size={size}
                actions={actions === 'on'}
                onRegenerate={regenerate}
              />
            </Box>
          </Stack>
        }
        properties={
          <>
            <PropRow label="status"><PropToggle<Status> label="status" value={status} onChange={setStatus} options={[['complete', 'complete'], ['broken', 'complete · src fails'], ['running', 'running'], ['blocked', 'content-filter']]} /></PropRow>
            <PropRow label="variant"><PropToggle<AuiImageVariant> label="variant" value={variant} onChange={setVariant} options={[['outline', 'outline'], ['ghost', 'ghost'], ['muted', 'muted']]} /></PropRow>
            <PropRow label="size"><PropToggle<AuiImageSize> label="size" value={size} onChange={setSize} options={[['sm', 'sm'], ['default', 'default'], ['lg', 'lg'], ['full', 'full']]} /></PropRow>
            <PropRow label="Image.Actions"><PropToggle label="Image.Actions" value={actions} onChange={setActions} options={[['off', 'off'], ['on', 'with onRegenerate']]} /></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AuiImageCard() {
  return <Box sx={{ display: 'flex', justifyContent: 'center' }}><AuiImage type="image" image={CHART_IMAGE} filename={CHART_FILENAME} status={{ type: 'complete' }} size="sm" actions /></Box>;
}
