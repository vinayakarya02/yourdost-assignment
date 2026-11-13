import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
      <div className="css-orb mb-8 h-24 w-24 rounded-full" aria-hidden />
      <p className="eyebrow">Page not found</p>
      <h1 className="display mt-3 text-4xl">This path doesn&apos;t lead anywhere, yet.</h1>
      <p className="lead mt-4">Let&apos;s get you back somewhere calmer.</p>
      <Link href="/" className="focus-ring mt-8 rounded-full bg-midnight px-6 py-3 text-sm font-semibold text-white">Back to home</Link>
    </section>
  );
}
