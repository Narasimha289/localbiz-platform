import { notFound } from "next/navigation";
import InquiryForm from "@/components/business/InquiryForm";
import BookingForm from "@/components/business/BookingForm";


type BusinessDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getBusiness(slug: string) {
  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/businesses/${slug}`,
    {
      cache: "no-store",
    }
  );

  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Failed to fetch business");

  return response.json();
}

// ⭐ Star Display
function DisplayStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= Math.round(rating)
              ? "text-yellow-400 text-lg"
              : "text-gray-300 text-lg"
          }
        >
          ★
        </span>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}

export default async function BusinessDetailsPage({
  params,
}: BusinessDetailsPageProps) {
  const { slug } = await params;
  const data = await getBusiness(slug);
  const business = data.business;

  const totalReviews = business.reviews?.length || 0;

  const averageRating =
    totalReviews > 0
      ? business.reviews.reduce(
          (sum: number, review: any) => sum + review.rating,
          0
        ) / totalReviews
      : 0;

  // 📊 Distribution Logic
  const ratingCounts = [0, 0, 0, 0, 0];

  business.reviews.forEach((review: any) => {
    ratingCounts[review.rating - 1]++;
  });

  const getPercentage = (count: number) => {
    return totalReviews === 0
      ? 0
      : Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">

        {/* Image */}
        {business.imageUrl && (
          <img
            src={business.imageUrl}
            alt={business.businessName}
            className="h-52 w-full rounded-2xl object-cover sm:h-64"
          />
        )}

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
            {business.businessName}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <DisplayStars rating={averageRating} />
            <span className="text-gray-600">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>

          <p className="mt-4 text-sm text-gray-600 sm:text-base">
            {business.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={`tel:${business.phone}`}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Call Now
          </a>

          <a
            href={business.email ? `mailto:${business.email}` : "#"}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-800"
          >
            Email
          </a>
        </div>

        {/* Info Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border p-5">
            <h2 className="text-lg font-semibold">Business Info</h2>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p><strong>Category:</strong> {business.category?.name || "N/A"}</p>
              <p><strong>Phone:</strong> {business.phone}</p>
              <p><strong>Email:</strong> {business.email || "N/A"}</p>
              <p><strong>Status:</strong> {business.status}</p>
            </div>
          </div>

          <div className="rounded-2xl border p-5">
            <h2 className="text-lg font-semibold">Location</h2>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p><strong>Address:</strong> {business.address}</p>
              <p><strong>City:</strong> {business.city}</p>
              <p><strong>State:</strong> {business.state}</p>
              <p><strong>Pincode:</strong> {business.pincode}</p>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="space-y-8">
          <InquiryForm businessId={business.id} />

          <BookingForm
            businessId={business.id}
            businessSlug={business.slug}
            openingTime={business.openingTime}
            closingTime={business.closingTime}
          />
        </div>

        {/* Reviews */}
        <div className="rounded-2xl border p-5">
          
          {/* ⭐ Summary + 📊 Distribution */}
          <div className="mb-6">
            <h2 className="text-xl font-bold">Customer Reviews</h2>

            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
              
              <div>
                <DisplayStars rating={averageRating} />
                <p className="text-sm text-gray-600 mt-1">
                  {totalReviews} reviews
                </p>
              </div>

              <div className="w-full max-w-xs space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingCounts[star - 1];
                  const percentage = getPercentage(count);

                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-6">{star}★</span>

                      <div className="flex-1 h-2 bg-gray-200 rounded">
                        <div
                          className="h-2 bg-yellow-400 rounded"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <span className="w-10 text-right">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Review List */}
          {totalReviews === 0 ? (
            <p className="text-gray-600">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {business.reviews.map((review: any) => (
                <div key={review.id} className="rounded-xl border p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <h3 className="font-semibold">{review.user.name}</h3>
                    <DisplayStars rating={review.rating} />
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {review.comment || "No comment"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}