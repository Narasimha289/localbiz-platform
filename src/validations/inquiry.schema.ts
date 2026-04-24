import { z } from "zod";

export const createInquirySchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Enter a valid email"),
  customerPhone: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;