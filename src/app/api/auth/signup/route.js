import bcrypt from "bcryptjs";
import User from "@/lib/server/models/user.js";
import connectDB from "@/lib/server/db";
import { json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";
export async function POST(request) {
  const body = await readJson(request);
  if (!body) return json({ message: "A valid JSON request body is required." }, 400);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return json({ message: "Enter a name, valid email, and password with at least 8 characters." }, 400);
  try {
    await connectDB();
    if (await User.exists({ email })) return json({ message: "Yeh email pehle se registered hai!" }, 400);
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: "customer" });
    return json({ message: "User successfully signup ho gaya!", userId: user._id, role: user.role }, 201);
  } catch (error) { return json({ error: error.code === 11000 ? "Yeh email pehle se registered hai!" : error.message }, error.code === 11000 ? 400 : 500); }
}
