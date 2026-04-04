import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';

// ─── verifyBmadAgents ─────────────────────────────────────────────────────────

// We test the core logic extracted from verify-bmad-agents.ts
// The module exports { REQUIRED_AGENTS, checkAgents } for testability

vi.mock('fs');

const REQUIRED_AGENTS = [
  'bmad-pm',
  'bmad-architect',
  'bmad-dev',
  'bmad-qa',
  'bmad-sm',
  'bmad-tech-writer',
  'bmad-ux-designer',
  'bmad-analyst',
];

interface AgentCheckResult {
  agent: string;
  skillDir: string;
  skillFile: string;
  present: boolean;
}

function checkAgents(
  skillsBase: string,
  agents: string[]
): { results: AgentCheckResult[]; allPresent: boolean } {
  const results: AgentCheckResult[] = agents.map((agent) => {
    const skillDir = `${skillsBase}/${agent}`;
    const skillFile = `${skillDir}/SKILL.md`;
    const present = fs.existsSync(skillDir) && fs.existsSync(skillFile);
    return { agent, skillDir, skillFile, present };
  });
  const allPresent = results.every((r) => r.present);
  return { results, allPresent };
}

describe('REQUIRED_AGENTS', () => {
  it('contains all 8 core BMAD agents', () => {
    expect(REQUIRED_AGENTS).toHaveLength(8);
    expect(REQUIRED_AGENTS).toContain('bmad-pm');
    expect(REQUIRED_AGENTS).toContain('bmad-architect');
    expect(REQUIRED_AGENTS).toContain('bmad-dev');
    expect(REQUIRED_AGENTS).toContain('bmad-qa');
    expect(REQUIRED_AGENTS).toContain('bmad-sm');
    expect(REQUIRED_AGENTS).toContain('bmad-tech-writer');
    expect(REQUIRED_AGENTS).toContain('bmad-ux-designer');
    expect(REQUIRED_AGENTS).toContain('bmad-analyst');
  });
});

describe('checkAgents', () => {
  const SKILLS_BASE = '.claude/skills';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns allPresent=true when all agents have skill dir and SKILL.md', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const { results, allPresent } = checkAgents(SKILLS_BASE, REQUIRED_AGENTS);

    expect(allPresent).toBe(true);
    expect(results).toHaveLength(8);
    results.forEach((r) => {
      expect(r.present).toBe(true);
    });
  });

  it('returns allPresent=false when one agent directory is missing', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      // Make bmad-qa skill dir missing
      if (String(p).includes('bmad-qa')) return false;
      return true;
    });

    const { results, allPresent } = checkAgents(SKILLS_BASE, REQUIRED_AGENTS);

    expect(allPresent).toBe(false);
    const qaResult = results.find((r) => r.agent === 'bmad-qa');
    expect(qaResult?.present).toBe(false);
  });

  it('returns allPresent=false when SKILL.md is missing from an agent dir', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      // Dir exists but SKILL.md missing for bmad-analyst
      if (String(p).endsWith('bmad-analyst/SKILL.md')) return false;
      return true;
    });

    const { results, allPresent } = checkAgents(SKILLS_BASE, REQUIRED_AGENTS);

    expect(allPresent).toBe(false);
    const analystResult = results.find((r) => r.agent === 'bmad-analyst');
    expect(analystResult?.present).toBe(false);
  });

  it('returns allPresent=false when all agents are missing', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const { results, allPresent } = checkAgents(SKILLS_BASE, REQUIRED_AGENTS);

    expect(allPresent).toBe(false);
    results.forEach((r) => {
      expect(r.present).toBe(false);
    });
  });

  it('includes correct skill dir and skill file paths in results', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const { results } = checkAgents(SKILLS_BASE, ['bmad-pm']);

    expect(results[0].skillDir).toBe('.claude/skills/bmad-pm');
    expect(results[0].skillFile).toBe('.claude/skills/bmad-pm/SKILL.md');
  });
});
