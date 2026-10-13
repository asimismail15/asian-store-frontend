import Order from "@/lib/server/models/Order.js";
import User from "@/lib/server/models/user.js";
import connectDB from "@/lib/server/db";
import { errorJson, json } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request) {
  const query = (request.nextUrl.searchParams.get("query") || "").trim();
  if (!query) return json({ message: "Enter an order ID or email address." }, 400);
  try {
    await connectDB();
    let order;
    if (/^[a-f\d]{24}$/i.test(query)) order = await Order.findById(query).populate("user", "email");
    else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query)) {
      const email = query.toLowerCase();
      const user = await User.findOne({ email }).select("_id");
      order = await Order.findOne({ $or: [...(user ? [{ user: user._id }] : []), { notificationEmail: email }] }).sort({ createdAt: -1 });
    } else return json({ message: "No matching order was found. Check the order ID or checkout email." }, 404);
    if (!order) return json({ message: "No matching order was found. Check the order ID or checkout email." }, 404);
    const result = order.toObject();
    delete result.user;
    delete result.notificationEmail;
    return json(result);
  } catch (error) { return errorJson(error, "Order tracking is temporarily unavailable."); }
}
