import Order from "@/lib/server/models/Order.js";
import Cart from "@/lib/server/models/Cart.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import notify from "@/lib/server/services/notifications.cjs";
import { errorJson, json, readJson } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  if (!body?.shippingAddress) return json({ message: "Shipping address is required." }, 400);
  const methodOptions = ["easypaisa", "jazzcash", "card", "cod"];
  const paymentMethod = methodOptions.includes(body.paymentMethod) ? body.paymentMethod : "cod";
  const senderDigits = String(body.paymentSenderPhone || "").replace(/\D/g, "");
  const transactionId = String(body.paymentTransactionId || "").trim();
  try {
    await connectDB();
    if (["easypaisa", "jazzcash"].includes(paymentMethod) && !/^03\d{9}$/.test(senderDigits)) return json({ message: "Enter a valid 11-digit sender phone number." }, 400);
    if (["easypaisa", "jazzcash"].includes(paymentMethod) && (transactionId.length < 6 || transactionId.length > 120)) return json({ message: "Enter a valid transaction ID (at least 6 characters)." }, 400);
    if (["easypaisa", "jazzcash"].includes(paymentMethod) && await Order.exists({ paymentTransactionId: transactionId })) return json({ message: "This transaction ID has already been submitted for an order." }, 409);
    const cart = await Cart.findOne({ user: auth.user._id }).populate("items.product");
    if (!cart?.items.length) return json({ message: "Aapka cart khaali hai!" }, 400);
    if (cart.items.some((item) => !item.product)) return json({ message: "One or more products in your cart are no longer available." }, 400);
    const orderItems = cart.items.map((item) => ({ product: item.product._id, quantity: item.quantity, price: item.product.price, variant: item.variant || {} }));
    const giftOptions = body.giftOptions || {};
    const order = await Order.create({
      user: auth.user._id,
      notificationEmail: body.shippingAddress.email || auth.user.email,
      orderItems,
      shippingAddress: body.shippingAddress,
      giftOptions: { giftWrapped: giftOptions.giftWrapped === true, giftMessage: typeof giftOptions.giftMessage === "string" ? giftOptions.giftMessage.trim().slice(0, 300) : "" },
      paymentMethod,
      paymentStatus: ["easypaisa", "jazzcash"].includes(paymentMethod) ? "Pending Verification" : paymentMethod === "cod" ? "COD" : "Pending Verification",
      paymentAccountLast4: ["easypaisa", "jazzcash"].includes(paymentMethod) ? senderDigits.slice(-4) : "",
      paymentSenderPhone: ["easypaisa", "jazzcash"].includes(paymentMethod) ? senderDigits : "",
      paymentTransactionId: ["easypaisa", "jazzcash"].includes(paymentMethod) ? transactionId : "",
      totalPrice: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    });
    await notify.sendOrderNotification({ to: order.notificationEmail, orderId: order._id, status: order.status, kind: "confirmation" });
    await Cart.findOneAndDelete({ user: auth.user._id });
    return json(order, 201);
  } catch (error) { return errorJson(error); }
}

export async function GET(request) {
  const auth = await authenticate(request, true);
  if (auth.response) return auth.response;
  try { await connectDB(); return json(await Order.find({}).populate("user", "name email").populate("orderItems.product")); }
  catch (error) { return errorJson(error); }
}
