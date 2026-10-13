import mongoose from "mongoose";
import connectDB from "@/lib/server/db";
import { json } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try { await connectDB(); const connected = mongoose.connection.readyState === 1; return json({ status: connected ? "ok" : "unavailable", database: connected ? "connected" : "disconnected" }, connected ? 200 : 503); }
  catch { return json({ status: "unavailable", database: "disconnected" }, 503); }
}
