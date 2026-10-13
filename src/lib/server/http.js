import { NextResponse } from "next/server";

export const json = (body, status = 200) => NextResponse.json(body, { status });
export const errorJson = (error, fallback = "Request failed.") => {
  console.error(error);
  return json({ message: error?.message || fallback }, 500);
};
export async function readJson(request) {
  try { return await request.json(); }
  catch { return null; }
}
export const badBody = () => json({ message: "A valid JSON request body is required." }, 400);
