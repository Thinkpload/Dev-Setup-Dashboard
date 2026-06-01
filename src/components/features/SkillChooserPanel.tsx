'use client';

import { useId, useState } from 'react';
import {
  DEFAULT_SELECTION,
  GUIDANCE_OPTIONS,
  type GuidanceLevel,
  INTENT_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  type ProjectType,
  type SkillIntent,
  getSkillRecommendation,
} from './skill-chooser-data';

function ChoiceGroup<T extends string>({
  legend,
  name,
  options,
  selectedValue,
  onChange,
}: {
  legend: string;
  name: string;
  options: Array<{ value: T; label: string }>;
  selectedValue: T;
  onChange: (value: T) => void;
}) {
  const groupId = useId();

  return (
    <fieldset className="space-y-3">
      <legend
        id={groupId}
        className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200"
      >
        {legend}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const inputId = `${groupId}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-4 text-sm text-slate-100 transition hover:border-cyan-400/60"
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={option.value}
                checked={selectedValue === option.value}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 border-cyan-300/50 text-cyan-400 focus:ring-cyan-400"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SkillChooserPanel() {
  const [intent, setIntent] = useState<SkillIntent>(DEFAULT_SELECTION.intent);
  const [guidance, setGuidance] = useState<GuidanceLevel>(DEFAULT_SELECTION.guidance);
  const [projectType, setProjectType] = useState<ProjectType>(DEFAULT_SELECTION.projectType);

  const recommendation = getSkillRecommendation({ intent, guidance, projectType });

  return (
    <section
      id="chooser"
      aria-labelledby="chooser-heading"
      className="rounded-[2rem] border border-cyan-400/20 bg-slate-900/80 p-6 shadow-[0_24px_120px_rgba(14,116,144,0.18)] backdrop-blur md:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Skill chooser
            </p>
            <h2 id="chooser-heading" className="text-3xl font-semibold tracking-tight text-white">
              Pick the path that matches the work in front of you
            </h2>
            <p className="max-w-2xl text-base text-slate-300">
              Answer three quick questions and get a recommended workflow, a reasoning summary, and
              the next move to make in this repo.
            </p>
          </div>

          <ChoiceGroup
            legend="What are you trying to do?"
            name="intent"
            options={INTENT_OPTIONS}
            selectedValue={intent}
            onChange={setIntent}
          />

          <ChoiceGroup
            legend="How much guidance do you want?"
            name="guidance"
            options={GUIDANCE_OPTIONS}
            selectedValue={guidance}
            onChange={setGuidance}
          />

          <ChoiceGroup
            legend="What kind of project is this?"
            name="projectType"
            options={PROJECT_TYPE_OPTIONS}
            selectedValue={projectType}
            onChange={setProjectType}
          />
        </div>

        <aside className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,47,73,0.96),rgba(15,23,42,0.96))] p-6 text-slate-100">
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Your recommended path
          </h3>
          <p className="mt-4 text-2xl font-semibold text-white">{recommendation.title}</p>
          <div className="mt-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-100">
            {recommendation.primaryPath}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">{recommendation.description}</p>

          <ol className="mt-6 space-y-3 text-sm text-slate-200">
            {recommendation.nextSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-100">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Suggested starting point
            </p>
            <p className="mt-2 text-sm text-slate-100">{recommendation.suggestedStartingPoint}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
