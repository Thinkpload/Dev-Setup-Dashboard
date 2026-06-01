# Skill Chooser + Dev Setup Helper Design

## Goal

Pivot the public homepage from a generic AI template landing page into a lightweight web-app MVP that helps a developer:

1. choose the right BMAD or Copilot workflow/skill path for their situation
2. choose a project setup starting point
3. leave with concrete next steps they can run locally

This scope is intentionally limited to a homepage MVP with no auth, persistence, backend writes, or dashboard changes.

## Approaches Considered

### 1. Marketing-only reposition

Replace the homepage copy and visuals but keep the page static.

Pros: fastest change, lowest risk.
Cons: does not actually help the user make a choice.

### 2. Interactive homepage helper MVP

Keep the work inside the existing homepage route and add an in-browser chooser with guided recommendation output.

Pros: useful immediately, minimal surface area, easy to test, no backend needed.
Cons: recommendations are rule-based and not saved.

### 3. Full product flow

Add a multi-step app flow with persistence, auth, and dashboard integration.

Pros: strongest foundation for future growth.
Cons: significantly larger scope than the current pivot request.

## Chosen Approach

Approach 2.

The homepage becomes a focused interactive helper. It should feel like a product, not a brochure, while staying isolated to a small implementation slice.

## User Experience

The page has three stacked sections:

1. A hero that explains the value proposition: choose the right path, then start the project correctly.
2. An interactive chooser card where the user picks:
   - what they are trying to do
   - how much guidance they want
   - the project type they want to start
3. A recommendation panel that returns:
   - best-fit workflow or skill path
   - why that path fits
   - concrete next steps
   - a suggested command or route into the repo

Supporting content below the helper reinforces trust with short capability cards instead of the old template feature grid.

## Recommendation Logic

The MVP uses client-side rule-based mapping.

Inputs:
- intent: brainstorm, quick-build, structured-spec, debug, review
- guidance level: fast, balanced, rigorous
- project type: web app, api, ai feature, brownfield improvement

Outputs:
- primary path label
- supporting explanation
- 3-step action list
- suggested command or repo starting point

No external calls are required.

## Component Plan

- `SkillChooserHero`: headline, supporting copy, primary CTA anchor
- `SkillChooserPanel`: segmented option controls for the three inputs
- `RecommendationCard`: derived recommendation with action list
- `HelperFeatureStrip`: small supporting cards for trust and clarity

These components live under the existing feature component area and are composed by the homepage.

## Data Shape

Use a local typed configuration object or small mapping function in the feature layer.

The data model needs:
- input option unions
- recommendation result type
- deterministic selector function

This keeps the MVP testable and makes future extraction to server logic straightforward.

## Testing

- Add a focused component test for the recommendation flow.
- Add a page-level test that asserts the pivoted homepage renders the helper experience.
- Validate with lint, targeted tests, and type-check.

## Non-Goals

- authentication
- saved sessions
- dashboard integration
- live AI recommendations
- backend API routes

## Ambiguity Resolution

"Skill chooser and dev set up project helper web-app" is interpreted as a web-facing interactive assistant on the homepage, not a replacement for the CLI wizard and not a new authenticated product area.