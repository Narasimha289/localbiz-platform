import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const businesses = await prisma.business.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
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
    console.error("Get pending businesses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pending businesses",
      },
      { status: 500 }
    );
  }
}