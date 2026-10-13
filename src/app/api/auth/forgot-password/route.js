import crypto from "node:crypto";
import User from "@/lib/server/models/user.js";
import connectDB from "@/lib/server/db";
import { json, readJson } from "@/lib/server/http";
export const runtime = "nodejs";
export async function POST(request) {
  const body = await readJson(request);
  if (!body) return json({ message: "A valid JSON request body is required." }, 400);
  try {
    await connectDB();
    const user = await User.findOne({ email: String(body.email || "").trim().toLowerCase() });
    // Avoid exposing whether an address has an account.
    if (!user) return json({ message: "If an account exists for this email, reset instructions will be sent." });
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
    // No email provider is configured in this project; expose a test token only locally.
    return json({ message: "Password reset token generate ho gaya!", ...(process.env.NODE_ENV !== "production" ? { resetToken } : {}) });
  } catch (error) { return json({ error: error.message }, 500); }
}
