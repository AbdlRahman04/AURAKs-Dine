import "../server/config";
import { importMenuPack } from "../features/menu/pack/import";

async function main() {
  const args = process.argv.slice(2);
  const feature = args[0] || "menu";
  const fileFlag = args.indexOf("--file");
  const filePath =
    fileFlag >= 0 ? args[fileFlag + 1] : args.find((a) => a.endsWith(".json"));

  if (feature !== "menu") {
    console.error(
      `Feature "${feature}" does not support pack import yet. Supported: menu`,
    );
    process.exit(1);
  }

  if (!filePath) {
    console.error(
      "Usage: npm run pack:import -- menu --file exports/menu-v1.0.0.json",
    );
    process.exit(1);
  }

  const result = await importMenuPack(filePath);
  console.log(
    `✅ Imported ${result.upserted} menu items (pack v${result.version})`,
  );
  if (result.copiedFiles > 0) {
    console.log(`🖼️  Copied ${result.copiedFiles} image file(s)`);
  }
}

main().catch((err) => {
  console.error("❌ Pack import failed:", err);
  process.exit(1);
});
