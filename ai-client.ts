import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Claude accepts JPEG, PNG, GIF and WebP; detect which one from the file's magic bytes
export function detectMediaType(buffer: Buffer) {
  if (buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") return "image/png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

export async function describeImage(buffer: Buffer): Promise<string> {
  const mediaType = detectMediaType(buffer);
  if (!mediaType) throw new Error("Unsupported image format");

  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: buffer.toString("base64") } },
          { type: "text", text: "Describe this photo in one or two sentences." },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") throw new Error("The model declined to describe this image");

  let description = "";
  for (const block of response.content) {
    if (block.type === "text") description += block.text;
  }
  return description.trim();
}
