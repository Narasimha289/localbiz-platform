import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const businessId = searchParams.get("businessId");
    const date = searchParams.get("date");

    if (!businessId || !date) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 }
      );
    }

    const selectedDate = new Date(date);

    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        bookingDate: selectedDate,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        bookingTime: true,
      },
    });

    const bookedSlots = bookings.map((b) => b.bookingTime);

    return NextResponse.json({
      success: true,
      bookedSlots,
    });
  } catch (error) {
    console.error("Availability error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}