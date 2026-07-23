# Bitcraft CSS Convention

How every project's stylesheet relates to `globals.css`.

## The split

**`globals.css`** is the only source of truth for shared design tokens
(`--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`) and raw
element resets (`h1`, `p`, `button`, form controls, etc). It's copied
unmodified into every project. New tokens that make sense across *all*
Bitcraft products go here, not into a project file.

**`{project}.css`** (e.g. `toolshare.css`) is project-specific. It always
starts with `@import "./globals.css";` and only ever does three things:

1. **Retheme shared tokens** — reassign new *values* to variable names
   that already exist in `globals.css` (`--color-primary-500`,
   `--font-heading`, `--radius-md`...) inside `:root`/`.dark`. Never
   invent a second name for something globals.css already names.
2. **Add net-new project tokens**, namespaced `--{proj}-*`, only for
   concepts globals.css has no equivalent for (a brand-only gradient, a
   secondary accent color, a type-scale step globals doesn't define).
3. **Add project-only components**, namespaced `.{proj}-*`, built
   exclusively from (1) shared tokens and (2) that project's own
   namespaced tokens.

## Hard rules

- **One naming scheme.** Don't let a shadcn-style `--background/--card/--primary`
  system sit next to the `--color-*` system. Pick the shared one and
  retheme its values.
- **No re-declaring `@theme inline`.** `globals.css` maps every token to a
  Tailwind utility once. A project file changes the *value* behind a
  token; it doesn't need to redo the mapping.
- **Every `var(--x)` must resolve.** If a project file uses `var(--ts-wire)`,
  `--ts-wire` must be defined in that file (or globals.css) before use.
  Undefined custom properties fail silently — no error, just a broken
  rule — so this is easy to violate without noticing. (This is exactly
  what was wrong with the original `toolshare.css`: ~30 `--ts-*` variables
  were referenced but never defined.)
- **No dead code.** Commented-out blocks, unused aliases, and abandoned
  experiments don't ship in the project file — delete them.

## Why alias tokens instead of hardcoding

Project components often want brand-flavored names (`--ts-bright`,
`--ts-dust`, `--ts-wire`) because they read better in component CSS than
`--color-foreground` does. That's fine — but define them as aliases
pointing at the shared token (`--ts-dust: var(--color-muted-foreground);`)
rather than as a fresh hardcoded value. Retheming the shared token then
still retheme's the alias for free.

## Checklist for a new project file

- [ ] `@import "./globals.css";` is the first line
- [ ] Every overridden variable already exists in `globals.css`
- [ ] Every new variable is namespaced `--{proj}-*`
- [ ] No variable is used before it's defined somewhere in scope
- [ ] No parallel color/radius/spacing naming scheme
- [ ] No `@theme inline` block
- [ ] No commented-out or unused rules
