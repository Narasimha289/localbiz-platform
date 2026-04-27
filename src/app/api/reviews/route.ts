import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to submit a review" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { businessId, bookingId, rating, comment } = body;

    if (!businessId || !bookingId || !rating) {
      return NextResponse.json(
        { success: false, message: "Business, booking, and rating are required" },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);

    if (numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        businessId: true,
        customerEmail: true,
        status: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.businessId !== businessId) {
      return NextResponse.json(
        { success: false, message: "Booking does not belong to this business" },
        { status: 400 }
      );
    }

    if (booking.customerEmail !== session.user.email) {
      return NextResponse.json(
        { success: false, message: "You can only review your own booking" },
        { status: 403 }
      );
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, message: "You can review only completed bookings" },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
      select: { id: true },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this booking" },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        businessId,
        bookingId,
        userId: session.user.id,
        rating: numericRating,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong while submitting the review" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, rating, comment } = body;

    if (!bookingId || !rating) {
      return NextResponse.json(
        { success: false, message: "Booking and rating are required" },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);

    if (numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "You can only edit your own review" },
        { status: 403 }
      );
    }

    const updatedReview = await prisma.review.update({
      where: { bookingId },
      data: {
        rating: numericRating,
        comment: comment || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong while updating the review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking ID is required" },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "You can only delete your own review" },
        { status: 403 }
      );
    }

    await prisma.review.delete({
      where: { bookingId },
    });

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong while deleting the review" },
      { status: 500 }
    );
  }
}