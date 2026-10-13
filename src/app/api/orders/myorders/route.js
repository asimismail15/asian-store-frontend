import Order from "@/lib/server/models/Order.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import { errorJson, json } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.response) return auth.response;
  try { await connectDB(); return json(await Order.find({ user: auth.user._id }).populate("orderItems.product")); }
  catch (error) { return errorJson(error); }
}
