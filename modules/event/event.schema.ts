import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { z } from "zod";

dayjs.extend(customParseFormat);

const eventLocationSchema = z.object({
  label: z.string().trim().min(1),
});

export const createEventInputSchema = z
  .object({
    occasion: z.string().trim().min(1).max(100),
    date: z.string().trim().min(1, "Date is required"),
    mainLocation: z.string().trim().min(1).max(255),
    description: z.string().trim().min(1, "Description is required"),
    locations: z.array(eventLocationSchema).default([]),
    title: z.string().trim().min(1).max(160),
    coverImageUrl: z.string().trim().optional(),
    videoMessageUrl: z.string().trim().optional(),
  })
  .superRefine((v, ctx) => {
    const parsed = dayjs(v.date, "YYYY-MM-DD", true);
    if (!parsed.isValid()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid date",
        path: ["date"],
      });
    } else if (parsed.startOf("day").isBefore(dayjs().startOf("day"))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Event date must be today or in the future",
        path: ["date"],
      });
    }

    if (v.coverImageUrl && v.coverImageUrl.length > 0) {
      if (!z.string().url().safeParse(v.coverImageUrl).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid cover image URL",
          path: ["coverImageUrl"],
        });
      }
    }
    if (v.videoMessageUrl && v.videoMessageUrl.length > 0) {
      if (!z.string().url().safeParse(v.videoMessageUrl).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid video URL",
          path: ["videoMessageUrl"],
        });
      }
    }
  });

export type CreateEventInput = z.infer<typeof createEventInputSchema>;
