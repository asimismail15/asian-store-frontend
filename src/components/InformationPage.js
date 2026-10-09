import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function InformationPage({ eyebrow = "ASIAN STORE", title, intro, sections = [], action }) {
  return (
    <main className="min-h-[70vh] bg-white px-5 py-12 text-black dark:bg-black dark:text-white sm:px-10 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-black/10 pb-9 dark:border-white/15">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-violet-700 dark:text-violet-300">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">{title}<span className="text-violet-700 dark:text-violet-300">.</span></h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-black/65 dark:text-white/70">{intro}</p>
        </header>
        <div className="grid gap-4 py-8 sm:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-black sm:p-7">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-black/65 dark:text-white/70">{section.body}</p>
            </section>
          ))}
        </div>
        {action && <Link href={action.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-800 dark:bg-violet-300 dark:text-black dark:hover:bg-violet-200">{action.label}<ArrowRight size={16}/></Link>}
      </div>
    </main>
  );
}
