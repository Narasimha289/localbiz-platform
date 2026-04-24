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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!["CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        business: {
          ownerId: session.user.id,
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      booking: updated,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error updating booking" }, { status: 500 });
  }
}