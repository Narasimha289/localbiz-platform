import { resend } from "@/lib/resend";

type SendBookingStatusEmailParams = {
  to: string;
  customerName: string;
  businessName: string;
  bookingDate: string;
  bookingTime: string;
  status: "CONFIRMED" | "CANCELLED";
};

export async function sendBookingStatusEmail({
  to,
  customerName,
  businessName,
  bookingDate,
  bookingTime,
  status,
}: SendBookingStatusEmailParams) {
  const isConfirmed = status === "CONFIRMED";

  const subject = isConfirmed
    ? `Booking Confirmed - ${businessName}`
    : `Booking Cancelled - ${businessName}`;

  const html = isConfirmed
    ? `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Your booking is confirmed</h2>
        <p>Hi ${customerName},</p>
        <p>Your booking with <strong>${businessName}</strong> has been confirmed.</p>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time:</strong> ${bookingTime}</p>
        <p>Thank you for booking with us.</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Your booking was cancelled</h2>
        <p>Hi ${customerName},</p>
        <p>Your booking with <strong>${businessName}</strong> has been cancelled.</p>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time:</strong> ${bookingTime}</p>
        <p>Please contact the business for more details.</p>
      </div>
    `;

  const { data, error } = await resend.emails.send({
    from: "LocalBiz <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  console.log("RESEND DATA:", data);
  console.log("RESEND ERROR:", error);

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  return data;
}