
import { spawn } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ffmpegExecutable = path.join(
  process.cwd(),
  "node_modules",
  "ffmpeg-static",
  process.platform === "win32"
    ? "ffmpeg.exe"
    : "ffmpeg"
);

  let inputPath = "";
  let outputPath = "";

  try {
    const formData = await request.formData();
    const video = formData.get("video");

    if (!(video instanceof File)) {
      return Response.json(
        {
          success: false,
          error: "No video file was provided.",
        },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const tempDir = os.tmpdir();

    inputPath = path.join(
      tempDir,
      `mspace-video-${id}`
    );

    outputPath = path.join(
      tempDir,
      `mspace-thumbnail-${id}.jpg`
    );

    const videoBuffer = Buffer.from(
      await video.arrayBuffer()
    );

    await fs.writeFile(inputPath, videoBuffer);

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn(ffmpegExecutable, [
        "-i",
        inputPath,

        "-frames:v",
        "1",

        "-vf",
        "scale=640:-1",

        "-q:v",
        "2",

        "-y",
        outputPath,
      ]);

      let errorOutput = "";

      ffmpeg.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      ffmpeg.on("error", reject);

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new Error(
              `FFmpeg failed with code ${code}: ${errorOutput}`
            )
          );
        }
      });
    });

    const thumbnail = await fs.readFile(
      outputPath
    );

    return new Response(thumbnail, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "Video thumbnail generation failed:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Thumbnail generation failed.",
      },
      { status: 500 }
    );
  } finally {
    if (inputPath) {
      await fs.rm(inputPath, {
        force: true,
      }).catch(() => {});
    }

    if (outputPath) {
      await fs.rm(outputPath, {
        force: true,
      }).catch(() => {});
    }
  }
}