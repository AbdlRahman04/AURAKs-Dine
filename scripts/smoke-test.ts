/**
 * Smoke test against a running QuickDineFlow server.
 * Usage: npm run smoke
 * Optional: SMOKE_BASE_URL=https://your-app.onrender.com npm run smoke
 */
const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:5000";

async function check(path: string, init?: RequestInit) {
  const res = await fetch(`${baseUrl}${path}`, init);
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep text */
  }
  return { ok: res.ok, status: res.status, body };
}

async function main() {
  console.log(`🔍 Smoke testing ${baseUrl} ...`);
  let failed = 0;

  const health = await check("/api/health");
  if (!health.ok) {
    console.error(`❌ /api/health → ${health.status}`);
    failed++;
  } else {
    console.log("✅ /api/health");
  }

  const menu = await check("/api/menu");
  if (!menu.ok || !Array.isArray(menu.body)) {
    console.error(`❌ /api/menu → ${menu.status}`);
    failed++;
  } else {
    console.log(`✅ /api/menu (${(menu.body as unknown[]).length} items)`);
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@quickdine.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";

  const login = await check("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });

  if (!login.ok) {
    console.warn(
      `⚠️  /api/auth/login → ${login.status} (seed admin may be missing)`,
    );
  } else {
    const user = login.body as { password?: string; email?: string };
    if (user.password) {
      console.error("❌ Login response leaked password hash");
      failed++;
    } else {
      console.log(`✅ /api/auth/login (${user.email})`);
    }
  }

  if (failed > 0) {
    console.error(`\n❌ Smoke test failed (${failed} check(s))`);
    process.exit(1);
  }

  console.log("\n✅ Smoke test passed");
}

main().catch((err) => {
  console.error("❌ Smoke test error:", err.message || err);
  console.error("   Is the server running? Try: npm run dev");
  process.exit(1);
});
