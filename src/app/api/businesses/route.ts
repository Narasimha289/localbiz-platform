import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createBusinessSchema } from "@/validations/business.schema";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function saveBusinessImage(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const fileExtension = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExtension}`;

  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
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
        {
          success: false,
          message: "Only business owners can create businesses",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const image = formData.get("image") as File | null;

    const body = {
      businessName: String(formData.get("businessName") || ""),
      description: String(formData.get("description") || ""),
      categoryId: String(formData.get("categoryId") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      address: String(formData.get("address") || ""),
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      pincode: String(formData.get("pincode") || ""),
      openingTime: String(formData.get("openingTime") || "09:00"),
      closingTime: String(formData.get("closingTime") || "20:00"),
    };

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

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
      imageUrl = await saveBusinessImage(image);
    }

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
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        imageUrl,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Business created successfully and submitted for approval.",
        business,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create business FULL error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating the business",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const city = searchParams.get("city") || "";

    const businesses = await prisma.business.findMany({
      where: {
        status: "APPROVED",
        ...(search
          ? {
              businessName: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
        ...(category
          ? {
              categoryId: category,
            }
          : {}),
        ...(city
          ? {
              OR: [
                { city: { contains: city, mode: "insensitive" } },
                { state: { contains: city, mode: "insensitive" } },
                { address: { contains: city, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
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