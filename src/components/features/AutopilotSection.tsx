const STEPS = [
  {
    command: '/autopilot',
    label: 'Активация',
    detail: 'Claude читает STATE.md и ROADMAP.md, определяет текущую фазу',
  },
  {
    command: 'PRD → Architecture → Epics',
    label: 'BMAD-фазы',
    detail: 'Каждая фаза проходит quality gate перед переходом к следующей',
  },
  {
    command: 'lint → test → type-check',
    label: 'Auto-валидация',
    detail: 'Ошибки исправляются автоматически (до 3 попыток)',
  },
  {
    command: 'git commit → next task',
    label: 'Commit и далее',
    detail: 'Останавливается только перед push или деструктивными действиями',
  },
];

const STOP_CONDITIONS = [
  'git push / удаление веток',
  'Архитектурное решение не в доках',
  '3 провала подряд на одной задаче',
  'Команда "stop" от пользователя',
];

export function AutopilotSection() {
  return (
    <section
      id="autopilot"
      aria-labelledby="autopilot-heading"
      className="bg-[#0d0818] px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-950/40 px-4 py-1.5 text-sm text-purple-300">
            <span className="mr-2 text-base">⚡</span>
            Killer Feature
          </div>
          <h2
            id="autopilot-heading"
            className="mb-4 text-3xl font-bold text-purple-100 md:text-4xl"
          >
            Autopilot Mode
          </h2>
          <p className="mx-auto max-w-2xl text-base text-purple-300 md:text-lg">
            Одна команда — и Claude Code самостоятельно проходит все BMAD-фазы: от PRD до
            работающего кода с тестами. Вы занимаетесь продуктом, не процессом.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: workflow steps */}
          <div className="space-y-3">
            <p className="mb-5 text-sm font-medium uppercase tracking-widest text-purple-400">
              Как работает
            </p>
            {STEPS.map((step, i) => (
              <div
                key={step.command}
                className="flex gap-4 rounded-xl border border-purple-900/40 bg-purple-950/20 p-4"
              >
                {/* Step number */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-700/50 bg-purple-900/40 text-xs font-bold text-purple-300">
                  {i + 1}
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <code className="rounded bg-purple-950/60 px-2 py-0.5 text-xs text-purple-200">
                      {step.command}
                    </code>
                    <span className="text-xs font-medium text-purple-400">{step.label}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-purple-300/70">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: terminal demo + stop conditions */}
          <div className="space-y-4">
            {/* Terminal */}
            <div className="overflow-hidden rounded-xl border border-purple-900/50 bg-[#0a0612]">
              {/* Terminal chrome */}
              <div className="flex items-center gap-2 border-b border-purple-900/40 bg-purple-950/30 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-500/60" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <span className="h-3 w-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-xs text-purple-400">claude code</span>
              </div>
              {/* Terminal body */}
              <div className="space-y-2 p-5 font-mono text-xs leading-relaxed">
                <div className="text-purple-400">
                  <span className="text-purple-600">$</span> /autopilot
                </div>
                <div className="text-purple-300">✓ Loaded STATE.md — Phase 3, plan 2/3</div>
                <div className="text-purple-300">✓ Next: installer.ts — runInstaller()</div>
                <div className="mt-2 text-purple-400">— executing task 1/2 —</div>
                <div className="text-green-400/80">✓ lint passed</div>
                <div className="text-green-400/80">✓ 35/35 tests passing</div>
                <div className="text-green-400/80">✓ type-check passed</div>
                <div className="text-purple-300">✓ committed: feat(03): runInstaller pipeline</div>
                <div className="mt-2 text-purple-400">— moving to task 2/2 —</div>
                <div className="text-purple-300/50 animate-pulse">▌</div>
              </div>
            </div>

            {/* Stop conditions */}
            <div className="rounded-xl border border-purple-900/40 bg-purple-950/10 p-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-purple-500">
                Останавливается и спрашивает только если
              </p>
              <ul className="space-y-2">
                {STOP_CONDITIONS.map((cond) => (
                  <li key={cond} className="flex items-start gap-2 text-xs text-purple-300/70">
                    <span className="mt-0.5 shrink-0 text-red-400/70">✕</span>
                    {cond}
                  </li>
                ))}
              </ul>
            </div>

            {/* Install hint */}
            <p className="text-center text-xs text-purple-400/50">
              Устанавливается через визард — выберите{' '}
              <code className="text-purple-400">Claude Code</code> как agentic system
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
