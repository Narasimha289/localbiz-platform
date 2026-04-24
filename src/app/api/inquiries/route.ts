import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      businessId,
      customerName,
      customerEmail,
      customerPhone,
      message,
    } = body;

    if (!businessId || !customerName || !customerEmail || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Business, name, email, and message are required",
        },
        { status: 400 }
      );
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true },
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

    const inquiry = await prisma.inquiry.create({
      data: {
        businessId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        message,
        status: "NEW",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry sent successfully",
        inquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create inquiry error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while sending inquiry",
      },
      { status: 500 }
    );
  }
}