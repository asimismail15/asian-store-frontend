import Stripe from "stripe";
import Order from "@/lib/server/models/Order.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import { errorJson, json, readJson } from "@/lib/server/http";
export const runtime = "nodejs";
export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  if (!body?.orderId) return json({ message: "Order id is required." }, 400);
  if (!process.env.STRIPE_SECRET_KEY) return json({ message: "Card payments are not configured." }, 503);
  try {
    await connectDB();
    const order = await Order.findOne({ _id: body.orderId, user: auth.user._id, paymentMethod: "card", isPaid: false });
    if (!order) return json({ message: "Pending card order was not found." }, 404);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({ amount: Math.round(order.totalPrice * 100), currency: "usd", metadata: { orderId: String(order._id), userId: String(auth.user._id) }, automatic_payment_methods: { enabled: true } });
    order.paymentReference = intent.id;
    await order.save();
    return json({ clientSecret: intent.client_secret });
  } catch (error) { return errorJson(error); }
}
