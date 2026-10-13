import Cart from "@/lib/server/models/Cart.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import { errorJson, json } from "@/lib/server/http";
export const runtime = "nodejs";
export async function DELETE(request, context) {
  const auth = await authenticate(request);
  if (auth.response) return auth.response;
  const { productId } = await context.params;
  try {
    await connectDB();
    const cart = await Cart.findOne({ user: auth.user._id });
    if (!cart) return json({ user: auth.user._id, items: [] });
    const itemId = request.nextUrl.searchParams.get("itemId");
    cart.items = cart.items.filter((item) => itemId ? item._id.toString() !== itemId : item.product.toString() !== productId);
    if (!cart.items.length) { await Cart.findByIdAndDelete(cart._id); return json({ user: auth.user._id, items: [] }); }
    await cart.save();
    return json(await Cart.findById(cart._id).populate("items.product"));
  } catch (error) { return errorJson(error); }
}
