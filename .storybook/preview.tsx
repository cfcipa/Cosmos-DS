import * as React from 'react';
import type { Preview } from '@storybook/react';
import Box from '@mui/material/Box';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/schibsted-grotesk/500.css';
import '@fontsource/schibsted-grotesk/600.css';
import '@fontsource/jetbrains-mono/400.css';
import { CosmosProvider } from '../src/CosmosProvider';

const preview: Preview = {
  globalTypes: {
    brand: {
      description: 'Marca (tema MUI)',
      toolbar: { title: 'Marca', icon: 'paintbrush', items: [{ value: 'cosmos', title: 'Cosmos' }], dynamicTitle: true },
    },
    mode: {
      description: 'Modo',
      toolbar: { title: 'Modo', icon: 'mirror', items: [{ value: 'light', title: 'Light', icon: 'sun' }, { value: 'dark', title: 'Dark', icon: 'moon' }], dynamicTitle: true },
    },
  },
  initialGlobals: { brand: 'cosmos', mode: 'light' },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true, sort: 'requiredFirst' },
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: [
          'Introducción', 'Tema', ['Colores', 'Tipografía'],
          'Elementos', [
            'Reasoning', 'Messages', 'Tool use', 'Knowledge', 'Structured output',
            'Agents', 'Observability', 'Composer', 'Voice', 'Thread', 'AUI connected', 'Sinco',
          ],
          'Plantillas',
        ],
      },
    },
  },
  decorators: [
    (Story, ctx) => (
      <CosmosProvider brand={ctx.globals.brand || 'cosmos'} mode={ctx.globals.mode || 'light'}>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
          <Box sx={{ maxWidth: ctx.parameters.demoWidth ?? 640, mx: 'auto' }}>
            <Story />
          </Box>
        </Box>
      </CosmosProvider>
    ),
  ],
};
export default preview;
