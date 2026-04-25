import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-6xl items-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          Local Business Digital Platform
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg md:text-xl md:leading-8">
          Discover local businesses, explore services, book appointments, and
          connect with trusted providers near you.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <Link
            href="/businesses"
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-gray-800 sm:w-auto"
          >
            Explore Businesses
          </Link>

          <Link
            href="/register"
            className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-800 shadow-sm transition hover:bg-gray-100 sm:w-auto"
          >
            Join as Business
          </Link>
        </div>
      </div>
    </section>
  );
}