import multer from "multer";
import sharp, { type Metadata } from "sharp";

export const MAX_MENU_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_MENU_IMAGE_PIXELS = 25_000_000;
export const MAX_MENU_IMAGE_OUTPUT_BYTES = 2 * 1024 * 1024;
export const MAX_MENU_IMAGE_DIMENSION = 1600;

export class MenuImageError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "MenuImageError";
    this.statusCode = statusCode;
  }
}

export const menuImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MENU_IMAGE_BYTES, files: 1 },
});

function isSupportedImageMetadata(metadata: Metadata) {
  return Boolean(
    metadata.format &&
      metadata.width &&
      metadata.height &&
      metadata.width * metadata.height <= MAX_MENU_IMAGE_PIXELS,
  );
}

export async function convertMenuImageToWebp(file: Express.Multer.File): Promise<Buffer> {
  if (!file?.buffer?.length) {
    throw new MenuImageError("Choose an image file before saving.");
  }

  let metadata: Metadata;
  try {
    metadata = await sharp(file.buffer, {
      limitInputPixels: MAX_MENU_IMAGE_PIXELS,
    }).metadata();
  } catch {
    throw new MenuImageError(
      "This image could not be read. Choose a valid JPG, PNG, GIF, WebP, AVIF, TIFF, or SVG image.",
    );
  }

  if (!isSupportedImageMetadata(metadata)) {
    throw new MenuImageError(
      "This image is too large or does not contain a supported image format.",
    );
  }

  for (const quality of [82, 72, 60]) {
    try {
      const output = await sharp(file.buffer, {
        limitInputPixels: MAX_MENU_IMAGE_PIXELS,
      })
        .rotate()
        .resize({
          width: MAX_MENU_IMAGE_DIMENSION,
          height: MAX_MENU_IMAGE_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality, effort: 4 })
        .toBuffer();

      if (output.length <= MAX_MENU_IMAGE_OUTPUT_BYTES) {
        return output;
      }
    } catch {
      throw new MenuImageError(
        "The image could not be converted to WebP. Choose another image file.",
      );
    }
  }

  throw new MenuImageError(
    "This image is still larger than 2 MB after WebP compression. Choose a smaller image.",
  );
}
