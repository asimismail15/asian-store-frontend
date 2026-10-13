import User from "@/lib/server/models/user.js";
import Product from "@/lib/server/models/Product.js";
import Order from "@/lib/server/models/Order.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import { errorJson, json } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request) {
  const auth = await authenticate(request, true);
  if (auth.response) return auth.response;
  try {
    await connectDB();
    const [totalUsers,totalProducts,totalOrders,revenueResult,monthlySales,monthlyUsers,ordersByStatus] = await Promise.all([
      User.countDocuments(), Product.countDocuments(), Order.countDocuments(),
      Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
      Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } }, { $sort: { _id: -1 } }, { $limit: 12 }, { $sort: { _id: 1 } }]),
      User.aggregate([{ $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, users: { $sum: 1 } } }, { $sort: { _id: -1 } }, { $limit: 12 }, { $sort: { _id: 1 } }]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);
    return json({ message: "Welcome Admin! Yeh route sirf admin access kar sakta hai.", metrics: { totalUsers,totalProducts,totalOrders,paidRevenue:revenueResult[0]?.total||0,monthlySales,monthlyUsers,ordersByStatus } });
  } catch (error) { return errorJson(error); }
}
