import OpenAI from "openai";
import fs from "node:fs/promises";
import { AngleSpec } from "./types.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_TEMPLATE = (angle: AngleSpec) => `
You are a vision inspector working for a 3‑D turnaround pipeline.
Given a single image frame, respond with JSON {"match":true|false, "reason":"…"}
only if the image **clearly** shows the required view: ${angle.label}.
Ignore lighting, background, or small pose drift – care only about the overall camera angle.
`;

export async function askVLM(
  framePath: string,
  angle: AngleSpec,
): Promise<{ match: boolean; reason: string }> {
  const bytes = await fs.readFile(framePath);
  const b64 = bytes.toString("base64");

  const resp = await openai.chat.completions.create({
    model: "o4-mini-2025-04-16",
    max_completion_tokens: 100000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_TEMPLATE(angle) },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/png;base64,${b64}` },
          },
        ],
      },
    ],
  });

  try {
    const json = JSON.parse(resp.choices[0].message.content ?? "{}");
    return { match: !!json.match, reason: json.reason ?? "" };
  } catch {
    return { match: false, reason: "Could not parse model response" };
  }
} 