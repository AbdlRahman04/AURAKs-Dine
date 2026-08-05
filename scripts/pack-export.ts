import "../server/config";
import { exportMenuPack } from "../features/menu/pack/export";

async function main() {
  const feature = process.argv[2] || "menu";

  if (feature !== "menu") {
    console.error(
      `Feature "${feature}" does not support pack export yet. Supported: menu`,
    );
    process.exit(1);
  }

  const result = await exportMenuPack();
  console.log(`✅ Exported ${result.itemCount} menu items → ${result.outFile}`);
  console.log(`📦 Manifest version bumped to ${result.nextVersion}`);
}

main().catch((err) => {
  console.error("❌ Pack export failed:", err);
  process.exit(1);
});
