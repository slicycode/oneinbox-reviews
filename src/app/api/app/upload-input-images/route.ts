import withAuthRequired from "@/lib/auth/withAuthRequired";
import createS3UploadFields from "@/lib/s3/createS3UploadFields";
import { NextResponse } from "next/server";
import { uploadImageSchema } from "@/lib/validations/file-upload.schema";

export const POST = withAuthRequired(async (req, context) => {
  try {
    const { session } = context;
    const body = await req.json();

    // Validate input with Zod schema
    const validation = uploadImageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { fileName, fileType, fileSize } = validation.data;

    // Extract file extension
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "jpg";

    // Generate UUID for filename
    const fileUuid = crypto.randomUUID();

    // Construct S3 path: /public/users/<user-id>/images/<filename-uuid>.format
    const s3Path = `public/users/${session.user.id}/images/${fileUuid}.${fileExtension}`;

    // Create presigned URL
    const presignedPost = await createS3UploadFields({
      path: s3Path,
      maxSize: fileSize,
      contentType: fileType,
    });

    return NextResponse.json({
      url: presignedPost.url,
      fields: presignedPost.fields,
    });
  } catch (error) {
    console.error("Error creating presigned URL for image upload:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
});

