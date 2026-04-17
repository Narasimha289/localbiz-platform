export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Local Business Digital Platform
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-gray-600">
          Discover local businesses, explore services, and connect with trusted providers near you.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <button className="rounded-xl bg-black px-5 py-3 text-white transition hover:bg-gray-800">
            Explore Businesses
          </button>

          <button className="rounded-xl border border-gray-300 px-5 py-3 transition hover:bg-gray-50">
            Join as Business
          </button>
        </div>
      </section>
    </main>
  );
}