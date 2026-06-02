import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { deleteSession, getUserIdForSessionToken } from "@/lib/server/store";

export const SESSION_COOKIE_NAME = "nte-session";

const cookieConfig = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getSessionUserId() {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  return getUserIdForSessionToken(token);
}

export function attachSessionCookie(
  response: NextResponse,
  session: { token: string; expiresAt: string }
) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: session.token,
    expires: new Date(session.expiresAt),
    ...cookieConfig
  });

  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    expires: new Date(0),
    ...cookieConfig
  });

  return response;
}

export async function revokeCurrentSession() {
  const token = await getSessionToken();

  if (!token) {
    return;
  }

  await deleteSession(token);
}
