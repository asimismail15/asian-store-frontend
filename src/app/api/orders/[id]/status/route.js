import mongoose from "mongoose";
import Order from "@/lib/server/models/Order.js";
import User from "@/lib/server/models/user.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import notify from "@/lib/server/services/notifications.cjs";
import { json, readJson } from "@/lib/server/http";
export const runtime = "nodejs";
export async function PUT(request, context) {
  const auth = await authenticate(request, true);
  if (auth.response) return auth.response;
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) return json({ message: "Invalid order id." }, 400);
  const body = await readJson(request);
  const allowed = ["Pending", "Processing", "Packed", "Shipped", "Out for delivery", "Delivered", "Cancelled"];
  if (!allowed.includes(body?.status)) return json({ message: "Choose a valid order status." }, 400);
  try {
    await connectDB();
    const order = await Order.findById(id);
    if (!order) return json({ message: "Order nahi mila!" }, 404);
    const fulfillment = ["Processing", "Packed", "Shipped", "Out for delivery", "Delivered"];
    if (["easypaisa", "jazzcash"].includes(order.paymentMethod) && order.paymentStatus === "Pending Verification" && fulfillment.includes(body.status)) return json({ message: "Verify the wallet transaction before moving this order to fulfillment." }, 400);
    if (order.status !== body.status) {
      order.status = body.status;
      if (body.status === "Delivered") { order.isDelivered = true; order.deliveredAt = Date.now(); }
      const updated = await order.save();
      const customer = await User.findById(order.user).select("email");
      await notify.sendOrderNotification({ to: customer?.email, orderId: order._id, status: order.status, kind: "status-update" });
      return json(updated);
    }
    return json(order);
  } catch (error) { return json({ error: error.message }, 500); }
}
