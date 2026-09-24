# Sincronización de colores y tokens Cosmos desde Figma — Paquete de aplicación (Azul — versión final a entregar)

## Para quién es este documento

Este documento describe, de forma completa y autocontenida, el conjunto de cambios ya hechos y validados en un ambiente de desarrollo (design-system-sincosoft), que debe replicarse en el repositorio de **producción** (un fork del mismo proyecto, en el estado *anterior* a este cambio).

Puede ser seguido por una persona desarrolladora, o por otro modelo de IA (Claude, GPT, etc.) que tenga acceso al repositorio de producción. Sigue los pasos en orden; no se necesita contexto adicional de la conversación donde se generó este paquete.

**Esta es la versión final a entregar.** Reemplaza cualquier paquete anterior que hayan recibido (`Azul-Morado`, `Indigo`, `Cian`) — todos eran iteraciones de prueba sobre el mismo color primary; esta carpeta contiene el estado validado y definitivo.

## 1. Qué es esto y por qué existe

El archivo `ThemeCOSMOS.json` es la fuente de tokens de diseño (colores, tipografía, spacing) del sistema de diseño Cosmos, exportado desde un archivo de Figma con Variables (`COSMOS-MUI-2026`). Este paquete resulta de **validar la paleta de variables completa** contra el estado más reciente de Figma (las 8 colecciones: `palette`, `brand-colors`, `typography`, `spacing`, `breakpoints`, `shape`, `metadata`, `_components`), no solo el color primary.

### 1.1 Color `primary` — valor final

| | Modo Light (`.500`) | Modo Dark (`.500`) |
|---|---|---|
| **Valor final en este paquete** | **`#1053b7`** | **`#81b4ff`** |

Se probaron varias variantes de este color durante el proceso (Azul-Morado, Indigo, Cian) antes de confirmar que el valor correcto y definitivo en Figma es el azul original (`#1053b7` / `#81b4ff`).

### 1.2 Otros cambios de contenido detectados en esta última validación completa

Además del color primary, la validación exhaustiva de la última sincronización encontró:

- **`palette.secondary.contrastText` (modo Dark)** cambió de `#ffffff` a `#212121`. Ahora es consistente con `primary`/`error`/`warning`/`info`/`success`, que ya usaban texto oscuro sobre sus colores en modo Dark.
- **Reestructuración de `_components.muiAutocomplete`**: Figma movió la variable `inputBase` de vuelta a estar **anidada dentro de `small`** (`muiAutocomplete/small/inputBase/*`), revirtiendo una reorganización anterior donde era un grupo hermano (`muiAutocomplete/inputBase/*`). Esto requirió un ajuste de una línea en `theme/base/baseTheme.ts` (ver sección 1.4).

### 1.3 Arquitectura (heredada de iteraciones anteriores, sin cambios adicionales)

- **Resolver de tokens** (`theme/utils/resolveToken.ts`): sigue automáticamente cualquier referencia `{ruta.al.token}` definida en Figma, en vez de que el código asuma a mano a qué familia de color apunta cada slot semántico. Gracias a esto, los cambios de color de `primary` **no requieren tocar ningún archivo `.ts`** — solo `ThemeCOSMOS.json`.
- **`theme/base/baseTheme.ts`** exporta una función `getBaseThemeConfig(mode: 'Light' | 'Dark')` en vez de un objeto estático — así el modo oscuro de Cosmos recalcula correctamente los colores semánticos (`error`, `warning`, `info`, `success`, `secondary`, `grey`) en vez de heredar los de modo claro (bug corregido en una iteración anterior).
- **`theme/cosmos/cosmosLightTheme.ts` / `cosmosDarkTheme.ts`**: el `primary` se resuelve desde `palette.primary` (sigue el alias real de Figma) en vez de una familia hardcodeada.
- **`components/Layout.tsx`**: el swatch de color de "Cosmos" en el selector de marca (antes hardcodeado en `#6366f1`, un valor que no correspondía a nada real) ahora se calcula dinámicamente desde `ThemeCOSMOS.json`.

### 1.4 Cambio puntual de esta iteración en `theme/base/baseTheme.ts`

Dentro del bloque de estilos de `MuiAutocomplete` (selector `.MuiInputBase-sizeSmall .MuiInputBase-input`), la ruta de lectura cambió:

```ts
// Antes (por una reorganización previa de Figma que ya no aplica):
CosmosTheme._components.muiAutocomplete.inputBase.py.$value

// Ahora (coincide con la estructura actual de Figma):
CosmosTheme._components.muiAutocomplete.small.inputBase.py.$value
```

(Mismo ajuste para `.px` y `.fontSize`.) Si tu equipo reemplaza el archivo completo (recomendado, ver sección 2), no necesitas hacer nada adicional — ya viene aplicado.

## 2. Manifiesto de archivos

Todos los archivos de este paquete deben copiarse **respetando la misma ruta relativa** desde la raíz del repositorio (sobreescribir donde ya existan, crear donde sean nuevos).

| Ruta en el repo | Acción | Descripción |
|---|---|---|
| `ThemeCOSMOS.json` | **Reemplazar** | Fuente de datos completa: paleta de colores, tipografía y spacing, validada contra las 8 colecciones de Figma. Incluye el `primary` final y el fix de `secondary.contrastText`. |
| `theme/utils/resolveToken.ts` | **Archivo nuevo** (si no lo tienen ya) | Resolver de alias de tokens. |
| `theme/utils/createBrandTheme.ts` | **Reemplazar** | Llama a `getBaseThemeConfig(mode)` en vez de importar un objeto estático. |
| `theme/base/baseTheme.ts` | **Reemplazar** | Exporta `getBaseThemeConfig(mode: 'Light' \| 'Dark')`. Incluye el fix de ruta de `muiAutocomplete.small.inputBase` (sección 1.4) y el fix previo del ícono de `Rating`. |
| `theme/cosmos/cosmosLightTheme.ts` | **Reemplazar** | `primary` resuelto desde `palette.primary`. |
| `theme/cosmos/cosmosDarkTheme.ts` | **Reemplazar** | Mismo ajuste, para modo oscuro. |
| `components/Layout.tsx` | **Reemplazar** | Swatch de "Cosmos" en el selector de marca calculado dinámicamente. |
| `index.html` | **Aplicar solo el fragmento indicado** (ver sección 5) | Carga de fuentes Inter, Schibsted Grotesk y Nunito. |

**No se requieren cambios en `package.json`.**

## 3. Requisitos previos (verificar antes de aplicar)

- `tsconfig.json` debe tener `"resolveJsonModule": true`.
- Deben existir sin cambios: `theme/mui-theme-augmentation.ts`, `theme/sinco/*`, `theme/adproveedor/*`, `theme/adc/*`, `theme/bitakora/*`, `contexts/ThemeContext.tsx`, `hooks/useIcon.tsx`.
- Si `components/Layout.tsx` de producción diverge del original, no lo sobreescribas completo: aplica solo el cambio puntual de la sección 6.
- El repo debe usar MUI v5 (`@mui/material`, `@mui/utils` con `deepmerge`).

## 4. Pasos para aplicar el cambio

```bash
# 1. Crear una rama de trabajo
git checkout -b sync/cosmos-colors-figma-final

# 2. Copiar los archivos del paquete preservando la estructura de carpetas
cp <PAQUETE>/ThemeCOSMOS.json <REPO>/ThemeCOSMOS.json
mkdir -p <REPO>/theme/utils
cp <PAQUETE>/theme/utils/resolveToken.ts <REPO>/theme/utils/resolveToken.ts
cp <PAQUETE>/theme/utils/createBrandTheme.ts <REPO>/theme/utils/createBrandTheme.ts
cp <PAQUETE>/theme/base/baseTheme.ts <REPO>/theme/base/baseTheme.ts
cp <PAQUETE>/theme/cosmos/cosmosLightTheme.ts <REPO>/theme/cosmos/cosmosLightTheme.ts
cp <PAQUETE>/theme/cosmos/cosmosDarkTheme.ts <REPO>/theme/cosmos/cosmosDarkTheme.ts
cp <PAQUETE>/components/Layout.tsx <REPO>/components/Layout.tsx

# 3. index.html: aplicar solo el fragmento de la sección 5 dentro de <head>
#    (no sobreescribir el archivo completo).

# 4. Verificar que no haya errores de tipos nuevos
npx tsc --noEmit

# 5. Levantar el entorno y revisar visualmente
npm run dev
```

### Qué revisar visualmente al levantar el proyecto

1. Selector de marca: el punto de color junto a "Cosmos" debe verse azul `#1053b7`.
2. Marca Cosmos, modo Light: `primary.main` = `#1053b7`.
3. Marca Cosmos, modo Dark: `primary.main` = `#81b4ff`.
4. `error`/`warning`/`info`/`success`/`secondary` deben verse distintos entre Light y Dark (en particular, revisar que el texto sobre chips/botones `secondary` en modo Dark use texto oscuro, no blanco).
5. Un `Autocomplete` de tamaño `small` debe verse con el padding correcto en su input (no colapsado ni con espaciado roto).
6. Headers con tipografía Schibsted Grotesk / Inter.

## 5. Fragmento a aplicar en `index.html`

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Inter:wght@300;400;500;600;700&family=Schibsted+Grotesk:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap"
/>
```

## 6. Cambio puntual en `components/Layout.tsx` (si prefieres no sobreescribir el archivo completo)

Imports nuevos:

```tsx
import CosmosTheme from '../ThemeCOSMOS.json';
import { resolveTokenAsString } from '../theme/utils/resolveToken';
```

Dentro de `getBrandColor`:

```tsx
// Antes:
case 'cosmos': return '#6366f1';

// Después:
case 'cosmos': return resolveTokenAsString(CosmosTheme.palette.primary.main.$value, 'Light');
```

## 7. ⚠️ Advertencia — buscar otros consumidores de `brand-colors` o de la estructura antigua de `muiAutocomplete`

**a) Estructura de `brand-colors`:** las familias `grey`, `primary`, `red`, `green`, `orange` y `lightBlue` tienen sub-familias `.light`/`.dark`. Si hay código propio de producción que lea la estructura plana antigua, se rompe:

```bash
grep -rn "brand-colors'\]\." --include="*.ts" --include="*.tsx" .
```

**b) `muiAutocomplete.inputBase` (sin `.small`):** si hay código propio que referencia la ruta plana `_components.muiAutocomplete.inputBase.*` (sin pasar por `small`), debe actualizarse a `_components.muiAutocomplete.small.inputBase.*`:

```bash
grep -rn "muiAutocomplete.inputBase" --include="*.ts" --include="*.tsx" .
```

Cualquier resultado fuera de los archivos ya corregidos en este paquete debe revisarse.

## 8. Checklist de verificación final

- [ ] `npx tsc --noEmit` sin errores nuevos relacionados a `ThemeCOSMOS`, `brand-colors`, `CosmosTheme`, `resolveToken`, `Layout.tsx` o `baseTheme.ts`.
- [ ] `npm run dev` / build levanta sin errores en consola.
- [ ] Swatch de "Cosmos" en el selector de marca: azul `#1053b7`.
- [ ] Marca Cosmos, Light: `primary.main` = `#1053b7`.
- [ ] Marca Cosmos, Dark: `primary.main` = `#81b4ff`.
- [ ] `secondary` en modo Dark usa `contrastText` oscuro (`#212121`), no blanco.
- [ ] Autocomplete `small` con padding correcto en el input.
- [ ] Los greps de la sección 7 no arrojan resultados fuera de los archivos ya corregidos.
- [ ] Headers con tipografía Schibsted Grotesk / Inter.

## 9. Cómo revertir si algo sale mal

```bash
git checkout main -- ThemeCOSMOS.json theme/utils/resolveToken.ts theme/utils/createBrandTheme.ts theme/base/baseTheme.ts theme/cosmos/cosmosLightTheme.ts theme/cosmos/cosmosDarkTheme.ts components/Layout.tsx index.html
git rm theme/utils/resolveToken.ts   # si el archivo no existía antes en main
```

O simplemente no mergear la rama y descartarla.
