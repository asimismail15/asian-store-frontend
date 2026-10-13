import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import User from "@/lib/server/models/user.js";
import connectDB from "@/lib/server/db";
import { json, readJson } from "@/lib/server/http";
export const runtime = "nodejs";
export async function POST(request) {
  const body = await readJson(request);
  if (!body?.resetToken || typeof body.newPassword !== "string" || body.newPassword.length < 8) return json({ message: "A valid reset token and a password with at least 8 characters are required." }, 400);
  try {
    await connectDB();
    const resetPasswordToken = crypto.createHash("sha256").update(String(body.resetToken)).digest("hex");
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return json({ message: "Reset token ghalat hai ya expire ho chuka hai!" }, 400);
    user.password = await bcrypt.hash(body.newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return json({ message: "Password kamyabi ke sath change ho gaya! Ab aap login kar sakte hain." });
  } catch (error) { return json({ error: error.message }, 500); }
}
