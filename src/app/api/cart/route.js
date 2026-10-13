import Cart from "@/lib/server/models/Cart.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import { errorJson, json, readJson } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.response) return auth.response;
  try { await connectDB(); const cart = await Cart.findOne({ user: auth.user._id }).populate("items.product"); return json(cart || { user: auth.user._id, items: [] }); }
  catch (error) { return errorJson(error); }
}
export async function POST(request) {
  const auth = await authenticate(request);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  if (!body || !body.productId || !Number.isInteger(Number(body.quantity)) || Number(body.quantity) < 1) return json({ message: "Product and a positive whole quantity are required." }, 400);
  const variant = { size: String(body.variant?.size || "").trim(), color: String(body.variant?.color || "").trim() };
  try {
    await connectDB();
    let cart = await Cart.findOne({ user: auth.user._id });
    let status = 200;
    if (cart) {
      const index = cart.items.findIndex((item) => item.product.toString() === String(body.productId) && (item.variant?.size || "") === variant.size && (item.variant?.color || "") === variant.color);
      if (index >= 0) cart.items[index].quantity += Number(body.quantity);
      else cart.items.push({ product: body.productId, quantity: Number(body.quantity), variant });
      await cart.save();
    } else {
      cart = await Cart.create({ user: auth.user._id, items: [{ product: body.productId, quantity: Number(body.quantity), variant }] });
      status = 201;
    }
    return json(await Cart.findById(cart._id).populate("items.product"), status);
  } catch (error) { return errorJson(error); }
}
