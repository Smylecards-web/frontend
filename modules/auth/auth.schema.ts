import { z } from "zod";

const alphaDash = /^[a-zA-Z0-9_-]+$/;

export const otpContextSchema = z.enum(["host", "guest"]);

export const requestOtpInputSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
  context: otpContextSchema,
  eventSlug: z.string().optional(),
});

export const verifyOtpInputSchema = z.object({
  email: z.string().trim().min(1).email("Invalid email"),
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Digits only"),
  username: z
    .string()
    .min(3)
    .max(40)
    .regex(alphaDash, "Use letters, numbers, dashes, underscores")
    .optional(),
  avatarUrl: z.string().url("Invalid URL").optional(),
});

export const updateProfileInputSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "At least 3 characters")
      .max(40)
      .regex(alphaDash, "Use letters, numbers, dashes, underscores"),
    avatarUrl: z.string().trim().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.avatarUrl && v.avatarUrl.length > 0) {
      const ok = z.string().url().safeParse(v.avatarUrl).success;
      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid URL",
          path: ["avatarUrl"],
        });
      }
    }
  });

export type RequestOtpInput = z.infer<typeof requestOtpInputSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpInputSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
