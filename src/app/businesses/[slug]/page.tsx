import { notFound } from "next/navigation";
import InquiryForm from "@/components/business/InquiryForm";
import BookingForm from "@/components/business/BookingForm";
import ReviewForm from "@/components/business/ReviewForm";

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

export default async function BusinessDetailsPage({
  params,
}: BusinessDetailsPageProps) {
  const { slug } = await params;
  const data = await getBusiness(slug);
  const business = data.business;

  const totalReviews = business.reviews?.length || 0;

  const averageRating =
    totalReviews > 0
      ? (
          business.reviews.reduce(
            (sum: number, review: any) => sum + review.rating,
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

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
            <span className="rounded-full bg-yellow-50 px-3 py-1 font-medium text-yellow-700">
              ⭐ {averageRating}
            </span>
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
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 font-semibold text-white"
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
          
          <div className="rounded-2xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold">Business Info</h2>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p><strong>Category:</strong> {business.category?.name || "N/A"}</p>
              <p><strong>Phone:</strong> {business.phone}</p>
              <p><strong>Email:</strong> {business.email || "N/A"}</p>
              <p><strong>Status:</strong> {business.status}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold">Location</h2>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p><strong>Address:</strong> {business.address}</p>
              <p><strong>City:</strong> {business.city}</p>
              <p><strong>State:</strong> {business.state}</p>
              <p><strong>Pincode:</strong> {business.pincode}</p>
            </div>
          </div>
        </div>

        {/* Owner */}
        <div className="rounded-2xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold">Owner Info</h2>

          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p><strong>Name:</strong> {business.owner?.name || "N/A"}</p>
            <p><strong>Email:</strong> {business.owner?.email || "N/A"}</p>
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

          <ReviewForm businessId={business.id} />
        </div>

        {/* Reviews */}
        <div className="rounded-2xl border border-gray-200 p-5">
          <h2 className="text-xl font-bold">
            Customer Reviews ({totalReviews})
          </h2>

          {totalReviews === 0 ? (
            <p className="mt-3 text-gray-600">No reviews yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {business.reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <h3 className="font-semibold">
                      {review.user.name}
                    </h3>

                    <span className="text-sm text-yellow-600">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
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