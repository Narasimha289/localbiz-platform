import BusinessFilters from "@/components/business/BusinessFilters";

export default function BusinessesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
          Businesses
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
          Discover approved local businesses on the platform.
        </p>
      </div>

      <BusinessFilters />
    </div>
  );
}