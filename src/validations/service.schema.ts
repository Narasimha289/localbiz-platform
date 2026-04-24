import { z } from "zod";

export const createServiceSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  name: z.string().min(2, "Service name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
});