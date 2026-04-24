import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const ownerBusinesses = await prisma.business.findMany({
      where: {
        ownerId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    const businessIds = ownerBusinesses.map((business) => business.id);

    const bookings = await prisma.booking.findMany({
      where: {
        businessId: {
          in: businessIds,
        },
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
    console.error("Owner bookings fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch owner bookings",
      },
      { status: 500 }
    );
  }
}