import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "0.1.0",
    hiveConfigured: !!(
      process.env.HIVE_API_KEY && process.env.HIVE_API_KEY !== "placeholder"
    ),
    timestamp: new Date().toISOString(),
  });
}
