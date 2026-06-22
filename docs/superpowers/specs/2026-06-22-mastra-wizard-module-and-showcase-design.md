# Design: Mastra wizard module + homepage showcase card

**Date:** 2026-06-22
**Status:** Approved (design); pending implementation plan

## Summary

Add the [Mastra](https://github.com/mastra-ai/mastra) TypeScript AI-agent framework to the template as two decoupled, coordinated pieces:

1. **CLI wizard module** — an optional, opt-in module that installs `@mastra/core` and a minimal starter agent into the target project.
2. **Web showcase card** — a static section on the demo homepage advertising that Mastra is available.

The two are intentionally independent: the card always renders (it advertises the capability); the module installs the capability. Neither touches the existing `src/lib/ai/` provider layer or Inngest.

## Goals

- Make Mastra a first-class, opt-in choice in `npx create-ai-template`.
- Surface Mastra in the demo app's web UI as a display-only showcase.
- Follow existing wizard-module and homepage-section conventions exactly.

## Non-goals (YAGNI)

- No live agent chat in the browser.
- No web-based installer/picker (would require a backend that runs `npm install`).
- No conditional "only render the card when the module is installed" logic.
- No MCP wiring, memory/storage adapters, or `mastra dev` playground script.
- No changes to `src/lib/ai/` or `src/inngest/` (coexist, do not replace).

## Part 1 — CLI wizard module

### Behavior

- Appears as a `nice-to-have` checkbox in the wizard's Q5 multiselect.
- **Not** pre-checked (auth/ORM are separate questions only because they are mutually exclusive; an optional add-on belongs in Q5 and stays opt-in).
- When selected, the installer:
  1. Installs the runtime dependency `@mastra/core`.
  2. Copies the `templates/mastra/` tree into the target project.
  3. Records install state in `.template-config.json` (existing mechanism).

### Installer change (the one structural fix)

The module-install loop at [wizard/src/installer.ts](../../../wizard/src/installer.ts) currently installs only `mod.devDeps`. The `deps` field exists on `ModuleDefinition` but is never installed in the loop — runtime deps are installed only through the special-cased auth/ORM paths. Every existing module has `deps: []`, so the field is presently dead.

Mastra needs a runtime dependency. We make the `deps` field functional by adding a block to the loop, immediately before the existing devDeps install:

```ts
// 0. npm install runtime deps (was previously only handled for auth/ORM)
if (mod.deps.length > 0) {
  npmInstallDeps(mod.deps, targetDir);
}
```

`npmInstallDeps` already exists in the file. This is a targeted, three-line activation of an existing-but-unused field — not new infrastructure. It leaves every current module's behavior unchanged (all have `deps: []`).

### Files touched (wizard)

| File | Change |
|------|--------|
| `wizard/src/dependency-versions.ts` | Add `MASTRA_VERSION` constant, exact-pinned semver with a `// verify: npm info @mastra/core version` comment, under the "AI Tooling" section. |
| `wizard/src/types.ts` | Add `'mastra'` to the `ModuleId` union. |
| `wizard/src/registry.ts` | Add the `mastra` registry entry. |
| `wizard/src/installer.ts` | Add the 3-line `mod.deps` install block to the module loop. |
| `wizard/templates/mastra/src/lib/mastra/index.ts` | Mastra instance + one example Claude-backed agent. |
| `wizard/templates/mastra/src/app/api/mastra/agent/route.ts` | Thin demo route that calls the example agent. |
| `wizard/tests/registry.test.ts` | Assert the `mastra` entry exists and its `templateDir` resolves. |
| `wizard/tests/installer.test.ts` | Assert a module with non-empty `deps` triggers `npmInstallDeps`. |
| `wizard/tests/dependency-versions.test.ts` | Assert `MASTRA_VERSION` is present and exact-pinned (no floating range like `latest`). |

### Registry entry (shape)

```ts
mastra: {
  id: 'mastra',
  label: 'Mastra — TypeScript AI agent framework',
  description: 'Production agents, tools, and workflows with multi-provider + MCP support',
  priority: 'nice-to-have',
  deps: [`@mastra/core@${MASTRA_VERSION}`],
  devDeps: [],
  templateDir: 'templates/mastra',
  postInstall: [],
  conflicts: [],
  deepCopy: true, // nested src/lib/mastra/ and src/app/api/mastra/ paths
}
```

`deepCopy: true` is required because the template contains nested directories, which `copyTemplateDir` (2-level only) does not handle; `copyTemplateDirDeep` does.

### Version pinning

`MASTRA_VERSION` must be an exact pinned version (caret-pinned semver, matching the file's existing style, e.g. `'^X.Y.Z'`). The exact value is resolved at implementation time via `npm info @mastra/core version`; the weekly version-bump CI cron maintains it thereafter. Do not use `latest` or any floating specifier — the CI grep check rejects it.

### Template starter (minimal)

- `src/lib/mastra/index.ts`: construct a `Mastra` instance with a single example agent named `assistant`, backed by Anthropic/Claude (matching the template's Claude-centric default). Reads the API key from the environment.
- `src/app/api/mastra/agent/route.ts`: a `POST` handler that takes a prompt, calls the `assistant` agent, and returns its response. Minimal — demonstrates wiring, not a production endpoint.

These files coexist with `src/lib/ai/` and `src/inngest/`; nothing is removed or rewired.

## Part 2 — Web showcase card (display only)

### Behavior

A new static section on the demo homepage announcing Mastra. Always renders, regardless of whether the wizard module was installed (decoupled, by design).

### Component

`src/components/features/MastraShowcase.tsx`:

- Server component (no `'use client'`, no state, no fetch) — it is static display.
- Matches the homepage's slate/cyan aesthetic (mirrors the markup idiom of [HelperFeatureStrip](../../../src/components/features/HelperFeatureStrip.tsx)), **not** the older purple `FeatureCard`/`CodeBlock`.
- Content (inlined as a const, like `HELPER_FEATURES` — no separate data file):
  - Eyebrow label (uppercase tracked), e.g. "AI agents".
  - Heading.
  - Short description of Mastra.
  - 2–3 capability bullets (agents, workflows, MCP/multi-provider).
  - An inline install-command snippet (slate/cyan inline `<code>` styling, matching the strip), e.g. the wizard-selectable install hint.
  - An external "Read the docs" link to `https://mastra.ai` with `target="_blank"` + `rel="noopener noreferrer"`.
- Section has an `id` and `aria-labelledby` for accessibility, consistent with sibling sections.

### Wire-in

Import into [src/app/page.tsx](../../../src/app/page.tsx) and render between the `SkillChooserPanel` section and `HelperFeatureStrip`.

### Tests

- `src/components/features/__tests__/MastraShowcase.test.tsx`: assert the heading, the install-command text, and the docs link (href + accessible name) render. Follows the existing `__tests__` pattern.
- [src/app/__tests__/page.test.tsx](../../../src/app/__tests__/page.test.tsx): update only if it asserts exact section ordering/structure; otherwise leave untouched.

## Architecture / data flow

- **Wizard module:** pure data (`registry.ts`) consumed by the installer; no runtime coupling to the app. Install path: select in Q5 → `runInstaller` loop → `npmInstallDeps(mod.deps)` + `copyTemplateDirDeep` → state saved.
- **Showcase card:** static React server component composed into the homepage tree. No props, no data dependencies, no network.
- The two share only a name and marketing copy; there is no code dependency between them.

## Error handling

- Wizard: existing fail-late pattern in `runInstaller` already handles a failed `npmInstall`/copy per module (records `failed`, shows consolidated error + fix command). The new `deps` install reuses `npmInstallDeps`, which already throws on non-zero exit, so it is caught by the same try/catch. No new error paths.
- Showcase card: static render, no failure modes.

## Verification / success criteria

1. Root: `npm test` green including the new `MastraShowcase` test; `npm run lint` and `npm run type-check` clean.
2. Wizard: `cd wizard && npm test` green including the new `deps`-install assertion; `npm run build` (tsup) clean with the `ModuleId` union extended.
3. Manual wizard: run against a scratch dir, select Mastra, confirm `@mastra/core` lands in `dependencies` (not `devDependencies`) and the two source files are copied.
4. Manual web: `npm run dev`, confirm the Mastra showcase card renders between the Skill Chooser and the helper strip, with a working docs link.

## Open implementation detail

- Exact `@mastra/core` version to pin (resolve via `npm info @mastra/core version` at implementation time).
