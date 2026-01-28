import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const key = `paste:${id}`;
  const paste = await redis.get<any>(key);

  if (!paste) {
    return NextResponse.json(
      { error: "Paste not found" },
      { status: 404 }
    );
  }

  const now = Date.now();

  // TTL check
  if (paste.expires_at && paste.expires_at < now) {
    await redis.del(key);
    return NextResponse.json(
      { error: "Paste expired" },
      { status: 404 }
    );
  }

  // Increment FIRST
  const newViewCount = paste.view_count + 1;

  // Max views check AFTER increment
  if (
    paste.max_views !== null &&
    newViewCount > paste.max_views
  ) {
    await redis.del(key);
    return NextResponse.json(
      { error: "Paste view limit reached" },
      { status: 404 }
    );
  }

  // Persist increment
  await redis.set(key, {
    ...paste,
    view_count: newViewCount,
  });

  return NextResponse.json({
    content: paste.content,
    expires_at: paste.expires_at,
    views_remaining:
      paste.max_views !== null
        ? paste.max_views - newViewCount
        : null,
  });
}
