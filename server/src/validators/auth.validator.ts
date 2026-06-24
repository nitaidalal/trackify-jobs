import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .trim(),
    email: z
      .email("Invalid email address")
      .min(1, "Email is required")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password must be at most 50 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        "Password must contain at least one letter and one number",
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .email("Invalid email address")
      .min(1, "Email is required")
      .toLowerCase()
      .trim(),
    password: z.string().min(1, "Password is required"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema.shape.body>;
export type LoginInput = z.infer<typeof loginSchema.shape.body>;
