export type SkillIntent = 'brainstorm' | 'quick-build' | 'structured-spec' | 'debug' | 'review';
export type GuidanceLevel = 'fast' | 'balanced' | 'rigorous';
export type ProjectType = 'web-app' | 'api' | 'ai-feature' | 'brownfield';

export interface SkillChooserSelection {
  intent: SkillIntent;
  guidance: GuidanceLevel;
  projectType: ProjectType;
}

export interface SkillRecommendation {
  title: string;
  primaryPath: string;
  description: string;
  nextSteps: string[];
  suggestedStartingPoint: string;
}

export const INTENT_OPTIONS: Array<{ value: SkillIntent; label: string }> = [
  { value: 'brainstorm', label: 'Shape a new idea' },
  { value: 'quick-build', label: 'Build something quickly' },
  { value: 'structured-spec', label: 'Write a structured plan' },
  { value: 'debug', label: 'Debug an issue' },
  { value: 'review', label: 'Review existing work' },
];

export const GUIDANCE_OPTIONS: Array<{ value: GuidanceLevel; label: string }> = [
  { value: 'fast', label: 'Fast' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'rigorous', label: 'Rigorous' },
];

export const PROJECT_TYPE_OPTIONS: Array<{ value: ProjectType; label: string }> = [
  { value: 'web-app', label: 'Web app' },
  { value: 'api', label: 'API' },
  { value: 'ai-feature', label: 'AI feature' },
  { value: 'brownfield', label: 'Brownfield improvement' },
];

export const DEFAULT_SELECTION: SkillChooserSelection = {
  intent: 'brainstorm',
  guidance: 'balanced',
  projectType: 'web-app',
};

export function getSkillRecommendation(selection: SkillChooserSelection): SkillRecommendation {
  if (selection.intent === 'debug') {
    return {
      title: 'Debug methodically before changing code',
      primaryPath: 'systematic-debugging',
      description:
        selection.projectType === 'brownfield'
          ? 'Start from the failing behavior, isolate the controlling path, and only then patch the existing product.'
          : 'Use a disciplined repro-first loop so fixes stay small and defensible.',
      nextSteps: [
        'Write the smallest repro or failing test.',
        selection.guidance === 'rigorous'
          ? 'Inspect the nearest controlling code path before editing.'
          : 'Check the nearest owning code path before editing.',
        'Apply the smallest fix and re-run the same validation.',
      ],
      suggestedStartingPoint: 'Use the debugging workflow skill before implementation work.',
    };
  }

  if (selection.intent === 'quick-build') {
    return {
      title: 'Move quickly with a constrained implementation slice',
      primaryPath: 'bmad-quick-dev-new-preview',
      description:
        'Skip heavyweight planning, but keep the change bounded to one user-visible outcome and one focused verification loop.',
      nextSteps: [
        'Choose the smallest useful user-facing outcome.',
        'Implement it inside the nearest existing route or component slice.',
        'Validate with focused tests before widening scope.',
      ],
      suggestedStartingPoint:
        'Open the target route or component and implement the smallest vertical slice.',
    };
  }

  if (selection.intent === 'structured-spec') {
    return {
      title: 'Capture the work as a formal spec before coding',
      primaryPath: 'writing-plans',
      description:
        'Use a written design and execution plan when the change has multiple steps, dependencies, or handoff value.',
      nextSteps: [
        'Write the feature design in docs/superpowers/specs.',
        'Translate it into a task-based implementation plan.',
        'Execute the plan with one validation checkpoint per task.',
      ],
      suggestedStartingPoint:
        'Start in docs/superpowers/specs, then create a matching plan under docs/superpowers/plans.',
    };
  }

  if (selection.intent === 'review') {
    return {
      title: 'Review for risk before you refine the code',
      primaryPath: 'bmad-code-review',
      description:
        'Treat the problem as a quality exercise first: identify regressions, edge cases, and missing validation before editing.',
      nextSteps: [
        'Read the touched behavior and recent diff with a bug-finding mindset.',
        'List concrete findings ordered by severity.',
        'Only implement the fixes backed by those findings.',
      ],
      suggestedStartingPoint: 'Run a review pass before changing the implementation slice.',
    };
  }

  return {
    title: 'Brainstorm first with a guided spec',
    primaryPath: 'brainstorming',
    description:
      selection.guidance === 'rigorous'
        ? 'Clarify intent, scope, and user value before writing code so the implementation stays tight.'
        : 'Use a short structured design pass to pick the right workflow and avoid building the wrong thing.',
    nextSteps: [
      'State the goal, constraints, and success signal.',
      selection.projectType === 'web-app'
        ? 'Sketch the homepage or user flow in docs/superpowers/specs.'
        : 'Capture the smallest user-facing workflow in docs/superpowers/specs.',
      'Choose the implementation path only after the design is explicit.',
    ],
    suggestedStartingPoint: 'Start with a short written design pass before implementation.',
  };
}
