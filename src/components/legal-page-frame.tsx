import type { ReactNode } from "react";

import Link from "next/link";

export function LegalPageFrame({
  eyebrow,
  title,
  subtitle,
  lastUpdated,
  children
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen px-4 py-6 text-ink sm:px-6 sm:py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <section className="rounded-[34px] border border-white/12 bg-white/7 p-5 shadow-glass backdrop-blur-2xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/65">
                {eyebrow}
              </p>
              <div>
                <h1 className="font-[var(--font-heading)] text-4xl uppercase leading-none tracking-[0.05em] text-white sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">{subtitle}</p>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex min-h-[48px] items-center justify-center rounded-[20px] border border-white/12 bg-black/20 px-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/8"
            >
              Back to Hub
            </Link>
          </div>
        </section>

        <article className="rounded-[34px] border border-white/12 bg-white/7 p-5 shadow-glass backdrop-blur-2xl sm:p-6">
          <div className="space-y-8">{children}</div>
          <p className="mt-8 text-xs uppercase tracking-[0.28em] text-white/35">Last updated: {lastUpdated}</p>
        </article>
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-b border-white/8 pb-8 last:border-b-0 last:pb-0">
      <h2 className="font-[var(--font-heading)] text-2xl uppercase tracking-[0.04em] text-white sm:text-3xl">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-7 text-white/72 sm:text-base">{children}</div>
    </section>
  );
}