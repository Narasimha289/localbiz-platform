import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createBusinessSchema } from "@/validations/business.schema";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
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
        { success: false, message: "Only business owners can create businesses" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createBusinessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const baseSlug = createSlug(data.businessName);
    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    const business = await prisma.business.create({
      data: {
        ownerId: session.user.id,
        businessName: data.businessName,
        slug: uniqueSlug,
        description: data.description,
        categoryId: data.categoryId,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        status: "PENDING",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Business created successfully",
        business,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create business error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the business",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        category: true,
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
    console.error("Get businesses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch businesses",
      },
      { status: 500 }
    );
  }
}