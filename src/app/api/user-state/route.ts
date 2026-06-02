import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { CUSTOM_TASK_ICONS } from "@/lib/data";
import { isValidTimeZone } from "@/lib/reset";
import { getDashboardData, updateUserDashboard } from "@/lib/server/store";
import { getSessionUserId } from "@/lib/server/session";

const VISITOR_COOKIE_NAME = "nte-visitor";

const visitorCookieConfig = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 400
};

function getOrCreateVisitorId(request: NextRequest) {
  const existingVisitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value?.trim();

  if (existingVisitorId) {
    return {
      visitorId: existingVisitorId,
      shouldSetCookie: false
    };
  }

  return {
    visitorId: crypto.randomUUID(),
    shouldSetCookie: true
  };
}

const taskScheduleSchema = z.enum(["daily", "weekly"]);
const checklistScheduleSchema = z.enum(["daily", "weekly", "todo"]);

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("toggle-task"),
    schedule: taskScheduleSchema,
    taskId: z.string().min(1),
    completed: z.boolean()
  }),
  z.object({
    action: z.literal("toggle-custom-task"),
    schedule: checklistScheduleSchema,
    taskId: z.string().min(1),
    completed: z.boolean()
  }),
  z.object({
    action: z.literal("add-custom-task"),
    schedule: checklistScheduleSchema,
    title: z.string().trim().min(1).max(80),
    description: z.string().trim().max(280),
    icon: z.enum(CUSTOM_TASK_ICONS)
  }),
  z.object({
    action: z.literal("edit-custom-task"),
    schedule: checklistScheduleSchema,
    taskId: z.string().min(1),
    title: z.string().trim().min(1).max(80),
    description: z.string().trim().max(280),
    icon: z.enum(CUSTOM_TASK_ICONS)
  }),
  z.object({
    action: z.literal("delete-custom-task"),
    schedule: checklistScheduleSchema,
    taskId: z.string().min(1)
  }),
  z.object({
    action: z.literal("reorder-task-items"),
    schedule: checklistScheduleSchema,
    itemOrder: z.array(z.string().min(1)).min(1)
  }),
  z.object({
    action: z.literal("set-locale"),
    locale: z.enum(["en", "de"])
  }),
  z.object({
    action: z.literal("set-timezone"),
    timeZone: z.string().min(1).refine((value) => isValidTimeZone(value), {
      message: "Invalid reset time zone."
    })
  }),
  z.object({
    action: z.literal("set-reset-time"),
    resetHour: z.number().int().min(0).max(23),
    resetMinute: z.literal(0)
  })
]);

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  const { visitorId, shouldSetCookie } = getOrCreateVisitorId(request);
  const payload = await getDashboardData(userId, visitorId);
  const response = NextResponse.json(payload);

  if (shouldSetCookie) {
    response.cookies.set({
      name: VISITOR_COOKIE_NAME,
      value: visitorId,
      ...visitorCookieConfig
    });
  }

  return response;
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid state action." }, { status: 400 });
  }

  try {
    const updated = await updateUserDashboard(userId, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "State update failed." }, { status: 500 });
  }
}