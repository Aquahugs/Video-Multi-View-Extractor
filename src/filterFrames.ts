import { extractFrames } from "./frameExtractor.js";
import { askVLM } from "./openaiClient.js";
import { AngleSpec, FrameResult } from "./types.js";
import path from "node:path";
import fs from "node:fs/promises";

export async function runPipeline(
  videoPath: string,
  angles: AngleSpec[],
  opts?: { nFrames?: number; tmpDir?: string; outputDir?: string },
): Promise<Record<string, FrameResult | undefined>> {
  const tmpDir = opts?.tmpDir ?? path.join(process.cwd(), "tmp");
  const outputDir = opts?.outputDir ?? path.join(process.cwd(), "output");
  const nFrames = opts?.nFrames ?? 20;
  await fs.mkdir(outputDir, { recursive: true });

  const frames = await extractFrames(videoPath, tmpDir, nFrames);
  const results: Record<string, FrameResult | undefined> = {};

  for (const angle of angles) {
    for (const frame of frames) {
      const { match, reason } = await askVLM(frame, angle);
      if (match) {
        const dest = path.join(outputDir, `${angle.label}.png`);
        await copyFile(frame, dest);
        results[angle.label] = { filePath: dest, matched: true, explanation: reason };
        break; // stop scanning once we found a good frame for this angle
      }
    }
    if (!results[angle.label]) {
      results[angle.label] = undefined; // none found
    }
  }
  // Clean up tmp directory
  await fs.rm(tmpDir, { recursive: true, force: true });
  return results;
}

// Before copying files
async function copyFile(src: string, dest: string) {
  // Ensure the destination directory exists
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
} 