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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const { id } = await params;

    const updatedBusiness = await prisma.business.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: `Business ${status.toLowerCase()} successfully`,
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("Update business status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update business status",
      },
      { status: 500 }
    );
  }
}