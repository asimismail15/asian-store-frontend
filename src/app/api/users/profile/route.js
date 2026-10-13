import bcrypt from "bcryptjs";
import User from "@/lib/server/models/user.js";
import connectDB from "@/lib/server/db";
import { authenticate } from "@/lib/server/auth";
import { errorJson, json, readJson } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.response) return auth.response;
  try { await connectDB(); const user = await User.findById(auth.user._id).select("-password"); return user ? json(user) : json({ message: "User nahi mila!" }, 404); }
  catch (error) { return errorJson(error); }
}
export async function PUT(request) {
  const auth = await authenticate(request);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  if (!body) return json({ message: "A valid JSON request body is required." }, 400);
  try {
    await connectDB();
    const user = await User.findById(auth.user._id);
    if (!user) return json({ message: "User nahi mila!" }, 404);
    if (typeof body.name === "string" && body.name.trim()) user.name = body.name.trim();
    if (typeof body.email === "string" && body.email.trim()) user.email = body.email.trim().toLowerCase();
    if (typeof body.password === "string" && body.password) {
      if (body.password.length < 8) return json({ message: "Password must contain at least 8 characters." }, 400);
      user.password = await bcrypt.hash(body.password, 10);
    }
    const updated = await user.save();
    return json({ _id: updated._id, name: updated.name, email: updated.email, isAdmin: updated.role === "admin", message: "Profile kamyabi ke sath update ho gayi!" });
  } catch (error) { return json({ error: error.code === 11000 ? "Email is already registered." : error.message }, error.code === 11000 ? 400 : 500); }
}
