import { NextResponse } from "next/server";
import { z } from "zod";

import { createCredentialsUser } from "@/lib/server/store";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(36),
  email: z.string().email(),
  password: z.string().min(8).max(72)
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid registration payload." }, { status: 400 });
  }

  try {
    const user = await createCredentialsUser(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_EXISTS") {
      return NextResponse.json({ message: "User already exists." }, { status: 409 });
    }

    return NextResponse.json({ message: "Registration failed." }, { status: 500 });
  }
}
