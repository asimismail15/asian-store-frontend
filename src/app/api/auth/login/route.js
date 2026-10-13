import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/lib/server/models/user.js";
import connectDB from "@/lib/server/db";
import { getJwtSecret } from "@/lib/server/auth";
import { json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";
export async function POST(request) {
  const body = await readJson(request);
  if (!body) return json({ message: "A valid JSON request body is required." }, 400);
  try {
    await connectDB();
    const user = await User.findOne({ email: String(body.email || "").trim().toLowerCase() });
    if (!user || !await bcrypt.compare(String(body.password || ""), user.password)) return json({ message: "Invalid email ya password!" }, 400);
    const token = jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), { expiresIn: "1d" });
    return json({ message: "Login successful!", token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { return json({ error: error.message }, 500); }
}
