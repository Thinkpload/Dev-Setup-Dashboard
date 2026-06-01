const HERO_POINTS = [
  'Choose the right workflow before you burn time.',
  'Match the project shape to the right setup path.',
  'Leave with the next command or doc target to open.',
];

export function SkillChooserHero() {
  return (
    <section
      role="banner"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_38%),linear-gradient(180deg,#020617_0%,#0f172a_58%,#111827_100%)] px-4 pb-20 pt-28 sm:px-6 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_60%)]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-300">
            Skill chooser and dev setup helper
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-white md:text-6xl lg:text-7xl">
            Choose the right build path before you code
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            This homepage now acts like a lightweight product assistant: it points you to the right
            workflow, the right setup route, and the next concrete move inside this repo.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="#chooser"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              Start the helper
            </a>
            <a
              href="#setup"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              See setup lanes
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_18px_80px_rgba(8,47,73,0.45)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
            What this replaces
          </p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-300">
              Instead of a generic template pitch, the homepage now helps someone answer three
              questions and move directly into the correct workflow.
            </p>
          </div>
          <ul className="mt-6 space-y-4">
            {HERO_POINTS.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-6 text-slate-200">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
