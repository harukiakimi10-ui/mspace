import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  canEncodeVideo,
} from "mediabunny";


export async function compressVideo(file: File): Promise<File> {

  console.log(
    "Starting video compression:",
    (file.size / 1024 / 1024).toFixed(2),
    "MB"
  );

  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  });

  const videoTrack = await input.getPrimaryVideoTrack();

  if (!videoTrack) {
    throw new Error("No video track found.");
  }

  const duration = await input.computeDuration();

  if (!duration || !Number.isFinite(duration)) {
    throw new Error("Could not determine video duration.");
  }

  const width = await videoTrack.getDisplayWidth();
  const height = await videoTrack.getDisplayHeight();

  console.log("Original video:", {
    width,
    height,
    duration,
  });

  /*
   * We target approximately 8 MB instead of exactly 10 MB.
   * This gives us some safety margin for the MP4 container
   * and audio.
   */

  const targetBytes = 6 * 1024 * 1024;

  /*
   * Reserve approximately 128 kbps for audio.
   */
  const audioBitrate = 128_000;

  /*
   * Calculate the video bitrate from the duration.
   */
  const totalBitrate = (targetBytes * 8) / duration;

  const videoBitrate = Math.max(
    150_000,
    Math.floor(totalBitrate - audioBitrate)
  );

  console.log(
    "Compression bitrate:",
    Math.round(videoBitrate / 1000),
    "kbps"
  );

  /*
   * We want MP4/H.264 because it is the safest
   * common format for iPhone, Android and PC.
   */
  const canUseAvc = await canEncodeVideo("avc", {
    width,
    height,
    bitrate: videoBitrate,
  });

  if (!canUseAvc) {
    throw new Error(
      "This device/browser cannot encode H.264 video."
    );
  }

  const output = new Output({
    format: new Mp4OutputFormat({
      fastStart: "in-memory",
    }),
    target: new BufferTarget(),
  });

  const conversion = await Conversion.init({
    input,
    output,

    tracks: "primary",

    video: {
      codec: "avc",
      bitrate: videoBitrate,
      forceTranscode: true,
      hardwareAcceleration: "no-preference",
    },

    audio: {
      codec: "aac",
      bitrate: audioBitrate,
    },
  });

  if (!conversion.isValid) {
    console.error(
      "Video conversion is invalid:",
      conversion.discardedTracks
    );

    throw new Error(
      "This video cannot be converted on this device."
    );
  }

  conversion.onProgress = (progress) => {
    console.log(
      "Video compression:",
      Math.round(progress * 100) + "%"
    );
  };

  await conversion.execute();

  const buffer = output.target.buffer;

  if (!buffer) {
    throw new Error(
      "Video compression completed but produced no file."
    );
  }

  const compressedFile = new File(
    [buffer],
    `mspace-${Date.now()}.mp4`,
    {
      type: "video/mp4",
    }
  );

  console.log(
    "Compression complete:",
    (compressedFile.size / 1024 / 1024).toFixed(2),
    "MB"
  );

  return compressedFile;
}