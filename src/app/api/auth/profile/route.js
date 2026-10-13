import { authenticate } from "@/lib/server/auth";
import { json } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(request) { const auth = await authenticate(request); return auth.response || json(auth.user); }
