import { createHash, randomBytes } from "node:crypto";

export const GOOGLE_AUTH_COOKIE_STATE = "nte-google-state";
export const GOOGLE_AUTH_COOKIE_CODE_VERIFIER = "nte-google-code-verifier";

export function isGoogleOAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getAppOrigin(request: Request) {
  const configuredUrl = process.env.APP_URL?.trim();
  if (configuredUrl) {
    return new URL(configuredUrl).origin;
  }

  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (forwardedHost) {
    const protocol = forwardedProto || requestUrl.protocol.replace(":", "");
    return `${protocol}://${forwardedHost}`;
  }

  return requestUrl.origin;
}

export function buildAppUrl(request: Request, pathname: string) {
  return new URL(pathname, `${getAppOrigin(request)}/`);
}

export function createGoogleAuthorizationState() {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  const state = randomBytes(24).toString("base64url");

  return {
    state,
    codeVerifier,
    codeChallenge
  };
}

export function buildGoogleAuthorizationUrl(input: {
  redirectUri: string;
  state: string;
  codeChallenge: string;
}) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: input.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: input.state,
    code_challenge: input.codeChallenge,
    code_challenge_method: "S256",
    access_type: "online",
    prompt: "select_account"
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
