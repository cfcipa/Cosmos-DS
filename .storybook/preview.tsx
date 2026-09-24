import * as React from 'react';
import type { Preview } from '@storybook/react';
import Box from '@mui/material/Box';
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
            'Agents', 'Observability', 'Composer', 'Voice', 'Thread', 'Superficies Sinco',
          ],
          'Plantillas',
        ],
      },
    },
  },
  decorators: [
    (Story, ctx) => (
      <CosmosProvider brand={ctx.globals.brand || 'cosmos'} mode={ctx.globals.mode || 'light'}>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: ctx.parameters.layout === 'fullscreen' ? 4 : 0 }}>
          <Box sx={{ maxWidth: ctx.parameters.demoWidth ?? 640, mx: 'auto' }}>
            <Story />
          </Box>
        </Box>
      </CosmosProvider>
    ),
  ],
};
export default preview;
