import { describeImageWithClaude } from "./claude.ts";
import { describeImageWithQwen } from "./qwen.ts";

export type Describer = (buffer: Buffer) => Promise<string>;

// To add an AI, implement a describer in its own file and register it here
export const DESCRIBERS: Record<string, Describer> = {
  claude: describeImageWithClaude,
  qwen: describeImageWithQwen,
};

export const SUPPORTED_AI = Object.keys(DESCRIBERS);
