import * as React from 'react';
import Box from '@mui/material/Box';
import { MessagesSquare } from 'lucide-react';
import { AuiThread, AuiThreadListSidebar, type AuiThreadListSidebarProps } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

type Side = NonNullable<AuiThreadListSidebarProps['side']>;
type Variant = NonNullable<AuiThreadListSidebarProps['variant']>;
type Collapsible = NonNullable<AuiThreadListSidebarProps['collapsible']>;

/** La marca del encabezado: el ícono de assistant-ui en el cuadro primary. */
const BRAND = { name: 'Sinco', icon: <MessagesSquare size={16} />, href: 'https://sinco.com.co' };
const ACCOUNT = { name: 'Carlos', detail: 'Sinco', initials: 'CC' };

export function AuiThreadListSidebarDoc() {
  const [side, setSide] = React.useState<Side>('left');
  const [variant, setVariant] = React.useState<Variant>('sidebar');
  const [collapsible, setCollapsible] = React.useState<Collapsible>('offcanvas');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={
          <Box sx={{ height: '100%', p: 2.5, boxSizing: 'border-box' }}>
            <Box sx={{ height: '100%', border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              <AuiDemoRuntime seed>
                <AuiThreadListSidebar key={collapsible} side={side} variant={variant} collapsible={collapsible} brand={BRAND} account={ACCOUNT}>
                  <AuiThread autoFocus={false} />
                </AuiThreadListSidebar>
              </AuiDemoRuntime>
            </Box>
          </Box>
        }
        properties={
          <>
            <PropRow label="side"><PropToggle<Side> label="side" value={side} onChange={setSide} options={[['left', 'left'], ['right', 'right']]} /></PropRow>
            <PropRow label="variant"><PropToggle<Variant> label="variant" value={variant} onChange={setVariant} options={[['sidebar', 'sidebar'], ['floating', 'floating'], ['inset', 'inset']]} /></PropRow>
            <PropRow label="collapsible"><PropToggle<Collapsible> label="collapsible" value={collapsible} onChange={setCollapsible} options={[['offcanvas', 'offcanvas'], ['icon', 'icon'], ['none', 'none']]} /></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AuiThreadListSidebarCard() {
  return (
    <Box sx={{ height: 212, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <AuiDemoRuntime seed>
        <AuiThreadListSidebar brand={BRAND}>
          <AuiThread autoFocus={false} />
        </AuiThreadListSidebar>
      </AuiDemoRuntime>
    </Box>
  );
}
