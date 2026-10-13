import mongoose from "mongoose";
import Stripe from "stripe";
import Order from "@/lib/server/models/Order.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import notify from "@/lib/server/services/notifications.cjs";
import { errorJson, json, readJson } from "@/lib/server/http";
export const runtime = "nodejs";
export async function PUT(request, context) {
  const auth = await authenticate(request);
  if (auth.response) return auth.response;
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) return json({ message: "Invalid order id." }, 400);
  const body = await readJson(request);
  if (!body || !process.env.STRIPE_SECRET_KEY) return json({ message: "Card payment verification is not configured." }, 503);
  try {
    await connectDB();
    const order = await Order.findOne({ _id: id, user: auth.user._id, paymentMethod: "card" });
    if (!order) return json({ message: "Order nahi mila!" }, 404);
    const intentId = String(body.id || "");
    if (!intentId || intentId !== order.paymentReference) return json({ message: "Payment reference does not match this order." }, 400);
    const intent = await new Stripe(process.env.STRIPE_SECRET_KEY).paymentIntents.retrieve(intentId);
    if (intent.status !== "succeeded" || intent.metadata.orderId !== String(order._id) || intent.metadata.userId !== String(auth.user._id)) return json({ message: "The card payment has not been confirmed by Stripe." }, 400);
    const changed = order.status !== "Processing";
    order.isPaid = true; order.paidAt = Date.now(); order.status = "Processing"; order.paymentStatus = "Paid via Card";
    order.paymentResult = { id: intentId, status: intent.status, update_time: body.update_time || new Date().toISOString(), email_address: body.email_address || auth.user.email };
    const updated = await order.save();
    if (changed) await notify.sendOrderNotification({ to: order.notificationEmail || body.email_address || auth.user.email, orderId: order._id, status: order.status, kind: "status-update" });
    return json(updated);
  } catch (error) { return errorJson(error); }
}
