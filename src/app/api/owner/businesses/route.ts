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

    if (session.user.role !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Only owners can view their businesses" },
        { status: 403 }
      );
    }

    const businesses = await prisma.business.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      businesses,
    });
  } catch (error) {
    console.error("Get owner businesses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch owner businesses",
      },
      { status: 500 }
    );
  }
}