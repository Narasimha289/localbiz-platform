import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in to submit a review",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { businessId, rating, comment } = body;

    if (!businessId || !rating) {
      return NextResponse.json(
        {
          success: false,
          message: "Business and rating are required",
        },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);

    if (numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          message: "Business not found",
        },
        { status: 404 }
      );
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        businessId,
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already reviewed this business",
        },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        businessId,
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
      {
        success: false,
        message: "Something went wrong while submitting the review",
      },
      { status: 500 }
    );
  }
}