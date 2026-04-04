# ADR-001: Contribution Model

**Date:** 2026-04-04
**Status:** Accepted

## Context

An open-source template project needs a sustainable contribution model that balances quality control with low friction for contributors. Without a defined model, PRs accumulate without review, contributors don't know the process, and maintainers burn out on unstructured triage. The project targets a broad developer audience — from beginners to seniors — so the bar for contributing must be clear and achievable.

## Decision

Adopt an open contribution model: any GitHub user may fork the repository and submit a pull request. No CLA is required. The maintainer (@Thinkpload) commits to reviewing PRs within 48 hours. All contributions must follow the process documented in `CONTRIBUTING.md`. CODEOWNERS auto-assigns reviewers based on changed files, ensuring no PR goes unreviewed.

## Consequences

**Positive:**

- Low barrier to entry encourages community growth and diverse contributions.
- 48h review SLA sets clear expectations and keeps the project momentum high.
- CODEOWNERS automation reduces manual reviewer assignment overhead.
- CONTRIBUTING.md provides a single source of truth for the process.

**Negative:**

- Maintainer must actively monitor PRs to honor the 48h SLA.
- Open model may attract low-quality or off-scope contributions that require triage time.
- As the project scales beyond one maintainer, CODEOWNERS will need updating.

## Alternatives Considered

| Option                                  | Reason Not Chosen                                                                   |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| Invite-only contributors                | Too restrictive for a community template — would limit ecosystem growth             |
| CLA (Contributor License Agreement)     | Adds legal friction that discourages small contributions from individual developers |
| No review process (merge on CI pass)    | Quality risk — automated checks cannot catch architectural or design issues         |
| GitHub org team with rotating reviewers | Premature for a single-maintainer project at this stage                             |
