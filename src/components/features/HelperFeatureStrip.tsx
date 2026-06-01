const HELPER_FEATURES = [
  {
    title: 'Workflow fit',
    description:
      'Point new work toward brainstorming, fast build, structured planning, debugging, or review.',
  },
  {
    title: 'Setup lane',
    description:
      'Keep the recommendation grounded in the kind of project being started or improved.',
  },
  {
    title: 'Next move',
    description: 'Surface the first doc, command, or path to open so the user can act immediately.',
  },
];

const SETUP_LANES = [
  {
    title: 'New product lane',
    detail: 'Start with a design pass, then use the template wizard once the path is clear.',
    command: 'npx create-ai-template',
  },
  {
    title: 'Brownfield lane',
    detail: 'Reproduce first, then narrow to the closest controlling file before editing.',
    command: 'systematic-debugging',
  },
  {
    title: 'Quality lane',
    detail: 'Use review or readiness checks before widening scope or merging changes.',
    command: 'npm run verify:bmad',
  },
];

export function HelperFeatureStrip() {
  return (
    <>
      <section
        id="pathways"
        aria-labelledby="pathways-heading"
        className="px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
              What the helper does
            </p>
            <h2
              id="pathways-heading"
              className="mt-4 text-3xl font-semibold text-white md:text-4xl"
            >
              A small decision system, not another brochure
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {HELPER_FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-[1.75rem] border border-white/10 bg-slate-900/65 p-6 text-slate-100 shadow-[0_10px_40px_rgba(15,23,42,0.28)]"
              >
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-300">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="setup" aria-labelledby="setup-heading" className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-cyan-400/20 bg-slate-900/70 p-8 shadow-[0_20px_80px_rgba(8,47,73,0.25)]">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Setup lanes
            </p>
            <h2 id="setup-heading" className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Three ways to leave this page with momentum
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {SETUP_LANES.map((lane) => (
              <article
                key={lane.title}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-6"
              >
                <h3 className="text-xl font-semibold text-white">{lane.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{lane.detail}</p>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Suggested command
                </p>
                <code className="mt-3 block rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-cyan-100">
                  {lane.command}
                </code>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
