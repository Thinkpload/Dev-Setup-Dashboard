#!/bin/bash
# scripts/verify-bmad-agents.sh
# Post-clone smoke test: verifies all 8 core BMAD agents are available as Claude Code slash commands.
# Usage: bash scripts/verify-bmad-agents.sh
# Exit 0 = all agents present; Exit 1 = one or more missing.

SKILLS_BASE=".claude/skills"

REQUIRED_AGENTS=(
  "bmad-pm"
  "bmad-architect"
  "bmad-dev"
  "bmad-qa"
  "bmad-sm"
  "bmad-tech-writer"
  "bmad-ux-designer"
  "bmad-analyst"
)

PASS=0
FAIL=0

echo "🔍 Verifying BMAD agent availability..."
echo ""

for agent in "${REQUIRED_AGENTS[@]}"; do
  skill_dir="${SKILLS_BASE}/${agent}"
  skill_file="${skill_dir}/SKILL.md"
  if [ -d "$skill_dir" ] && [ -f "$skill_file" ]; then
    echo "  ✅ PASS  /${agent}"
    PASS=$((PASS + 1))
  else
    echo "  ❌ FAIL  /${agent}  (expected: ${skill_file})"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "Results: ${PASS} passed, ${FAIL} failed"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "❌ Some agents are missing. Re-clone the repository or restore .claude/skills/."
  exit 1
fi

echo ""
echo "✅ All BMAD agents are available. Config auto-detected from _bmad/bmm/config.yaml."
exit 0
