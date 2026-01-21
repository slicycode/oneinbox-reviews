import Replicate from "replicate";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

if (!process.env.REPLICATE_API_TOKEN) {
  console.error("❌ REPLICATE_API_TOKEN is not set");
  process.exit(1);
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function main() {
  const prompt = process.argv[2] ||
    "Professional minimalist logo design, single geometric icon mark, abstract inbox combined with star, clean vector style, flat design, solid black, white background, tech branding like Linear or Notion, simple, no text, no gradients, symmetrical";

  console.log("🎨 Generating logo with FLUX 1.1 Pro...");
  console.log(`📝 Prompt: "${prompt}"`);

  try {
    // Generate with FLUX
    const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
      input: {
        prompt,
        aspect_ratio: "1:1",
        output_format: "png",
        output_quality: 100,
        safety_tolerance: 2,
        prompt_upsampling: true,
      },
    });

    // Handle ReadableStream output
    let imageBuffer: Buffer;

    if (output instanceof ReadableStream) {
      console.log("📥 Downloading from stream...");
      const reader = output.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      imageBuffer = Buffer.concat(chunks);
    } else if (typeof output === "string") {
      console.log("📥 Downloading from URL...");
      const response = await fetch(output);
      imageBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      throw new Error(`Unexpected output type: ${typeof output}`);
    }

    console.log(`✅ Downloaded: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

    // Remove background
    console.log("🔄 Removing background...");

    // Save temp file for background removal
    const tempPath = path.join(process.cwd(), "public/assets/temp-logo.png");
    fs.writeFileSync(tempPath, imageBuffer);

    // Upload to get URL for background removal
    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    const bgRemoved = await replicate.run("bria/remove-background", {
      input: {
        image: dataUrl,
      },
    });

    let finalBuffer: Buffer;

    if (bgRemoved instanceof ReadableStream) {
      const reader = bgRemoved.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      finalBuffer = Buffer.concat(chunks);
    } else if (typeof bgRemoved === "string") {
      if (bgRemoved.startsWith("data:")) {
        const base64Data = bgRemoved.split(",")[1];
        finalBuffer = Buffer.from(base64Data, "base64");
      } else {
        const response = await fetch(bgRemoved);
        finalBuffer = Buffer.from(await response.arrayBuffer());
      }
    } else {
      throw new Error(`Unexpected bg removal output: ${typeof bgRemoved}`);
    }

    // Process with sharp - trim and resize
    console.log("✂️ Processing image...");
    const processed = await sharp(finalBuffer)
      .trim()
      .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    // Save final logo
    const logoPath = path.join(process.cwd(), "public/assets/logo.png");
    fs.writeFileSync(logoPath, processed);

    // Cleanup temp
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    console.log(`✅ Logo saved to: public/assets/logo.png`);
    console.log(`📊 Final size: ${(processed.length / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
}

main();
