import { z } from "zod";

// Safe filename pattern - alphanumeric, hyphens, underscores, dots
const safeFilenamePattern = /^[\w\-.]+$/;

// Allowed image MIME types
const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const uploadImageSchema = z.object({
  fileName: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename too long")
    .regex(safeFilenamePattern, "Invalid filename characters"),
  fileType: z
    .string()
    .refine((type) => allowedImageTypes.includes(type), {
      message: "Only JPEG, PNG, GIF, and WebP images are allowed",
    }),
  fileSize: z
    .number()
    .positive("File size must be positive")
    .max(10 * 1024 * 1024, "File size cannot exceed 10MB"),
});

export const uploadAvatarSchema = z.object({
  fileName: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename too long")
    .regex(safeFilenamePattern, "Invalid filename characters"),
  fileType: z
    .string()
    .refine((type) => allowedImageTypes.includes(type), {
      message: "Only JPEG, PNG, GIF, and WebP images are allowed",
    }),
  fileSize: z
    .number()
    .positive("File size must be positive")
    .max(5 * 1024 * 1024, "Avatar file size cannot exceed 5MB"),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>;
