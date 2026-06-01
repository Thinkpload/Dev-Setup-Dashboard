import { HelperFeatureStrip } from '@/components/features/HelperFeatureStrip';
import { SkillChooserHero } from '@/components/features/SkillChooserHero';
import { SkillChooserPanel } from '@/components/features/SkillChooserPanel';
import { Navbar } from '@/components/shared/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main
        id="main-content"
        className="bg-[linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]"
      >
        <SkillChooserHero />

        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SkillChooserPanel />
          </div>
        </section>

        <HelperFeatureStrip />

        <footer className="border-t border-cyan-400/10 px-4 py-12 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-slate-400">
            Built with BMAD + Next.js 15 + Tailwind CSS v4 &middot;{' '}
            <a
              href="https://github.com/mad-one/template-bmad-auto-cicd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 underline-offset-4 hover:underline"
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}
