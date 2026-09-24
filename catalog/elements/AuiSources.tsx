import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  AuiSourceCards, AuiSources, AuiSourcesProvider, AuiThread, extractDomain, type AuiSourceSize, type AuiSourceVariant,
} from '../../src/ai/aui';
import { userBubbleSx } from '../../src/ai/lib/thread';
import { AuiAsk } from '../ui/AuiAsk';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { SOURCE_PARTS, SOURCES_ANSWER } from '../ui/demoScripts';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { ThreadFrame } from '../ui/ThreadFrame';

const ASK = '¿Cómo se calcula la retención en la fuente por servicios?';
type Design = 'runtime' | 'cards';
type Favicon = 'default' | 'broken';
/** Una ruta de favicons que no resuelve, para ver la inicial del dominio. */
const brokenFavicon = (domain: string) => `/favicons/${domain}.ico`;
const CARDS = SOURCE_PARTS.flatMap((p) => (p.type === 'source' && p.sourceType === 'url' ? [{ domain: extractDomain(p.url), title: p.title || extractDomain(p.url) }] : []));

function CardsDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <Stack spacing={2} sx={{ p: 3 }}>
      <Typography variant="body1" sx={userBubbleSx()}>{ASK}</Typography>
      <Typography variant="body1" sx={{ px: 1 }}>{SOURCES_ANSWER}</Typography>
      <Box sx={{ px: 1 }}><AuiSourceCards sources={CARDS} open={open} onOpenChange={setOpen} /></Box>
    </Stack>
  );
}

export function AuiSourcesDoc() {
  const [design, setDesign] = React.useState<Design>('runtime');
  const [variant, setVariant] = React.useState<AuiSourceVariant>('outline');
  const [size, setSize] = React.useState<AuiSourceSize>('default');
  const [favicon, setFavicon] = React.useState<Favicon>('default');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={design === 'runtime' ? (
          <AuiDemoRuntime script="sources">
            <AuiAsk question={ASK} />
            <AuiSourcesProvider variant={variant} size={size} faviconUrl={favicon === 'broken' ? brokenFavicon : undefined}>
              <ThreadFrame><AuiThread autoFocus={false} /></ThreadFrame>
            </AuiSourcesProvider>
          </AuiDemoRuntime>
        ) : <CardsDemo />}
        properties={
          <>
            <PropRow label="design"><PropToggle<Design> label="design" value={design} onChange={setDesign} options={[['runtime', 'Sources (runtime)'], ['cards', 'Source cards (static)']]} /></PropRow>
            {design === 'runtime' && (
              <>
                <PropRow label="variant"><PropToggle<AuiSourceVariant> label="variant" value={variant} onChange={setVariant} options={[['outline', 'outline'], ['secondary', 'secondary'], ['muted', 'muted'], ['ghost', 'ghost']]} /></PropRow>
                <PropRow label=""><PropToggle<AuiSourceVariant> label="variant" value={variant} onChange={setVariant} options={[['info', 'info'], ['warning', 'warning'], ['success', 'success'], ['destructive', 'destructive']]} /></PropRow>
                <PropRow label="size"><PropToggle<AuiSourceSize> label="size" value={size} onChange={setSize} options={[['sm', 'sm'], ['default', 'default'], ['lg', 'lg']]} /></PropRow>
                <PropRow label="faviconUrl"><PropToggle<Favicon> label="faviconUrl" value={favicon} onChange={setFavicon} options={[['default', 'DuckDuckGo'], ['broken', 'unresolvable']]} /></PropRow>
              </>
            )}
          </>
        }
      />
    </Box>
  );
}

export function AuiSourcesCard() {
  return (
    <Stack spacing={1.5}>
      <Typography variant="body1">{SOURCES_ANSWER}</Typography>
      <Box>{SOURCE_PARTS.map((part) => (part.type === 'source' ? <AuiSources key={part.id} {...(part as React.ComponentProps<typeof AuiSources>)} /> : null))}</Box>
    </Stack>
  );
}
