---
name: mui-implementation
description: >
  Implement approved product UI using Material UI (MUI) while preserving the
  existing theme, tokens, components, patterns, and application architecture.
  Use this skill whenever creating, modifying, or refactoring React UI built
  with MUI. Prefer native MUI capabilities and existing project primitives.
  Never recreate functionality or visual tokens that already exist in MUI
  or in the project's design system.
---

# MUI Implementation

Implement UI using the project's existing Material UI system.

This skill governs **implementation decisions**, not visual design decisions.

The objective is to produce maintainable React code that:

* uses MUI correctly;
* respects the existing theme;
* reuses available components and patterns;
* avoids unnecessary custom CSS;
* avoids hardcoded design values;
* preserves accessibility and responsive behavior;
* remains easy to evolve through the design system.

---

# Core principle

> Use the system before creating anything new.

Before implementing a UI element, determine whether the requirement is already solved by:

1. an existing project component;
2. a native MUI component;
3. a native MUI prop or variant;
4. the current theme;
5. an existing project pattern;
6. composition of existing MUI components.

Create a new primitive only when none of these adequately solves the requirement.

---

# 1. Inspect before implementing

Before writing UI code, inspect the relevant project context.

Identify:

* the MUI version;
* theme configuration;
* palette;
* typography;
* spacing;
* breakpoints;
* shape;
* shadows;
* component overrides;
* component variants;
* existing shared components;
* existing layout primitives;
* established implementation patterns;
* icons already in use;
* existing responsive conventions.

Do not assume MUI defaults when the application already defines its own behavior.

Do not replace an existing project convention with a different MUI approach simply because both are valid.

When MUI documentation or API information is required, use the available MUI documentation source/MCP rather than relying on memory.

---

# 2. Theme is the source of truth

Never duplicate values already represented by the theme.

Prefer semantic theme references.

## Prefer

```tsx
<Box
  sx={{
    color: 'text.primary',
    bgcolor: 'background.paper',
    borderColor: 'divider',
    borderRadius: 2,
    p: 2,
  }}
/>
```

## Avoid

```tsx
<Box
  sx={{
    color: '#202124',
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderRadius: '8px',
    padding: '16px',
  }}
/>
```

Use values from:

```txt
theme.palette
theme.typography
theme.spacing
theme.shape
theme.breakpoints
theme.shadows
theme.transitions
theme.zIndex
theme.components
```

and any custom tokens already defined by the project.

Never introduce a parallel token system inside feature code.

---

# 3. Do not hardcode design values

Avoid raw design values when an equivalent theme token exists.

This applies especially to:

* colors;
* spacing;
* typography;
* border radius;
* shadows;
* breakpoints;
* transitions;
* z-index;
* component dimensions.

## Colors

Prefer:

```tsx
color: 'text.secondary'
bgcolor: 'background.default'
borderColor: 'divider'
color: 'primary.main'
```

Avoid:

```tsx
color: '#667085'
background: '#F7F8FA'
```

Raw colors are acceptable only when they represent external content that is intentionally outside the design system, such as user-defined colors, charts with domain-specific values, imported brand assets, or data visualization values explicitly supplied by the product.

---

# 4. Use MUI spacing

Use the spacing scale already configured in the theme.

Prefer:

```tsx
sx={{
  p: 2,
  px: 3,
  gap: 1.5,
  mt: 2,
}}
```

Avoid arbitrary pixel spacing:

```tsx
sx={{
  padding: '17px',
  gap: '13px',
  marginTop: '21px',
}}
```

If the requested layout cannot be represented reasonably by the current scale, investigate the design or theme before introducing arbitrary spacing.

---

# 5. Use theme typography

Use MUI `Typography` and existing typography variants.

Prefer:

```tsx
<Typography variant="h6">
  Page title
</Typography>

<Typography variant="body2" color="text.secondary">
  Supporting information
</Typography>
```

Avoid recreating theme typography manually:

```tsx
<Box
  sx={{
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.4,
  }}
>
  Page title
</Box>
```

Do not invent font sizes or font weights when an existing typography variant is appropriate.

---

# 6. Prefer native MUI components

Use semantic MUI components instead of rebuilding them with generic containers.

Prefer:

```txt
Button
IconButton
TextField
Select
Autocomplete
Checkbox
Radio
Switch
Tabs
Chip
Alert
Dialog
Drawer
Menu
Tooltip
Snackbar
Table
Card
Accordion
List
Avatar
Skeleton
Pagination
Breadcrumbs
```

instead of manually reproducing equivalent controls with `Box`, `div`, custom CSS, or custom event handling.

Example:

Prefer:

```tsx
<Button variant="contained">
  Save
</Button>
```

Avoid:

```tsx
<Box
  component="button"
  onClick={handleSave}
  sx={...}
>
  Save
</Box>
```

Do not recreate behavior that MUI already provides.

This includes:

* focus management;
* keyboard interaction;
* ARIA behavior;
* disabled behavior;
* overlays;
* menus;
* modal behavior;
* form states;
* input behavior;
* selection behavior.

---

# 7. Prefer props before style overrides

Before adding `sx`, check whether the component already exposes a prop for the requirement.

Prefer:

```tsx
<Button
  variant="outlined"
  size="small"
  color="primary"
/>
```

over manually recreating those variants with `sx`.

Prefer:

```tsx
<Stack
  direction="row"
  spacing={2}
  alignItems="center"
/>
```

over unnecessary custom flex CSS.

Use native component APIs first.

---

# 8. Styling hierarchy

Use the narrowest appropriate customization mechanism.

Follow this hierarchy:

### Existing project component

Use it directly.

### Native MUI props

Use the component API.

### `sx`

Use for local, contextual, one-off layout or styling.

### Reusable component

Create or extend a reusable component when the same behavior or presentation appears repeatedly.

### Theme variant / styleOverride

Use when a styling rule should apply systematically across the application.

### `styled()`

Use when building a meaningful reusable abstraction that requires more complex styling behavior.

### Global CSS

Use only when the requirement genuinely cannot be handled through the component/theme system.

Do not jump directly to custom CSS.

MUI explicitly recommends matching customization scope to the mechanism: local changes with `sx`, reusable abstractions for repeated cases, and global behavior through the theme.

---

# 9. Use `sx` correctly

`sx` is appropriate for contextual styling and layout.

Good:

```tsx
<Card
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: 3,
  }}
>
```

Avoid turning `sx` into an isolated mini design system.

Bad:

```tsx
<Button
  sx={{
    height: '39px',
    padding: '7px 14px',
    borderRadius: '7px',
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '14px',
    backgroundColor: '#1267E5',
  }}
>
```

If many instances require the same `sx`, promote that behavior to an existing reusable component, component variant, or theme configuration.

---

# 10. Preserve component variants

Before styling a component, inspect whether the project already defines custom variants.

For example:

```tsx
<Button variant="contained" />
<Button variant="outlined" />
<Button variant="text" />
```

or project-specific variants exposed through theme augmentation.

Do not visually reconstruct an existing variant using `sx`.

If a missing visual treatment is genuinely reusable, consider defining a proper variant instead of copying styles between instances.

---

# 11. Respect theme component configuration

Check:

```tsx
theme.components
```

before overriding MUI components locally.

Existing configuration may already define:

* `defaultProps`;
* `styleOverrides`;
* `variants`.

Local implementation should inherit these decisions rather than duplicate them.

MUI's `components` configuration exists specifically to centralize component defaults, styling and variants.

---

# 12. Layout with MUI primitives

Prefer the project's established layout conventions.

Common primitives include:

```txt
Box
Stack
Grid
Container
Paper
Divider
```

Use the simplest primitive that expresses the structure clearly.

Use:

```tsx
<Stack spacing={2}>
```

for one-dimensional groups.

Use:

```tsx
<Stack direction="row" spacing={1}>
```

for horizontal groups.

Use the project's supported MUI Grid API for grid-based layouts.

Use `Box` when a neutral container is genuinely appropriate.

Do not use `Box` indiscriminately for everything.

---

# 13. Responsive behavior

Use theme breakpoints rather than raw media queries.

Prefer:

```tsx
sx={{
  px: {
    xs: 2,
    md: 3,
  },
}}
```

or:

```tsx
sx={{
  display: {
    xs: 'none',
    md: 'block',
  },
}}
```

Avoid:

```css
@media (min-width: 768px)
```

unless the project explicitly uses custom media queries outside the MUI breakpoint system.

Respect custom breakpoints defined by the application's theme.

---

# 14. Dark and light modes

Never implement light/dark behavior using manually duplicated colors when the theme already supports color modes.

Prefer semantic values:

```tsx
bgcolor: 'background.paper'
color: 'text.primary'
borderColor: 'divider'
```

instead of conditional raw colors:

```tsx
backgroundColor: mode === 'dark' ? '#111' : '#fff'
```

When explicit mode-dependent styling is genuinely necessary, use the project's established theme/color-scheme API.

Do not create a parallel dark-mode implementation.

---

# 15. Icons

Reuse the project's established icon library.

If the project uses MUI Icons, use existing icons from that library.

Do not:

* draw SVG icons manually when an equivalent icon exists;
* substitute icons from random libraries;
* use emoji as interface icons;
* mix icon families without an explicit design decision.

Respect icon sizing and color through the theme and component APIs.

---

# 16. States are part of the component

Every interactive implementation must consider relevant states.

Depending on the component:

* default;
* hover;
* focus-visible;
* active;
* selected;
* disabled;
* loading;
* error;
* empty;
* read-only.

Use MUI's native state behavior whenever possible.

Do not implement custom state behavior if the component already supports it.

---

# 17. Forms

Use MUI form primitives and APIs.

Prefer:

```txt
TextField
FormControl
FormLabel
FormHelperText
Select
Autocomplete
Checkbox
RadioGroup
Switch
```

Use native props for:

```txt
error
disabled
required
helperText
size
variant
```

Do not manually style input borders, labels, errors, focus states, or disabled states unless the design system explicitly requires behavior not provided by the current theme.

---

# 18. Accessibility

Preserve MUI's accessible behavior.

Do not remove:

* focus indicators;
* labels;
* keyboard behavior;
* semantic roles;
* ARIA relationships.

Use semantic controls.

Icon-only actions require accessible names.

Example:

```tsx
<IconButton aria-label="Delete item">
  <DeleteIcon />
</IconButton>
```

Inputs require visible labels or appropriate accessible labeling.

Do not use clickable `Box` or `div` elements when `Button`, `IconButton`, `Link`, or another semantic control is appropriate.

---

# 19. Reuse existing project components

Before creating a new abstraction, search the repository.

Look for components serving the same or substantially similar purpose.

Prefer adapting through supported props or composition instead of duplicating the component.

Do not create:

```txt
CustomButton
PrimaryButton
NewButton
AppButton2
CustomCard
StyledTextField
```

unless the abstraction represents a genuine reusable product concept not already solved by the design system.

---

# 20. Custom components

Creating custom components is allowed when the UI represents a meaningful product abstraction rather than a reimplementation of MUI.

A custom component should ideally be composed from MUI primitives.

Example:

```tsx
function ProjectStatus({ status }) {
  return (
    <Chip
      size="small"
      label={status.label}
      color={status.color}
    />
  );
}
```

The custom component owns domain behavior.

MUI owns the generic UI primitive.

If a custom component must participate deeply in theming, use the supported MUI theming mechanisms rather than an isolated styling architecture.

---

# 21. Do not fork MUI unnecessarily

Do not reproduce a MUI component internally simply to change its appearance.

Avoid copying MUI markup or reconstructing controls from lower-level DOM elements.

Extend through:

* props;
* slots;
* `slotProps`;
* composition;
* variants;
* theme overrides;
* reusable wrappers.

Use the public API supported by the installed MUI version.

---

# 22. Do not invent APIs

Never assume that a MUI component supports a prop, slot, variant, component, or API.

When uncertain:

1. inspect the installed version;
2. consult current MUI documentation/API;
3. implement only supported APIs.

Do not generate plausible-looking MUI syntax from memory when it can be verified.

---

# 23. Preserve application architecture

Do not modify:

* the theme structure;
* design tokens;
* shared components;
* application providers;
* global CSS;
* package dependencies;
* routing;
* state architecture;

unless the requested implementation genuinely requires it.

A page-level UI task should not silently become a design-system refactor.

If a systemic change appears necessary, identify it separately instead of embedding it invisibly into feature code.

---

# 24. Avoid unnecessary dependencies

Do not install another UI library to solve something already supported by MUI.

Do not introduce:

* another component system;
* another styling framework;
* another icon library;
* another layout framework;

without an explicit requirement.

MUI remains the primary UI implementation layer.

---

# 25. Imports

Follow the repository's established import convention.

If no convention exists, prefer direct component imports:

```tsx
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
```

and:

```tsx
import DeleteIcon from '@mui/icons-material/Delete';
```

Current MUI documentation recommends path imports particularly because barrel imports can increase development startup and rebuild cost.

Do not rewrite an entire repository's imports as part of an unrelated UI task.

---

# 26. Visual implementation fidelity

When implementing from an approved design:

* preserve hierarchy;
* preserve grouping;
* preserve content relationships;
* preserve responsive intent;
* use the closest existing MUI/system primitive;
* resolve visual differences through the design system before adding local hacks.

Do not redesign the screen during implementation.

If the design requires something inconsistent with the existing system, identify the conflict rather than silently inventing a workaround.

---

# 27. Avoid magic numbers

A magic number is a raw value introduced only to visually force an element into position.

Avoid:

```tsx
top: '13px'
left: '7px'
width: '317px'
marginLeft: '11px'
transform: 'translateY(3px)'
```

unless the value is intrinsic to the specific implementation and cannot reasonably come from the theme or layout system.

Prefer structural layout over positional corrections.

If several magic numbers are required to reproduce the design, reconsider the composition.

---

# 28. Avoid CSS patches

Do not solve layout problems through accumulating overrides such as:

```tsx
'& .MuiSomething-root': {
  ...
}
```

unless targeting a documented MUI slot is actually required.

Prefer component APIs, slots and composition first.

Never target generated MUI class names such as:

```css
.css-1abc123-MuiButton-root
```

Generated class names are unstable.

When class targeting is necessary, use documented global slot classes.

---

# 29. Implementation decision order

For each UI requirement, reason in this order:

```txt
Does the project already have this?
        ↓
Does MUI already have this?
        ↓
Can the existing component API express it?
        ↓
Can existing MUI components be composed to express it?
        ↓
Can a local theme-aware sx adjustment solve it?
        ↓
Is this repeated enough to become a reusable component?
        ↓
Should it become a theme variant or override?
        ↓
Only then consider custom implementation.
```

Do not reverse this order.

---

# 30. Definition of done

Before considering the implementation complete, verify:

## MUI

* Native MUI components are used where appropriate.
* No MUI component has been unnecessarily recreated.
* Only APIs supported by the installed MUI version are used.

## Theme

* Existing palette tokens are respected.
* Existing typography is respected.
* Existing spacing is respected.
* Existing radius and shape are respected.
* Existing breakpoints are respected.
* Existing component overrides and variants are respected.
* Light/dark behavior comes from the theme.

## Hardcoding

* No unnecessary raw colors.
* No duplicated typography values.
* No arbitrary spacing when tokens exist.
* No unnecessary pixel dimensions.
* No magic positioning values.

## Reuse

* Existing shared components were checked first.
* Repeated styling has not been copied unnecessarily.
* New abstractions have a clear reason to exist.

## Interaction

* Relevant states are supported.
* Loading/error/disabled behavior uses existing component APIs where possible.

## Accessibility

* Semantic controls are used.
* Keyboard behavior remains available.
* Focus-visible behavior remains intact.
* Inputs and icon actions have accessible labels.

## Architecture

* No unrelated design-system changes were introduced.
* No unnecessary dependency was added.
* No parallel styling or token system was created.

---

# 31. Implementation behavior

When asked to implement or modify UI:

1. inspect existing code and theme;
2. identify reusable project components;
3. map requirements to native MUI components;
4. implement using existing tokens and component APIs;
5. add the minimum necessary local customization;
6. verify responsive behavior and states;
7. remove duplicated or hardcoded styling;
8. verify accessibility;
9. report any requirement that cannot be represented cleanly by the existing system.

Do not invent missing design decisions unless explicitly asked to design.

When ambiguity exists, prefer the behavior already established elsewhere in the application.

---

# Final rule

The quality of a MUI implementation is not measured by how much custom styling it contains.

A strong implementation usually contains **less custom UI code** because it correctly leverages:

* MUI;
* the theme;
* existing components;
* existing variants;
* existing tokens;
* composition.

Use MUI as a system, not merely as a collection of React components.
