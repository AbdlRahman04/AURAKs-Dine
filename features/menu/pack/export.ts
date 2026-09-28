import fs from "fs";
import path from "path";
import { menuStorage } from "../storage";

const MANIFEST_PATH = path.resolve(
  process.cwd(),
  "features/menu/pack/manifest.json",
);

export async function exportMenuPack() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  const items = await menuStorage.getAllMenuItemsWithImages();

  const localImages: string[] = [];
  const databaseImages: Array<{ name: string; file: string; data: Buffer }> = [];
  const exportedItems = items.map(({ id, imageData, ...item }) => {
    if (imageData) {
      const file = `menu-item-${id}.webp`;
      databaseImages.push({ name: item.name, file, data: imageData });
      return { ...item, imageUrl: null };
    }

    if (item.imageUrl?.startsWith("/menu-images/")) {
      localImages.push(item.imageUrl);
    }
    return item;
  });

  const pack = {
    ...manifest,
    exportedAt: new Date().toISOString(),
    data: {
      menu_items: exportedItems.map(
        ({ createdAt: _c, updatedAt: _u, ...rest }) => rest,
      ),
    },
    files: [...localImages, ...databaseImages.map((image) => `/menu-images/${image.file}`)],
    image_files: databaseImages.map(({ name, file }) => ({ name, file })),
  };

  const version = manifest.version as string;
  const outDir = path.resolve(process.cwd(), "exports");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `menu-v${version}.json`);
  fs.writeFileSync(outFile, JSON.stringify(pack, null, 2));

  // Copy referenced images into exports/menu-vX/menu-images/
  const imagesOut = path.join(outDir, `menu-v${version}`, "menu-images");
  fs.mkdirSync(imagesOut, { recursive: true });
  for (const imgPath of localImages) {
    const src = path.resolve(process.cwd(), "client/public", imgPath.replace(/^\//, ""));
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(imagesOut, path.basename(src)));
    }
  }
  for (const image of databaseImages) {
    fs.writeFileSync(path.join(imagesOut, image.file), image.data);
  }

  // Bump patch version in manifest
  const [major, minor, patch] = version.split(".").map(Number);
  manifest.version = `${major}.${minor}.${(patch || 0) + 1}`;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  return { outFile, nextVersion: manifest.version, itemCount: items.length };
}
