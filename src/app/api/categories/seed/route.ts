import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = [
      { name: "Salons & Beauty", slug: "salons-beauty" },
      { name: "Clinics", slug: "clinics" },
      { name: "Hotels & Resorts", slug: "hotels-resorts" },
      { name: "Gyms & Fitness", slug: "gyms-fitness" },
      { name: "Restaurants & Cafes", slug: "restaurants-cafes" },
      { name: "Tutors & Coaching", slug: "tutors-coaching" },
      { name: "Repair Services", slug: "repair-services" },
      { name: "Boutiques & Fashion", slug: "boutiques-fashion" },
    ];

    await prisma.category.createMany({
      data: categories,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: "Categories seeded successfully",
    });
  } catch (error) {
    console.error("Seed categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed categories",
      },
      { status: 500 }
    );
  }
}