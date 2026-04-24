import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { success: false, message: "Only owners can update inquiries" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!["VIEWED", "RESPONDED"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const { id } = await params;

    const existingInquiry = await prisma.inquiry.findFirst({
      where: {
        id,
        business: {
          ownerId: session.user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!existingInquiry) {
      return NextResponse.json(
        { success: false, message: "Inquiry not found" },
        { status: 404 }
      );
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: `Inquiry marked as ${status.toLowerCase()}`,
      inquiry: updatedInquiry,
    });
  } catch (error) {
    console.error("Update inquiry status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update inquiry status",
      },
      { status: 500 }
    );
  }
}