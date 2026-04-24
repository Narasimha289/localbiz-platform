import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

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
          message: "Missing required fields",
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

    const amountInPaise = Math.round(Number(service.price || 0) * 100);

    if (amountInPaise <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This service has no payable amount",
        },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        businessId,
        serviceId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || "",
        bookingDate,
        bookingTime,
        notes: notes || "",
      },
    });

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
        paymentStatus: "PENDING",
        razorpayOrderId: order.id,
        amount: Number(service.price || 0),
      },
    });

    return NextResponse.json({
      success: true,
      order,
      bookingId: booking.id,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: "INR",
      serviceName: service.name,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment order",
      },
      { status: 500 }
    );
  }
}