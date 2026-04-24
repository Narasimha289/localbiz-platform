export default function BusinessNotFoundPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold">Business Not Found</h1>
        <p className="mt-3 text-gray-600">
          The business you are looking for does not exist or is not approved yet.
        </p>
      </div>
    </div>
  );
}