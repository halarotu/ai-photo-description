const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const TIMEOUT_MS = 180_000;

export async function describeImageWithQwen(buffer: Buffer): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model: "qwen2.5vl:7b",
      messages: [
        {
          role: "user",
          content: "Describe this photo in one or two sentences.",
          images: [buffer.toString("base64")],
        },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const description = data?.message?.content;
  if (typeof description !== "string") throw new Error("Unexpected response from Ollama");

  return description.trim();
}
