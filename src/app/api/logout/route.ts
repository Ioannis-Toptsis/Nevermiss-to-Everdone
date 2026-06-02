import { NextResponse } from "next/server";

import { clearSessionCookie, revokeCurrentSession } from "@/lib/server/session";

export async function POST() {
  await revokeCurrentSession();
  const response = NextResponse.json({ ok: true });
  return clearSessionCookie(response);
}