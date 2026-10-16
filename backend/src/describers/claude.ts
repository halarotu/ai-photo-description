import Anthropic from "@anthropic-ai/sdk";
import { detectMediaType } from "../image.ts";

const client = new Anthropic();

export async function describeImageWithClaude(buffer: Buffer): Promise<string> {
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
