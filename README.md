# Cosmos DS · MUI

Tema MUI de Cosmos y kit de componentes de IA sobre **MUI Material**.

- `src/ThemeCOSMOS.json` + `src/theme/*` — paquete **Azul** (tokens de Figma `COSMOS-MUI-2026`, primary `#1053b7` / `#81b4ff`, Inter + Schibsted Grotesk). Ver `docs/theme-azul-INSTRUCTIONS.md`.
- `src/ai/*` — kit IA. Solo lee el tema; `withAiKit()` deriva `palette.ai` de la marca.
- Storybook ordenado como el catálogo *Elements* de assistant-ui.

## Empezar

```bash
npm install
npm run storybook      # http://localhost:6006
npm run typecheck
npm run build          # dist/ (ESM + tipos)
```

## Uso

```tsx
import { CosmosProvider, ToolCall } from '@sinco/cosmos-ds';

<CosmosProvider mode="dark">
  <ToolCall toolName="confirmar_facturas" status="requires-action"
    approval={{ prompt: '¿Confirmo 2 facturas por $ 7.430.000?', onRespond: console.log }} />
</CosmosProvider>
```

## Pendiente

- `src/theme/mui-theme-augmentation.ts` es un reemplazo mínimo (el paquete Azul no lo trae). Si producción tiene el suyo, reemplazarlo.
- Marcas Sinco, AD Proveedor, ADC y Bitákora: faltan sus carpetas `theme/<marca>/*`.
- Migrar el resto del kit (Reasoning, Messages, Knowledge, Composer, Thread, superficies Sinco).
