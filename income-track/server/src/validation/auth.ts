import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6)
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.email().optional()
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6)
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });
