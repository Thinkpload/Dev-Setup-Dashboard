# Skill Chooser + Dev Setup Helper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic homepage with an interactive helper that recommends a workflow path and setup steps for developers.

**Architecture:** Keep the change isolated to the public homepage and feature components. Use a typed, local recommendation engine with no server calls, render it inside a new helper component, and verify it through focused component and page tests.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Vitest, Testing Library

---

### Task 1: Recommendation flow test and selector

**Files:**
- Create: `src/components/features/__tests__/SkillChooserPanel.test.tsx`
- Create: `src/components/features/skill-chooser-data.ts`
- Create: `src/components/features/SkillChooserPanel.tsx`

- [ ] Step 1: Write a failing test that renders the helper and verifies the default recommendation plus an updated recommendation after changing the selections.
- [ ] Step 2: Run `npm test -- src/components/features/__tests__/SkillChooserPanel.test.tsx` and confirm it fails because the helper does not exist yet.
- [ ] Step 3: Add the minimal typed recommendation mapping and helper component to satisfy the test.
- [ ] Step 4: Re-run `npm test -- src/components/features/__tests__/SkillChooserPanel.test.tsx` and confirm it passes.

### Task 2: Homepage composition

**Files:**
- Create: `src/components/features/SkillChooserHero.tsx`
- Create: `src/components/features/HelperFeatureStrip.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/shared/Navbar.tsx`

- [ ] Step 1: Add a page-level failing test that asserts the homepage now renders the chooser-first experience.
- [ ] Step 2: Run the page test and confirm it fails for the current marketing page.
- [ ] Step 3: Swap the homepage composition to the new hero, chooser panel, and supporting strip.
- [ ] Step 4: Re-run the page test and confirm it passes.

### Task 3: Focused verification

**Files:**
- Test: `src/components/features/__tests__/SkillChooserPanel.test.tsx`
- Test: `src/app/__tests__/page.test.tsx`

- [ ] Step 1: Run the focused homepage tests.
- [ ] Step 2: Run `npm run lint`.
- [ ] Step 3: Run `npm run type-check`.