import InformationPage from "@/components/InformationPage";

export const metadata = { title: "About Us | ASIAN STORE" };
export default function AboutPage() {
  return (
    <main className="min-h-[70vh] bg-white px-5 py-12 text-black dark:bg-black dark:text-white sm:px-10 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] font-bold uppercase tracking-[.22em] text-violet-700 dark:text-violet-300">OUR APPROACH</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">Welcome to Asian Store<span className="text-violet-700 dark:text-violet-300">.</span></h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-black/70 dark:text-white/75">A place for considered finds across the things you use, wear, make, and share. We bring a thoughtful edit of everyday pieces together so it is easier to find something that feels right for you.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <section className="rounded-2xl border border-black/10 p-6 dark:border-white/15">
            <h2 className="text-lg font-semibold">A considered edit</h2>
            <p className="mt-3 text-sm leading-6 text-black/65 dark:text-white/70">Explore fashion, home, beauty, technology, and more in one carefully organized collection.</p>
          </section>
          <section className="rounded-2xl border border-black/10 p-6 dark:border-white/15">
            <h2 className="text-lg font-semibold">Made for everyday life</h2>
            <p className="mt-3 text-sm leading-6 text-black/65 dark:text-white/70">Our aim is to make browsing simple and help you discover useful, expressive pieces at your own pace.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
