import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json(
        { success: false, message: "Business ID required" },
        { status: 400 }
      );
    }

    const services = await prisma.service.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error("Fetch services error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, name, price, duration } = body;

    if (!businessId || !name) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        businessId,
        name,
        price: Number(price) || 0,
        duration: Number(duration) || 30,
      },
    });

    return NextResponse.json(
      { success: true, service },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create service error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create service" },
      { status: 500 }
    );
  }
}