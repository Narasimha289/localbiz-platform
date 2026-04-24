import Link from "next/link";

type BusinessCardProps = {
  business: {
    id: string;
    slug: string;
    businessName: string;
    description: string;
    imageUrl: string | null;
    phone: string;
    email: string | null;
    city: string;
    state: string;
    category?: {
      name: string;
    } | null;
    reviews?: {
      rating: number;
    }[];
  };
};

export default function BusinessCard({ business }: BusinessCardProps) {
  const totalReviews = business.reviews?.length || 0;

  const averageRating =
    totalReviews > 0
      ? (
          business.reviews!.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        ).toFixed(1)
      : "0.0";

  return (
    <Link href={`/businesses/${business.slug}`} className="block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        {business.imageUrl ? (
          <img
            src={business.imageUrl}
            alt={business.businessName}
            className="h-44 w-full object-cover sm:h-48"
          />
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-gray-100 text-sm font-medium text-gray-500 sm:h-48">
            No Image
          </div>
        )}

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h2 className="line-clamp-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {business.businessName}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-yellow-50 px-3 py-1 font-medium text-yellow-700">
              ⭐ {averageRating}
            </span>
            <span className="text-gray-600">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 sm:text-base">
            {business.description}
          </p>

          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p className="truncate">
              <strong>Category:</strong> {business.category?.name || "N/A"}
            </p>
            <p className="truncate">
              <strong>Phone:</strong> {business.phone}
            </p>
            <p className="truncate">
              <strong>Email:</strong> {business.email || "N/A"}
            </p>
            <p className="truncate">
              <strong>Location:</strong> {business.city}, {business.state}
            </p>
          </div>

          <div className="mt-auto pt-5">
            <span className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50 sm:w-auto">
              View Details
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}