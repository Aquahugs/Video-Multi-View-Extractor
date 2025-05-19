# Video Multi-View Extractor

A CLI tool that extracts specific camera angle views from a video file using OpenAI's Vision model.

## Prerequisites

1. FFmpeg must be installed on your system:
   - macOS: `brew install ffmpeg`
   - Ubuntu/Debian: `apt-get install ffmpeg`
   - Windows: Download from [ffmpeg.org](https://ffmpeg.org)

2. Node.js ≥20 or Bun runtime installed

3. OpenAI API key with GPT-4 Vision access

## Setup

1. Clone the repository
2. Create a `.env` file in the project root:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

## Usage

```bash
# Using Bun (recommended)
bun run src/index.ts <path-to-video.mp4> [output-directory]

# Using Node
npm run build
node dist/index.js <path-to-video.mp4> [output-directory]
```

The tool will:
1. Extract frames from the video
2. Use GPT-4 Vision to identify frames matching requested angles
3. Save matching frames as PNGs in the output directory
4. Clean up temporary files

## Supported Views

- Front view
- Back view
- Left profile
- Right profile
- Front-left ¾ view
- Front-right ¾ view

## Output

The tool creates PNG files in the output directory (default: `./output`), named after each successfully found view (e.g. `front.png`, `3-4-left.png`, etc.). 