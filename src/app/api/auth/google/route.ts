import { NextResponse } from "next/server";

import {
  GOOGLE_AUTH_COOKIE_CODE_VERIFIER,
  GOOGLE_AUTH_COOKIE_STATE,
  buildAppUrl,
  buildGoogleAuthorizationUrl,
  createGoogleAuthorizationState,
  isGoogleOAuthConfigured
} from "@/lib/server/google-oauth";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 10
};

export async function GET(request: Request) {
  const homeUrl = buildAppUrl(request, "/");

  if (!isGoogleOAuthConfigured()) {
    homeUrl.searchParams.set("authError", "google");
    return NextResponse.redirect(homeUrl);
  }

  const redirectUri = buildAppUrl(request, "/api/auth/google/callback").toString();
  const oauthState = createGoogleAuthorizationState();
  const response = NextResponse.redirect(
    buildGoogleAuthorizationUrl({
      redirectUri,
      state: oauthState.state,
      codeChallenge: oauthState.codeChallenge
    })
  );

  response.cookies.set({
    name: GOOGLE_AUTH_COOKIE_STATE,
    value: oauthState.state,
    ...cookieOptions
  });
  response.cookies.set({
    name: GOOGLE_AUTH_COOKIE_CODE_VERIFIER,
    value: oauthState.codeVerifier,
    ...cookieOptions
  });

  return response;
}
