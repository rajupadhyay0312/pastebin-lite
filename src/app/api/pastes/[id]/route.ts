import { NextResponse } from "next/server";
import { redis } from "../../../../lib/redis";
import { headers } from "next/headers";

async function getNow(): Promise<number> {
  if (process.env.TEST_MODE === "1") {
    const h = await headers();
    const testNow = h.get("x-test-now-ms");
    if (testNow) {
      return Number(testNow);
    }
  }
  return Date.now();
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ FIX IS HERE
  const key = `paste:${id}`;

  const paste = await redis.get<any>(key);

  if (!paste) {
    return NextResponse.json(
      { error: "Paste not found" },
      { status: 404 }
    );
  }

  const now = await getNow();

  // Expiry check
  if (paste.expires_at && now > paste.expires_at) {
    await redis.del(key);
    return NextResponse.json(
      { error: "Paste expired" },
      { status: 410 }
    );
  }

  // Max views check
  if (paste.max_views !== null && paste.view_count >= paste.max_views) {
    await redis.del(key);
    return NextResponse.json(
      { error: "Paste view limit reached" },
      { status: 410 }
    );
  }

  // Increment view count
  paste.view_count += 1;
  await redis.set(key, paste);

  return NextResponse.json({
    content: paste.content,
    views_remaining:
      paste.max_views !== null
        ? paste.max_views - paste.view_count
        : null,
    expires_at: paste.expires_at,
  });
}
