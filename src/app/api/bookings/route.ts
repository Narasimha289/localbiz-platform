import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseBookingTimeTo24Hour(bookingTime: string) {
  const [time, modifier] = bookingTime.split(" ");
  const [rawHours, minutes] = time.split(":").map(Number);

  let hours = rawHours;

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

function convertTimeToMinutes(bookingTime: string) {
  const { hours, minutes } = parseBookingTimeTo24Hour(bookingTime);
  return hours * 60 + minutes;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      businessId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      bookingDate,
      bookingTime,
      notes,
    } = body;

    if (
      !businessId ||
      !serviceId ||
      !customerName ||
      !customerEmail ||
      !bookingDate ||
      !bookingTime
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Business, name, email, booking date and booking time are required",
        },
        { status: 400 }
      );
    }

    const selectedDate = new Date(bookingDate);

    if (Number.isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking date",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    if (selectedDay < today) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot book a past date",
        },
        { status: 400 }
      );
    }

    const isToday = selectedDay.getTime() === today.getTime();

    if (isToday) {
      const { hours, minutes } = parseBookingTimeTo24Hour(bookingTime);

      const selectedDateTime = new Date();
      selectedDateTime.setHours(hours, minutes, 0, 0);

      if (selectedDateTime <= now) {
        return NextResponse.json(
          {
            success: false,
            message: "You cannot book a past time slot for today",
          },
          { status: 400 }
        );
      }
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          message: "Business not found",
        },
        { status: 404 }
      );
    }

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId,
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid service selected",
        },
        { status: 400 }
      );
    }

    const newStartMinutes = convertTimeToMinutes(bookingTime);
    const newEndMinutes = newStartMinutes + (service.duration || 30);

    const existingBookings = await prisma.booking.findMany({
      where: {
        businessId,
        bookingDate: selectedDate,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      include: {
        service: {
          select: {
            duration: true,
          },
        },
      },
    });

    const overlappingBooking = existingBookings.find((existing) => {
      const existingStartMinutes = convertTimeToMinutes(existing.bookingTime);
      const existingEndMinutes =
        existingStartMinutes + (existing.service?.duration || 30);

      return (
        newStartMinutes < existingEndMinutes &&
        newEndMinutes > existingStartMinutes
      );
    });

    if (overlappingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "This booking overlaps with an existing booking",
        },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        businessId,
        serviceId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        bookingDate: selectedDate,
        bookingTime,
        notes: notes || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking submitted successfully",
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the booking",
      },
      { status: 500 }
    );
  }
}