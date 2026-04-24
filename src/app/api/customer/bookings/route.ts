import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        customerEmail: session.user.email ?? "",
      },
      include: {
        business: {
          select: {
            businessName: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Customer bookings fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch customer bookings",
      },
      { status: 500 }
    );
  }
}