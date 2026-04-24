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
        { success: false, message: "Only owners can view inquiries" },
        { status: 403 }
      );
    }

    const inquiries = await prisma.inquiry.findMany({
      where: {
        business: {
          ownerId: session.user.id,
        },
      },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
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
      inquiries,
    });
  } catch (error) {
    console.error("Get owner inquiries error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch owner inquiries",
      },
      { status: 500 }
    );
  }
}