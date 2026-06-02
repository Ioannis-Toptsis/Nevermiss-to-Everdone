import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { attachSessionCookie, clearSessionCookie } from "@/lib/server/session";
import {
  GOOGLE_AUTH_COOKIE_CODE_VERIFIER,
  GOOGLE_AUTH_COOKIE_STATE,
  buildAppUrl,
  isGoogleOAuthConfigured
} from "@/lib/server/google-oauth";
import { createSessionForUserId, upsertGoogleUser } from "@/lib/server/store";

const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
  id_token: z.string().optional(),
  scope: z.string().optional()
});

const userInfoSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  picture: z.string().url().optional().nullable()
});

function withErrorRedirect(request: Request) {
  const redirectUrl = buildAppUrl(request, "/");
  redirectUrl.searchParams.set("authError", "google");
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set({
    name: GOOGLE_AUTH_COOKIE_STATE,
    value: "",
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  response.cookies.set({
    name: GOOGLE_AUTH_COOKIE_CODE_VERIFIER,
    value: "",
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  return clearSessionCookie(response);
}

export async function GET(request: Request) {
  if (!isGoogleOAuthConfigured()) {
    return withErrorRedirect(request);
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const returnedState = requestUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_AUTH_COOKIE_STATE)?.value ?? null;
  const codeVerifier = cookieStore.get(GOOGLE_AUTH_COOKIE_CODE_VERIFIER)?.value ?? null;

  if (!code || !returnedState || !expectedState || returnedState !== expectedState || !codeVerifier) {
    return withErrorRedirect(request);
  }

  try {
    const redirectUri = buildAppUrl(request, "/api/auth/google/callback").toString();
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: codeVerifier
      })
    });

    if (!tokenResponse.ok) {
      return withErrorRedirect(request);
    }

    const tokenPayload = tokenSchema.safeParse(await tokenResponse.json());
    if (!tokenPayload.success) {
      return withErrorRedirect(request);
    }

    const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenPayload.data.access_token}`
      },
      cache: "no-store"
    });

    if (!userInfoResponse.ok) {
      return withErrorRedirect(request);
    }

    const userInfoPayload = userInfoSchema.safeParse(await userInfoResponse.json());
    if (!userInfoPayload.success) {
      return withErrorRedirect(request);
    }

    const user = await upsertGoogleUser({
      email: userInfoPayload.data.email,
      name: userInfoPayload.data.name,
      image: userInfoPayload.data.picture ?? null
    });

    const session = await createSessionForUserId(user.id);
    if (!session) {
      return withErrorRedirect(request);
    }

    const response = NextResponse.redirect(buildAppUrl(request, "/"));
    attachSessionCookie(response, session);
    response.cookies.set({
      name: GOOGLE_AUTH_COOKIE_STATE,
      value: "",
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });
    response.cookies.set({
      name: GOOGLE_AUTH_COOKIE_CODE_VERIFIER,
      value: "",
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });
    return response;
  } catch {
    return withErrorRedirect(request);
  }
}