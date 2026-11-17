import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "media";

/**
 * Ensure the public media bucket exists in Supabase Storage.
 */
async function ensureBucket() {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 25 * 1024 * 1024, // 25 MB limit
      });
    }
  } catch (err) {
    // Bucket might already exist or create is restricted
    console.warn("Storage bucket check:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    // Collect all files from "files" or "file" form keys
    const incomingFiles: File[] = [];
    const filesMulti = formData.getAll("files");
    const fileSingle = formData.getAll("file");

    [...filesMulti, ...fileSingle].forEach((item) => {
      if (item instanceof File && item.size > 0) {
        incomingFiles.push(item);
      }
    });

    if (incomingFiles.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded. Please select an image or document." },
        { status: 400 }
      );
    }

    const folder = (formData.get("folder") as string)?.trim() || "herbs";

    await ensureBucket();

    const uploadedResults: {
      url: string;
      originalName: string;
      path: string;
      size: number;
      type: string;
    }[] = [];

    for (const file of incomingFiles) {
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .toLowerCase();
      const uniqueSuffix = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`;
      const filePath = `${folder}/${uniqueSuffix}_${sanitizedName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        return NextResponse.json(
          {
            error: `Failed to upload "${file.name}": ${uploadError.message}`,
          },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(filePath);

      uploadedResults.push({
        url: publicUrl,
        originalName: file.name,
        path: filePath,
        size: file.size,
        type: file.type,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully uploaded ${uploadedResults.length} file(s)`,
        files: uploadedResults,
        url: uploadedResults[0]?.url, // Convenience for single-file upload
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process upload" },
      { status: 500 }
    );
  }
}
