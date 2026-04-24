import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createBusinessSchema } from "@/validations/business.schema";

export async function GET(
  _request: Request,
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
        { success: false, message: "Only owners can view business details" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const business = await prisma.business.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { success: false, message: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      business,
    });
  } catch (error) {
    console.error("Get owner business error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch business details",
      },
      { status: 500 }
    );
  }
}

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
        { success: false, message: "Only owners can update businesses" },
        { status: 403 }
      );
    }

    const { id } = await params;
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

    const existingBusiness = await prisma.business.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingBusiness) {
      return NextResponse.json(
        { success: false, message: "Business not found" },
        { status: 404 }
      );
    }

    const data = parsed.data;

    const updatedBusiness = await prisma.business.update({
      where: { id },
      data: {
        businessName: data.businessName,
        description: data.description,
        categoryId: data.categoryId,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        imageUrl: data.imageUrl || null,
        openingTime: data.openingTime,
        closingTime: data.closingTime,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Business updated successfully",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("Update owner business error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update business",
      },
      { status: 500 }
    );
  }
}