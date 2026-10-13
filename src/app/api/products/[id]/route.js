import mongoose from "mongoose";
import Product from "@/lib/server/models/Product.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import { errorJson, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const getId = async (context) => (await context.params).id;

export async function GET(_request, context) {
  const id = await getId(context);
  if (!mongoose.isValidObjectId(id)) return json({ message: "Invalid product id." }, 400);
  try { await connectDB(); const product = await Product.findById(id); return product ? json(product) : json({ message: "Product nahi mila!" }, 404); }
  catch (error) { return errorJson(error, "Unable to load this product."); }
}

export async function PUT(request, context) {
  const auth = await authenticate(request, true);
  if (auth.response) return auth.response;
  const id = await getId(context);
  if (!mongoose.isValidObjectId(id)) return json({ message: "Invalid product id." }, 400);
  const body = await readJson(request);
  if (!body) return json({ message: "A valid JSON request body is required." }, 400);
  try { await connectDB(); const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true }); return product ? json(product) : json({ message: "Product nahi mila update karne ke liye!" }, 404); }
  catch (error) { return json({ message: error.message }, 400); }
}

export async function DELETE(request, context) {
  const auth = await authenticate(request, true);
  if (auth.response) return auth.response;
  const id = await getId(context);
  if (!mongoose.isValidObjectId(id)) return json({ message: "Invalid product id." }, 400);
  try { await connectDB(); const product = await Product.findByIdAndDelete(id); return product ? json({ message: "Product kamyabi ke sath delete ho gaya!" }) : json({ message: "Product nahi mila delete karne ke liye!" }, 404); }
  catch (error) { return errorJson(error); }
}
