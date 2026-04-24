import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBookingStatusEmail } from "@/lib/booking-email";

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bookingId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking status" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            ownerId: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.business.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "You can only update your own bookings" },
        { status: 403 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
      },
      include: {
        business: {
          select: {
            businessName: true,
          },
        },
      },
    });

    console.log("UPDATED STATUS:", status);
    console.log("CUSTOMER EMAIL:", updatedBooking.customerEmail);

    if (
      (status === "CONFIRMED" || status === "CANCELLED") &&
      updatedBooking.customerEmail
    ) {
      try {
        console.log("EMAIL FUNCTION CALLED");

        await sendBookingStatusEmail({
          to: updatedBooking.customerEmail,
          customerName: updatedBooking.customerName,
          businessName: updatedBooking.business.businessName,
          bookingDate: new Date(updatedBooking.bookingDate).toLocaleDateString(),
          bookingTime: updatedBooking.bookingTime,
          status,
        });

        console.log("EMAIL SENT SUCCESSFULLY");
      } catch (emailError) {
        console.error("Booking status email failed:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Owner booking update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking status",
      },
      { status: 500 }
    );
  }
}