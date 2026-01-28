import { NextResponse } from "next/server";
import { redis } from "../../../lib/redis";
import { randomBytes } from "crypto";
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

function generateId(): string {
  return randomBytes(6).toString("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, ttl_seconds, max_views } = body;

    // Validate content
    if (typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "content must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate ttl_seconds
    if (
      ttl_seconds !== undefined &&
      (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
    ) {
      return NextResponse.json(
        { error: "ttl_seconds must be an integer >= 1" },
        { status: 400 }
      );
    }

    // Validate max_views
    if (
      max_views !== undefined &&
      (!Number.isInteger(max_views) || max_views < 1)
    ) {
      return NextResponse.json(
        { error: "max_views must be an integer >= 1" },
        { status: 400 }
      );
    }

    const id = generateId();
    const now = await getNow();

    const paste = {
      id,
      content,
      created_at: now,
      expires_at: ttl_seconds ? now + ttl_seconds * 1000 : null,
      max_views: max_views ?? null,
      view_count: 0,
    };

    // ✅ FIX: store object directly (NOT JSON.stringify)
    await redis.set(`paste:${id}`, paste);

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    return NextResponse.json({
      id,
      url: `${baseUrl}/p/${id}`,
    });
  } catch (err) {
    console.error("POST /api/pastes failed:", err);
    return NextResponse.json(
      { error: "Failed to create paste" },
      { status: 500 }
    );
  }
}
