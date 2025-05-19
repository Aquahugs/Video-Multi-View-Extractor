import ffmpeg from "fluent-ffmpeg";
import path from "node:path";
import fs from "node:fs/promises";

/**
 * Extracts N evenly‑spaced frames from an mp4 and writes them into tmpDir.
 * Returns absolute file paths.
 */
export async function extractFrames(
  videoPath: string,
  tmpDir: string,
  nFrames: number = 10,
): Promise<string[]> {
  await fs.mkdir(tmpDir, { recursive: true });

  // Generate a pattern: frame_%03d.png
  const framePattern = path.join(tmpDir, "frame_%03d.png");

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on("error", reject)
      .on("end", async () => {
        // Collect generated paths – assume 0‑indexed up to nFrames‑1
        const files = await fs.readdir(tmpDir);
        resolve(files.map(f => path.join(tmpDir, f)));
      })
      .outputOptions([
        `-vf fps=${nFrames}`, // fps filter ensures N frames total regardless of video length
        "-vcodec png",
        "-hide_banner",
      ])
      .output(framePattern)
      .run();
  });
}
