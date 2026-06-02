import { NextResponse } from "next/server";
import { z } from "zod";

import { createCredentialsSession } from "@/lib/server/store";
import { attachSessionCookie } from "@/lib/server/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72)
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid login payload." }, { status: 400 });
  }

  const session = await createCredentialsSession(parsed.data);

  if (!session) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ user: session.user });
  return attachSessionCookie(response, session);
}
