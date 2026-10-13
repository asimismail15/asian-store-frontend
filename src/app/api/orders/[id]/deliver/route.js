import mongoose from "mongoose";
import Order from "@/lib/server/models/Order.js";
import User from "@/lib/server/models/user.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import notify from "@/lib/server/services/notifications.cjs";
import { errorJson, json } from "@/lib/server/http";
export const runtime = "nodejs";
export async function PUT(request, context) {
  const auth = await authenticate(request, true);
  if (auth.response) return auth.response;
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) return json({ message: "Invalid order id." }, 400);
  try {
    await connectDB();
    const order = await Order.findById(id);
    if (!order) return json({ message: "Order nahi mila!" }, 404);
    if (["easypaisa", "jazzcash"].includes(order.paymentMethod) && order.paymentStatus === "Pending Verification") return json({ message: "Verify the wallet transaction before marking this order delivered." }, 400);
    const changed = order.status !== "Delivered";
    order.isDelivered = true; order.deliveredAt = Date.now(); order.status = "Delivered";
    const updated = await order.save();
    if (changed) { const customer = await User.findById(order.user).select("email"); await notify.sendOrderNotification({ to: order.notificationEmail || customer?.email, orderId: order._id, status: order.status, kind: "status-update" }); }
    return json(updated);
  } catch (error) { return errorJson(error); }
}
