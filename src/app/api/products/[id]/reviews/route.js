import mongoose from "mongoose";
import Product from "@/lib/server/models/Product.js";
import Order from "@/lib/server/models/Order.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import { json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";
export async function POST(request, context) {
  const auth = await authenticate(request);
  if (auth.response) return auth.response;
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) return json({ message: "Invalid product id." }, 400);
  const body = await readJson(request);
  if (!body) return json({ message: "A valid JSON request body is required." }, 400);
  const rating = Number(body.rating);
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return json({ message: "Choose a star rating from 1 to 5." }, 400);
  if (comment.length < 10 || comment.length > 1000) return json({ message: "Reviews must be between 10 and 1000 characters." }, 400);
  try {
    await connectDB();
    const product = await Product.findById(id);
    if (!product) return json({ message: "Product nahi mila!" }, 404);
    if (!await Order.exists({ user: auth.user._id, isPaid: true, "orderItems.product": product._id })) return json({ message: "Only customers with a paid order for this product can leave a verified review." }, 403);
    if (product.reviews.some((review) => review.user?.toString() === auth.user._id.toString())) return json({ message: "You have already reviewed this product." }, 400);
    product.reviews.push({ user: auth.user._id, name: auth.user.name, rating, comment, verifiedPurchase: true });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.numReviews;
    await product.save();
    return json(product, 201);
  } catch (error) { return json({ error: error.message }, 500); }
}
