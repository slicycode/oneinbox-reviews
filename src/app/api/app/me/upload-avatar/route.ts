import withAuthRequired from "@/lib/auth/withAuthRequired";
import createS3UploadFields from "@/lib/s3/createS3UploadFields";
import { NextResponse } from "next/server";
import { uploadAvatarSchema } from "@/lib/validations/file-upload.schema";

export const POST = withAuthRequired(async (req, context) => {
  try {
    const { session } = context;
    const body = await req.json();

    if (
      !process.env.AWS_BUCKET_NAME ||
      !process.env.AWS_REGION ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY
    ) {
      return NextResponse.json(
        {
          error:
            "AWS_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID, or AWS_SECRET_ACCESS_KEY is not set",
        },
        { status: 500 }
      );
    }

    // Validate input with Zod schema
    const validation = uploadAvatarSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { fileName, fileType, fileSize } = validation.data;
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Extract file extension
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "jpg";

    // Generate UUID for filename
    const fileUuid = crypto.randomUUID();

    // Construct S3 path: /public/users/<user-id>/avatars/<filename-uuid>.format
    const s3Path = `public/users/${session.user.id}/avatars/${fileUuid}.${fileExtension}`;

    // Create presigned URL
    const presignedPost = await createS3UploadFields({
      path: s3Path,
      maxSize: maxSize,
      contentType: fileType,
    });

    return NextResponse.json({
      url: presignedPost.url,
      fields: presignedPost.fields,
    });
  } catch (error) {
    console.error("Error creating presigned URL for avatar upload:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
});
