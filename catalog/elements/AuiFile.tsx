import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AuiFile, type AuiFileSize, type AuiFileVariant } from '../../src/ai/aui';
import { userBubbleSx } from '../../src/ai/lib/thread';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

const ASK = 'Mándame los soportes del anticipo CE-4492 de Nubia Rojas.';
const ANSWER = 'Aquí están los cuatro soportes de CE-4492:';

/** Un contenido en base64 del tamaño dado, para que la parte muestre su tamaño real y se pueda descargar. */
function payload(bytes: number, head: string) {
  return window.btoa(head + ' '.repeat(Math.max(0, bytes - head.length)));
}
const PDF_BYTES = 186778;
const XLSX_BYTES = 48213;
const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

type FilePart = { type: 'file'; filename: string; data: string; mimeType: string; sourceType?: 'url' | 'id' };
const FILES: FilePart[] = [
  { type: 'file', filename: 'politica_anticipos.pdf', mimeType: 'application/pdf', data: payload(PDF_BYTES, '%PDF-1.4\n') },
  { type: 'file', filename: 'conciliacion_agosto.xlsx', mimeType: XLSX, data: `data:${XLSX};base64,${payload(XLSX_BYTES, 'PK')}` },
  { type: 'file', filename: 'respuesta_dian.json', mimeType: 'application/json', data: 'https://erp.sinco.co/archivos/respuesta_dian.json', sourceType: 'url' },
  { type: 'file', filename: 'soporte_CE-4492.png', mimeType: 'image/png', data: 'file_8f2c41', sourceType: 'id' },
];

function Files({ variant, size, files = FILES }: { variant: AuiFileVariant; size: AuiFileSize; files?: FilePart[] }) {
  return (
    <Stack spacing={1} alignItems="flex-start">
      {files.map((f) => <AuiFile key={f.filename} {...(f as unknown as React.ComponentProps<typeof AuiFile>)} variant={variant} size={size} />)}
    </Stack>
  );
}

export function AuiFileDoc() {
  const [variant, setVariant] = React.useState<AuiFileVariant>('outline');
  const [size, setSize] = React.useState<AuiFileSize>('default');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={420}
        demo={
          <Stack spacing={2} sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Typography variant="body1" sx={userBubbleSx()}>{ASK}</Typography>
            <Box sx={{ px: 1 }}>
              <Typography variant="body1" sx={{ mb: 1.5 }}>{ANSWER}</Typography>
              <Files variant={variant} size={size} />
            </Box>
          </Stack>
        }
        properties={
          <>
            <PropRow label="variant"><PropToggle<AuiFileVariant> label="variant" value={variant} onChange={setVariant} options={[['outline', 'outline'], ['ghost', 'ghost'], ['muted', 'muted']]} /></PropRow>
            <PropRow label="size"><PropToggle<AuiFileSize> label="size" value={size} onChange={setSize} options={[['sm', 'sm'], ['default', 'default'], ['lg', 'lg']]} /></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AuiFileCard() {
  return <Files variant="outline" size="sm" files={FILES.slice(0, 3)} />;
}
