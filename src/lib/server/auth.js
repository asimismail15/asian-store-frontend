import jwt from "jsonwebtoken";
import User from "@/lib/server/models/user.js";
import connectDB from "@/lib/server/db";
import { json } from "@/lib/server/http";

function secret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters.");
  return process.env.JWT_SECRET;
}

export async function authenticate(request, requireAdmin = false) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return { response: json({ message: "Not authorized, token nahi mila!" }, 401) };
  let decoded;
  const jwtSecret = secret();
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch {
    return { response: json({ message: "Not authorized, token fail ho gaya!" }, 401) };
  }
  try {
    await connectDB();
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return { response: json({ message: "Not authorized." }, 401) };
    if (requireAdmin && user.role !== "admin") return { response: json({ message: "Access denied! Yeh route sirf Admin ke liye hai." }, 403) };
    return { user };
  } catch (error) {
    console.error("Authentication lookup failed:", error);
    return { response: json({ message: "Authentication service is temporarily unavailable." }, 503) };
  }
}

export function getJwtSecret() { return secret(); }
