import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateServiceSchema } from "@/validations/service.schema";

type RouteContext = {
  params: Promise<{
    serviceId: string;
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

    const { serviceId } = await params;
    const body = await request.json();

    const parsed = updateServiceSchema.safeParse(body);

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

    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        business: true,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    if (existingService.business.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name: parsed.data.name,
        price: Number(parsed.data.price),
        duration: 30,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update service error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { serviceId } = await params;

    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        business: true,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    if (existingService.business.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete service" },
      { status: 500 }
    );
  }
}