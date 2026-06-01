'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '#chooser', label: 'Helper' },
  { href: '#pathways', label: 'Paths' },
  { href: '#setup', label: 'Setup' },
];

const GITHUB_URL = 'https://github.com/mad-one/template-bmad-auto-cicd';

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-cyan-400/15 bg-slate-950/75 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Skill chooser home"
          className="flex items-center gap-2 text-lg font-bold text-white"
        >
          <span className="text-2xl">⌘</span>
          <span className="hidden sm:inline">Dev Setup Helper</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-slate-300 transition-colors hover:text-cyan-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <a
          href="#chooser"
          className="hidden rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 lg:inline-flex"
        >
          Start helper
        </a>

        {/* Mobile hamburger */}
        <Sheet>
          <SheetTrigger
            aria-label="Open navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-400/20 text-cyan-100 hover:bg-cyan-400/10 lg:hidden"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-cyan-400/20 bg-slate-950">
            <SheetHeader>
              <SheetTitle className="text-white">Navigation</SheetTitle>
            </SheetHeader>
            <ul className="mt-6 flex flex-col gap-4 px-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block text-base text-slate-300 transition-colors hover:text-cyan-100"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="mt-4">
                <a
                  href="#chooser"
                  className="block rounded-full bg-cyan-400 px-4 py-2 text-center text-sm font-semibold text-slate-950"
                >
                  Start helper
                </a>
              </li>
            </ul>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
