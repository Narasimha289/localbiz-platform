import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function calculateRevenue(bookings: { amount: number | null }[]) {
  return bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role === "ADMIN") {
      const [
        totalBusinesses,
        pendingBusinesses,
        approvedBusinesses,
        rejectedBusinesses,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        paidBookings,
        pendingPayments,
        totalInquiries,
        totalReviews,
        totalUsers,
      ] = await Promise.all([
        prisma.business.count(),
        prisma.business.count({ where: { status: "PENDING" } }),
        prisma.business.count({ where: { status: "APPROVED" } }),
        prisma.business.count({ where: { status: "REJECTED" } }),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: "PENDING" } }),
        prisma.booking.count({ where: { status: "CONFIRMED" } }),
        prisma.booking.count({ where: { status: "COMPLETED" } }),
        prisma.booking.count({ where: { status: "CANCELLED" } }),
        prisma.booking.findMany({
          where: { paymentStatus: "PAID" },
          select: { amount: true },
        }),
        prisma.booking.count({ where: { paymentStatus: "PENDING" } }),
        prisma.inquiry.count(),
        prisma.review.count(),
        prisma.user.count(),
      ]);

      const paidBookingsCount = paidBookings.length;
      const totalRevenue = calculateRevenue(paidBookings);
      const averageBookingValue =
        paidBookingsCount > 0 ? Math.round(totalRevenue / paidBookingsCount) : 0;

      return NextResponse.json({
        success: true,
        role: "ADMIN",
        analytics: {
          totalBusinesses,
          pendingBusinesses,
          approvedBusinesses,
          rejectedBusinesses,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
          paidBookingsCount,
          totalRevenue,
          averageBookingValue,
          pendingPayments,
          totalInquiries,
          totalReviews,
          totalUsers,
        },
      });
    }

    if (session.user.role === "OWNER") {
      const ownerBusinesses = await prisma.business.findMany({
        where: {
          ownerId: session.user.id,
        },
        select: {
          id: true,
        },
      });

      const businessIds = ownerBusinesses.map((business) => business.id);

      const [
        totalBusinesses,
        pendingBusinesses,
        approvedBusinesses,
        rejectedBusinesses,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        paidBookings,
        pendingPayments,
        totalInquiries,
        totalReviews,
        totalServices,
      ] = await Promise.all([
        prisma.business.count({ where: { ownerId: session.user.id } }),
        prisma.business.count({
          where: { ownerId: session.user.id, status: "PENDING" },
        }),
        prisma.business.count({
          where: { ownerId: session.user.id, status: "APPROVED" },
        }),
        prisma.business.count({
          where: { ownerId: session.user.id, status: "REJECTED" },
        }),
        prisma.booking.count({
          where: { businessId: { in: businessIds } },
        }),
        prisma.booking.count({
          where: { businessId: { in: businessIds }, status: "PENDING" },
        }),
        prisma.booking.count({
          where: { businessId: { in: businessIds }, status: "CONFIRMED" },
        }),
        prisma.booking.count({
          where: { businessId: { in: businessIds }, status: "COMPLETED" },
        }),
        prisma.booking.count({
          where: { businessId: { in: businessIds }, status: "CANCELLED" },
        }),
        prisma.booking.findMany({
          where: {
            businessId: { in: businessIds },
            paymentStatus: "PAID",
          },
          select: { amount: true },
        }),
        prisma.booking.count({
          where: {
            businessId: { in: businessIds },
            paymentStatus: "PENDING",
          },
        }),
        prisma.inquiry.count({
          where: { businessId: { in: businessIds } },
        }),
        prisma.review.count({
          where: { businessId: { in: businessIds } },
        }),
        prisma.service.count({
          where: { businessId: { in: businessIds } },
        }),
      ]);

      const paidBookingsCount = paidBookings.length;
      const totalRevenue = calculateRevenue(paidBookings);
      const averageBookingValue =
        paidBookingsCount > 0 ? Math.round(totalRevenue / paidBookingsCount) : 0;

      return NextResponse.json({
        success: true,
        role: "OWNER",
        analytics: {
          totalBusinesses,
          pendingBusinesses,
          approvedBusinesses,
          rejectedBusinesses,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
          paidBookingsCount,
          totalRevenue,
          averageBookingValue,
          pendingPayments,
          totalInquiries,
          totalReviews,
          totalServices,
        },
      });
    }

    return NextResponse.json({
      success: true,
      role: "CUSTOMER",
      analytics: null,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}