import Product from "@/lib/server/models/Product.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import { badBody, errorJson, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDB();
    const params = request.nextUrl.searchParams;
    const page = params.has("page") ? Number(params.get("page")) : 1;
    const keyword = (params.get("keyword") || "").trim();
    if (!Number.isSafeInteger(page) || page < 1) return json({ message: "Page must be a positive whole number." }, 400);
    if (keyword.length > 80) return json({ message: "Search terms must be 80 characters or fewer." }, 400);
    const filter = {};
    if (keyword) filter.title = { $regex: keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (params.get("category")) filter.category = params.get("category");
    const pageSize = 6;
    const [count, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort({ createdAt: -1 }).limit(pageSize).skip(pageSize * (page - 1)),
    ]);
    return json({ products, page, pages: Math.ceil(count / pageSize), totalProducts: count });
  } catch (error) { return errorJson(error, "Unable to load products."); }
}

export async function POST(request) {
  const auth = await authenticate(request, true);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  if (!body) return badBody();
  try { await connectDB(); return json(await Product.create(body), 201); }
  catch (error) { return json({ message: error.message }, 400); }
}
