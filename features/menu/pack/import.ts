import fs from "fs";
import path from "path";
import { menuStorage } from "../storage";
import type { InsertMenuItem } from "../schema";

export async function importMenuPack(filePath: string) {
  const absolute = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Pack file not found: ${absolute}`);
  }

  const pack = JSON.parse(fs.readFileSync(absolute, "utf-8"));
  const items = (pack.data?.menu_items || []) as InsertMenuItem[];

  let upserted = 0;
  for (const item of items) {
    await menuStorage.upsertMenuItemByName(item);
    upserted++;
  }

  // Copy bundled images if present next to the pack JSON
  const packDir = path.dirname(absolute);
  const version = pack.version || "unknown";
  const imagesDir = path.join(packDir, `menu-v${version}`, "menu-images");
  const fallbackImages = path.join(
    packDir,
    path.basename(absolute, ".json"),
    "menu-images",
  );
  const sourceImages = fs.existsSync(imagesDir)
    ? imagesDir
    : fs.existsSync(fallbackImages)
      ? fallbackImages
      : null;

  let copiedFiles = 0;
  if (sourceImages) {
    const dest = path.resolve(process.cwd(), "client/public/menu-images");
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(sourceImages)) {
      fs.copyFileSync(
        path.join(sourceImages, file),
        path.join(dest, file),
      );
      copiedFiles++;
    }
  }

  return { upserted, copiedFiles, version: pack.version };
}
