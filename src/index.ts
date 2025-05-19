import { runPipeline } from "./filterFrames.js";
import { AngleSpec } from "./types.js";
import path from "node:path";
import fs from "node:fs/promises";

const usage = () => {
  console.log(`Usage: bun src/index.ts <video.mp4> [outputDir]`);
  process.exit(1);
};

async function ensureDirectories() {
  const dirs = ['tmp', 'output/3'];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true }).catch(() => {});
  }
}

(async () => {
  const [,, video, outDir] = process.argv;
  if (!video) usage();

  await ensureDirectories();

  const angles: AngleSpec[] = [
    {
      label: "front",
      prompt: `
  Return **match: true** only if the subject’s face / front torso is squarely
  facing the camera (yaw ≈ 0°). Both eyes, both shoulders, and the center of
  the chest are visible and roughly symmetric. No significant profile of either
  ear may dominate the view.
  `.trim()
    },
    {
      label: "back",
      prompt: `
  Match only if we see the back of the head / shoulders (yaw ≈ 180°). Neither
  eye is visible; facial features are completely hidden. Both scapulae or the
  shirt collar back seam should be visible. Reject if any facial feature shows.
  `.trim()
    },
    {
      label: "left",
      prompt: `
  The view qualifies as a pure left profile only when the camera sits roughly perpendicular to the object’s canonical front—within about ±10 ° of a 90 ° yaw—so that exclusively the left surface is visible, no front‑facing detail appears (for a human head this means only one eye socket is seen and the nose silhouette forms the outline), and the entire right side is completely occluded.
  `.trim()
    },
    {
      label: "right",
      prompt: `
  A view counts as a pure right profile only when the camera is positioned roughly perpendicular to the object’s canonical front—within about ±10 ° of a 90 ° yaw to the right—so that solely the right surface is visible, no front‑facing detail appears (for a human head this means only one eye socket is seen and the nose silhouette defines the outer contour), and the entire left side is completely occluded.
  `.trim()
    },
    {
      label: "3/4-left",
      prompt: `
  Match if yaw is roughly −45° (front‑left three‑quarter view). **Both eyes are
  visible**, but the LEFT cheek is broader than the right. The RIGHT ear is
  partially or fully hidden behind the head. Reject if the nose fully overlaps
  the cheek (profile) or if the face is nearly symmetric (front view).
  `.trim()
    },
    {
      label: "3/4-right",
      prompt: `
  Match if yaw is roughly +45° (front‑right three‑quarter view). **Both eyes are
  visible**, but the RIGHT cheek is broader than the left. The LEFT ear is
  partially or fully hidden. Reject if the view is pure profile or near‑front.
  `.trim()
    }
  ];
  

  const absVideo = path.resolve(video);
  const results = await runPipeline(absVideo, angles, { 
    outputDir: outDir,
    nFrames: 20 
  });

  for (const [label, res] of Object.entries(results)) {
    if (res?.matched) {
      console.log(`✅  Found ${label}: ${res.filePath}`);
    } else {
      console.log(`❌  No good ${label} frame found`);
    }
  }
})(); 