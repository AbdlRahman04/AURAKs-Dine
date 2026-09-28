import * as XLSX from "xlsx";

/**
 * Smoke test against a running QuickDineFlow server.
 * Local (default): npm run smoke
 * Render (explicit): SMOKE_TARGET=render SMOKE_BASE_URL=https://your-app.onrender.com npm run smoke
 */
const smokeTarget = process.env.SMOKE_TARGET || "local";
if (smokeTarget !== "local" && smokeTarget !== "render") {
  throw new Error(`Invalid SMOKE_TARGET "${smokeTarget}". Use "local" or "render".`);
}

const baseUrl = smokeTarget === "render"
  ? process.env.SMOKE_BASE_URL
  : process.env.SMOKE_LOCAL_BASE_URL || "http://localhost:5000";

if (!baseUrl) {
  throw new Error('SMOKE_BASE_URL is required when SMOKE_TARGET="render".');
}

async function check(path: string, init?: RequestInit) {
  const res = await fetch(`${baseUrl}${path}`, init);
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep text */
  }
  return { ok: res.ok, status: res.status, body, headers: res.headers };
}

async function checkBinary(path: string, init?: RequestInit) {
  const res = await fetch(`${baseUrl}${path}`, init);
  return {
    ok: res.ok,
    status: res.status,
    bytes: new Uint8Array(await res.arrayBuffer()),
    headers: res.headers,
  };
}

function createMenuImageForm(data: Record<string, unknown>, image: Blob, action = "upload") {
  const form = new FormData();
  form.append("data", JSON.stringify(data));
  form.append("imageAction", action);
  if (action === "upload") form.append("image", image, "smoke-image.png");
  return form;
}

const ONE_PIXEL_PNG = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  ),
);

async function main() {
  console.log(`🔍 Smoke testing ${smokeTarget} target: ${baseUrl} ...`);
  let failed = 0;

  const health = await check("/api/health");
  if (!health.ok) {
    console.error(`❌ /api/health → ${health.status}`);
    failed++;
  } else {
    console.log("✅ /api/health");
  }

  const menu = await check("/api/menu");
  const menuBody = menu.body as {
    items?: unknown[];
    page?: number;
    limit?: number;
    hasMore?: boolean;
    total?: number;
  };
  if (
    !menu.ok ||
    !menuBody ||
    !Array.isArray(menuBody.items) ||
    menuBody.page !== 1 ||
    typeof menuBody.limit !== "number" ||
    typeof menuBody.hasMore !== "boolean" ||
    typeof menuBody.total !== "number"
  ) {
    console.error(`❌ /api/menu → ${menu.status}`);
    failed++;
  } else {
    console.log(`✅ /api/menu (${menuBody.items.length}/${menuBody.total} items, paginated)`);
  }

  const protectedAdminMenu = await check("/api/admin/menu");
  if (protectedAdminMenu.status !== 401 && protectedAdminMenu.status !== 403) {
    console.error(`❌ /api/admin/menu protection → ${protectedAdminMenu.status}`);
    failed++;
  } else {
    console.log(`✅ /api/admin/menu protected (${protectedAdminMenu.status})`);
  }

  const protectedOrderSummary = await check("/api/orders/summary");
  if (protectedOrderSummary.status !== 401 && protectedOrderSummary.status !== 403) {
    console.error(`Order summary authorization check failed: ${protectedOrderSummary.status}`);
    failed++;
  }

  for (const path of ["/api/analytics", "/api/analytics/export"]) {
    const protectedAnalytics = await check(path);
    if (protectedAnalytics.status !== 401 && protectedAnalytics.status !== 403) {
      console.error(`Analytics authorization check failed: ${path} returned ${protectedAnalytics.status}`);
      failed++;
    }
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

    const setCookie = login.headers.get("set-cookie");
    const sessionCookie = setCookie?.split(";")[0];
    if (!sessionCookie) {
      console.error("❌ /api/orders → login did not return a session cookie");
      failed++;
    } else {
      const unauthorizedUpload = await check("/api/menu", {
        method: "POST",
        body: createMenuImageForm({}, new Blob([ONE_PIXEL_PNG], { type: "image/png" })),
      });
      if (unauthorizedUpload.status !== 401 && unauthorizedUpload.status !== 403) {
        console.error(`❌ menu image upload protection → ${unauthorizedUpload.status}`);
        failed++;
      } else {
        console.log(`✅ menu image upload protected (${unauthorizedUpload.status})`);
      }

      const adminMenu = await check("/api/admin/menu", {
        headers: { Cookie: sessionCookie },
      });
      const adminMenuBody = adminMenu.body as {
        items?: unknown[];
        page?: number;
        total?: number;
      };
      if (
        !adminMenu.ok ||
        !adminMenuBody ||
        !Array.isArray(adminMenuBody.items) ||
        adminMenuBody.page !== 1 ||
        typeof adminMenuBody.total !== "number"
      ) {
        console.error(`❌ /api/admin/menu → ${adminMenu.status}`);
        failed++;
      } else {
        console.log(`✅ /api/admin/menu (${adminMenuBody.items.length}/${adminMenuBody.total} items)`);
      }

      const orderSummary = await check("/api/orders/summary", {
        headers: { Cookie: sessionCookie },
      });
      const orderSummaryBody = orderSummary.body as { hasOrders?: unknown };
      if (!orderSummary.ok || typeof orderSummaryBody?.hasOrders !== "boolean") {
        console.error(`❌ /api/orders/summary → ${orderSummary.status}`);
        failed++;
      } else {
        console.log(`✅ /api/orders/summary (hasOrders: ${orderSummaryBody.hasOrders})`);
      }

      const analytics = await check("/api/analytics?range=7days", {
        headers: { Cookie: sessionCookie },
      });
      const analyticsBody = analytics.body as {
        summary?: { sales?: number; orderCount?: number };
        dailyStats?: unknown[]; hourlyStats?: unknown[]; itemPerformance?: unknown[];
        orders?: unknown[]; orderItems?: unknown[]; paymentStatus?: unknown[];
        turnaround?: unknown[]; feedback?: unknown[];
      };
      if (
        !analytics.ok || !analyticsBody?.summary ||
        typeof analyticsBody.summary.sales !== "number" ||
        typeof analyticsBody.summary.orderCount !== "number" ||
        !Array.isArray(analyticsBody.dailyStats) || !Array.isArray(analyticsBody.hourlyStats) ||
        !Array.isArray(analyticsBody.itemPerformance) || !Array.isArray(analyticsBody.orders) ||
        !Array.isArray(analyticsBody.orderItems) || !Array.isArray(analyticsBody.paymentStatus) ||
        !Array.isArray(analyticsBody.turnaround) || !Array.isArray(analyticsBody.feedback)
      ) {
        console.error(`Analytics report check failed: ${analytics.status}`);
        failed++;
      } else {
        console.log("Analytics KPI and detail datasets passed");
      }

      const invalidRange = await check("/api/analytics?startDate=2026-09-27&endDate=2026-09-20", {
        headers: { Cookie: sessionCookie },
      });
      if (invalidRange.status !== 400) {
        console.error(`Analytics date validation check failed: ${invalidRange.status}`);
        failed++;
      }

      const workbookResponse = await checkBinary("/api/analytics/export?range=7days", {
        headers: { Cookie: sessionCookie },
      });
      let sheetNames: string[] = [];
      let workbook: XLSX.WorkBook | undefined;
      try {
        workbook = XLSX.read(workbookResponse.bytes, { type: "array" });
        sheetNames = workbook.SheetNames;
      } catch {
        /* Invalid workbook is reported below. */
      }
      const expectedSheets = ["KPI Summary", "Daily Trends", "Hourly Demand", "Item Performance", "Orders", "Order Items", "Payment Status", "Turnaround", "Feedback"];
      if (
        !workbookResponse.ok ||
        workbookResponse.headers.get("content-type") !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        expectedSheets.some((name) => !sheetNames.includes(name)) ||
        !workbook ||
        XLSX.utils.sheet_to_json(workbook.Sheets.Orders).length !== (analyticsBody.orders?.length ?? -1) ||
        XLSX.utils.sheet_to_json(workbook.Sheets["Order Items"]).length !== (analyticsBody.orderItems?.length ?? -1)
      ) {
        console.error(`Analytics workbook check failed: ${workbookResponse.status}`);
        failed++;
      } else {
        console.log("Analytics workbook sheet check passed");
      }

      const orders = await check("/api/orders?page=1&limit=50", {
        headers: { Cookie: sessionCookie },
      });
      const body = orders.body as {
        items?: unknown[];
        page?: number;
        limit?: number;
        hasMore?: boolean;
      };
      if (
        !orders.ok ||
        !body ||
        !Array.isArray(body.items) ||
        body.page !== 1 ||
        body.limit !== 50 ||
        typeof body.hasMore !== "boolean"
      ) {
        console.error(`❌ /api/orders → ${orders.status}`);
        failed++;
      } else {
        console.log(`✅ /api/orders (${body.items.length} items, paginated)`);
      }

      const smokeName = `Smoke Image ${Date.now()}`;
      let smokeItemId: number | undefined;
      const imageForm = createMenuImageForm({
        name: smokeName,
        category: "Snacks",
        price: "1.00",
        unitCost: "0.25",
        preparationTime: 1,
        isAvailable: false,
        isSpecial: false,
        dietaryTags: [],
        allergens: [],
      }, new Blob([ONE_PIXEL_PNG], { type: "image/png" }));
      const imageCreate = await check("/api/menu", {
        method: "POST",
        headers: { Cookie: sessionCookie },
        body: imageForm,
      });
      const imageItem = imageCreate.body as { id?: number; imageUrl?: string; imageData?: unknown };
      if (
        !imageCreate.ok ||
        typeof imageItem?.id !== "number" ||
        !imageItem.imageUrl?.startsWith("/api/menu/") ||
        "imageData" in imageItem
      ) {
        console.error(`❌ menu image upload → ${imageCreate.status}`);
        failed++;
      } else {
        smokeItemId = imageItem.id;
        console.log("✅ menu image converted and stored without exposing binary data");

        const adminCost = await check(`/api/admin/menu?search=${encodeURIComponent(smokeName)}`, {
          headers: { Cookie: sessionCookie },
        });
        const adminCostRows = (adminCost.body as { items?: Array<{ unitCost?: string | null }> }).items;
        const publicCost = await check(`/api/menu/${smokeItemId}`);
        if (!adminCost.ok || adminCostRows?.[0]?.unitCost !== "0.25" || "unitCost" in (publicCost.body as object)) {
          console.error("Menu unit cost access/privacy check failed");
          failed++;
        } else {
          console.log("Menu unit cost is admin-only");
        }

        const storedImage = await checkBinary(`/api/menu/${smokeItemId}/image`);
        const isWebp =
          storedImage.bytes.length >= 12 &&
          String.fromCharCode(...Array.from(storedImage.bytes.slice(0, 4))) === "RIFF" &&
          String.fromCharCode(...Array.from(storedImage.bytes.slice(8, 12))) === "WEBP";
        if (!storedImage.ok || storedImage.headers.get("content-type") !== "image/webp" || !isWebp) {
          console.error(`❌ menu image WebP endpoint → ${storedImage.status}`);
          failed++;
        } else {
          console.log("✅ menu image endpoint serves WebP");
        }

        const invalidImage = await check(`/api/menu/${smokeItemId}`, {
          method: "PATCH",
          headers: { Cookie: sessionCookie },
          body: createMenuImageForm({}, new Blob(["not an image"], { type: "image/png" })),
        });
        if (invalidImage.status !== 400) {
          console.error(`❌ invalid menu image rejection → ${invalidImage.status}`);
          failed++;
        } else {
          console.log("✅ invalid menu image rejected");
        }

        const removedImage = await check(`/api/menu/${smokeItemId}`, {
          method: "PATCH",
          headers: { Cookie: sessionCookie },
          body: createMenuImageForm({}, new Blob([]), "remove"),
        });
        const removedEndpoint = await checkBinary(`/api/menu/${smokeItemId}/image`);
        if (!removedImage.ok || removedEndpoint.status !== 404) {
          console.error(`❌ menu image removal → ${removedImage.status}/${removedEndpoint.status}`);
          failed++;
        } else {
          console.log("✅ menu image removed");
        }

        const cleanup = await check(`/api/menu/${smokeItemId}`, {
          method: "DELETE",
          headers: { Cookie: sessionCookie },
        });
        if (!cleanup.ok) {
          console.warn(`⚠️ smoke menu cleanup → ${cleanup.status}`);
        }
      }
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
