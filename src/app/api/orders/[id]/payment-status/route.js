import mongoose from "mongoose";
import Order from "@/lib/server/models/Order.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
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
    if (!order) return json({ message: "Order not found." }, 404);
    if (!["easypaisa", "jazzcash"].includes(order.paymentMethod) || order.paymentStatus !== "Pending Verification") return json({ message: "This order is not awaiting manual wallet verification." }, 400);
    if (!order.paymentSenderPhone || !order.paymentTransactionId) return json({ message: "The order is missing its sender number or transaction ID." }, 400);
    if (await Order.exists({ _id: { $ne: order._id }, paymentTransactionId: order.paymentTransactionId })) return json({ message: "This transaction ID is already linked to another order." }, 409);
    order.paymentStatus = "Paid / Approved"; order.paymentReference = order.paymentTransactionId; order.isPaid = true; order.paidAt = new Date();
    await order.save();
    return json(order);
  } catch (error) { return errorJson(error); }
}
