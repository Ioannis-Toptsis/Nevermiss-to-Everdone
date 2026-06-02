"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useTransition
} from "react";

import {
  CUSTOM_TASK_ICONS,
  DAILY_TASKS,
  DEFAULT_CUSTOM_TASK_ICON,
  DEFAULT_LOCALE,
  WEEKLY_TASKS
} from "@/lib/data";
import {
  DEFAULT_DISPLAY_TIMEZONE,
  DEFAULT_RESET_HOUR,
  DEFAULT_RESET_MINUTE,
  formatResetClock,
  formatResetDateTime,
  formatTimeZoneOptionLabel,
  getAvailableTimeZones,
  getPreferredResetTime,
  getPreferredTimeZone,
  getResetInfo,
  getTimeZoneGroup,
  getTimeZoneLabel
} from "@/lib/reset";
import { LOCALE_CHANGE_EVENT, LOCALE_STORAGE_KEY, getPreferredLocale, pickLocalizedText, t } from "@/lib/i18n";
import type {
  ChecklistBucket,
  CommunityStats,
  CustomTask,
  DashboardPayload,
  Locale,
  Schedule,
  UserChecklistState,
  UserStateAction,
  UsefulLink
} from "@/lib/types";
import { cn, formatCompactCount } from "@/lib/utils";

const GUEST_STATE_KEY = "nte.life.guest-state";
const LOCALE_EXPLICIT_KEY = "nte.life.locale.explicit";
const TIMEZONE_KEY = "nte.life.timezone";
const TIMEZONE_EXPLICIT_KEY = "nte.life.timezone.explicit";
const AVAILABLE_TIME_ZONES = getAvailableTimeZones();
const RESET_HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index);
const TODO_RESET_KEY = "todo:permanent";
type AvailableTimeZone = (typeof AVAILABLE_TIME_ZONES)[number];
const JANNI_FUN_URL = "https://janni.fun";
const JANNI_FUN_LOGO_URL = "https://nte.life/jannifun_logo.png";
const JANNI_FUN_DISCORD_URL = "https://janni.fun/discord";
const customTaskIcons = new Set<string>(CUSTOM_TASK_ICONS);

type CustomTaskDraft = {
  mode: "create" | "edit";
  schedule: Schedule;
  taskId: string | null;
  title: string;
  description: string;
  icon: (typeof CUSTOM_TASK_ICONS)[number];
};

type ChecklistItem = {
  id: string;
  kind: "standard" | "custom";
  icon: string;
  title: string;
  detail: string;
  completed: boolean;
  customTask?: CustomTask;
};

function MaterialIcon({
  name,
  className,
  filled = false
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbol", filled && "material-symbol-filled", className)}
    >
      {name}
    </span>
  );
}

function getTaskIds(schedule: Schedule) {
  switch (schedule) {
    case "daily":
      return DAILY_TASKS.map((task) => task.id);
    case "weekly":
      return WEEKLY_TASKS.map((task) => task.id);
    case "todo":
      return [];
    default:
      return [];
  }
}

function buildItemIds(schedule: Schedule, customTasks: CustomTask[]) {
  return [...getTaskIds(schedule), ...customTasks.map((task) => task.id)];
}

function normalizeItemOrder(source: string[] | undefined, validIds: string[]) {
  const validIdSet = new Set(validIds);
  const seen = new Set<string>();
  const orderedIds: string[] = [];

  if (Array.isArray(source)) {
    for (const id of source) {
      if (!validIdSet.has(id) || seen.has(id)) {
        continue;
      }

      seen.add(id);
      orderedIds.push(id);
    }
  }

  for (const id of validIds) {
    if (seen.has(id)) {
      continue;
    }

    seen.add(id);
    orderedIds.push(id);
  }

  return orderedIds;
}

function getScheduleLabel(locale: Locale, schedule: Schedule) {
  switch (schedule) {
    case "daily":
      return t(locale, "dailys");
    case "weekly":
      return t(locale, "weeklys");
    case "todo":
      return t(locale, "todos");
    default:
      return t(locale, "todos");
  }
}

function getSectionId(schedule: Schedule) {
  switch (schedule) {
    case "daily":
      return "dailys";
    case "weekly":
      return "weeklys";
    case "todo":
      return "todos";
    default:
      return "todos";
  }
}

function getBucket(state: UserChecklistState, schedule: Schedule) {
  switch (schedule) {
    case "daily":
      return state.daily;
    case "weekly":
      return state.weekly;
    case "todo":
      return state.todo;
    default:
      return state.todo;
  }
}

function groupTimeZoneOptions(options: readonly AvailableTimeZone[]) {
  const groups = new Map<string, { id: string; label: string; options: AvailableTimeZone[] }>();

  for (const option of options) {
    const group = groups.get(option.group);

    if (group) {
      group.options.push(option);
      continue;
    }

    groups.set(option.group, {
      id: option.group,
      label: option.group,
      options: [option]
    });
  }

  return [...groups.values()];
}

function toDraftIcon(icon: string): (typeof CUSTOM_TASK_ICONS)[number] {
  return customTaskIcons.has(icon) ? (icon as (typeof CUSTOM_TASK_ICONS)[number]) : DEFAULT_CUSTOM_TASK_ICON;
}

function getStoredLocale() {
  if (typeof window === "undefined") {
    return null;
  }

  return getPreferredLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
}

function getDetectedLocale() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const storedLocale = getStoredLocale();
  if (storedLocale) {
    return storedLocale;
  }

  const browserLocale = window.navigator.language.toLowerCase();
  return browserLocale.startsWith("de") ? "de" : "en";
}

function getStoredTimeZone() {
  if (typeof window === "undefined") {
    return null;
  }

  return getPreferredTimeZone(window.localStorage.getItem(TIMEZONE_KEY));
}

function getDetectedTimeZone() {
  if (typeof window === "undefined") {
    return DEFAULT_DISPLAY_TIMEZONE;
  }

  const storedTimeZone = getStoredTimeZone();

  if (storedTimeZone) {
    return storedTimeZone;
  }

  return getPreferredTimeZone(window.Intl.DateTimeFormat().resolvedOptions().timeZone);
}

function hasExplicitLocaleSelection() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(LOCALE_EXPLICIT_KEY) === "1";
}

function hasExplicitTimeZoneSelection() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(TIMEZONE_EXPLICIT_KEY) === "1";
}

function persistLocale(locale: Locale, explicit: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  if (explicit) {
    window.localStorage.setItem(LOCALE_EXPLICIT_KEY, "1");
  }

  window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: locale }));
}

function persistTimeZone(timeZone: string, explicit: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TIMEZONE_KEY, getPreferredTimeZone(timeZone));
  if (explicit) {
    window.localStorage.setItem(TIMEZONE_EXPLICIT_KEY, "1");
  }
}

function normalizeCustomTaskText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeCustomTask(task: unknown): CustomTask | null {
  if (!task || typeof task !== "object") {
    return null;
  }

  const candidate = task as Partial<CustomTask>;
  const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
  const title = normalizeCustomTaskText(candidate.title, 80);

  if (!id || !title) {
    return null;
  }

  const icon =
    typeof candidate.icon === "string" && customTaskIcons.has(candidate.icon)
      ? candidate.icon
      : DEFAULT_CUSTOM_TASK_ICON;

  return {
    id,
    title,
    description: normalizeCustomTaskText(candidate.description, 280),
    icon,
    createdAt:
      typeof candidate.createdAt === "string" && candidate.createdAt.trim()
        ? candidate.createdAt
        : new Date(0).toISOString()
  };
}

function normalizeCustomTasks(tasks: CustomTask[] | undefined) {
  if (!Array.isArray(tasks)) {
    return [] as CustomTask[];
  }

  return tasks
    .map((task) => normalizeCustomTask(task))
    .filter((task): task is CustomTask => Boolean(task));
}

function buildCustomTaskStateMap(tasks: CustomTask[], source?: Record<string, boolean>) {
  return Object.fromEntries(tasks.map((task) => [task.id, Boolean(source?.[task.id])])) as Record<string, boolean>;
}

function normalizeBucket(
  bucket: Partial<ChecklistBucket> | undefined,
  schedule: Schedule,
  resetKey: string
): ChecklistBucket {
  const customTasks = normalizeCustomTasks(bucket?.customTasks);
  const keepStates = bucket?.resetKey === resetKey;
  const validIds = buildItemIds(schedule, customTasks);

  return {
    resetKey,
    taskStates: keepStates ? buildBooleanMap(getTaskIds(schedule), bucket?.taskStates) : buildBooleanMap(getTaskIds(schedule)),
    customTasks,
    customTaskStates: buildCustomTaskStateMap(customTasks, keepStates ? bucket?.customTaskStates : undefined),
    itemOrder: normalizeItemOrder(bucket?.itemOrder, validIds)
  };
}

function rebindBucketToReset(
  bucket: Partial<ChecklistBucket> | undefined,
  schedule: Schedule,
  resetKey: string
): ChecklistBucket {
  const customTasks = normalizeCustomTasks(bucket?.customTasks);
  const validIds = buildItemIds(schedule, customTasks);

  return {
    resetKey,
    taskStates: buildBooleanMap(getTaskIds(schedule), bucket?.taskStates),
    customTasks,
    customTaskStates: buildCustomTaskStateMap(customTasks, bucket?.customTaskStates),
    itemOrder: normalizeItemOrder(bucket?.itemOrder, validIds)
  };
}

function createClientCustomTask(action: Extract<UserStateAction, { action: "add-custom-task" }>): CustomTask {
  return {
    id: crypto.randomUUID(),
    title: normalizeCustomTaskText(action.title, 80),
    description: normalizeCustomTaskText(action.description, 280),
    icon: customTaskIcons.has(action.icon) ? action.icon : DEFAULT_CUSTOM_TASK_ICON,
    createdAt: new Date().toISOString()
  };
}

function cloneBucket(bucket: ChecklistBucket): ChecklistBucket {
  return {
    resetKey: bucket.resetKey,
    taskStates: { ...bucket.taskStates },
    customTasks: bucket.customTasks.map((task) => ({ ...task })),
    customTaskStates: { ...bucket.customTaskStates },
    itemOrder: [...bucket.itemOrder]
  };
}

function cloneState(state: UserChecklistState): UserChecklistState {
  return {
    locale: state.locale,
    timeZone: state.timeZone,
    resetHour: state.resetHour,
    resetMinute: state.resetMinute,
    daily: cloneBucket(state.daily),
    weekly: cloneBucket(state.weekly),
    todo: cloneBucket(state.todo)
  };
}

function buildResetBoundState(base: {
  locale: Locale;
  timeZone: string;
  resetHour?: number;
  resetMinute?: number;
  daily?: Partial<ChecklistBucket>;
  weekly?: Partial<ChecklistBucket>;
  todo?: Partial<ChecklistBucket>;
}) {
  const timeZone = getPreferredTimeZone(base.timeZone);
  const preferredReset = getPreferredResetTime(base.resetHour, base.resetMinute);
  const reset = getResetInfo(new Date(), timeZone, preferredReset.resetHour, preferredReset.resetMinute);

  return {
    state: {
      locale: base.locale,
      timeZone,
      resetHour: preferredReset.resetHour,
      resetMinute: preferredReset.resetMinute,
      daily: normalizeBucket(base.daily, "daily", reset.dailyKey),
      weekly: normalizeBucket(base.weekly, "weekly", reset.weeklyKey),
      todo: normalizeBucket(base.todo, "todo", TODO_RESET_KEY)
    },
    reset
  };
}

function rebindStateToResetPreferences(
  state: UserChecklistState,
  timeZone: string,
  resetHour: number,
  resetMinute: number
) {
  const nextTimeZone = getPreferredTimeZone(timeZone);
  const preferredReset = getPreferredResetTime(resetHour, resetMinute);
  const nextReset = getResetInfo(new Date(), nextTimeZone, preferredReset.resetHour, preferredReset.resetMinute);

  return {
    ...state,
    timeZone: nextTimeZone,
    resetHour: preferredReset.resetHour,
    resetMinute: preferredReset.resetMinute,
    daily: rebindBucketToReset(state.daily, "daily", nextReset.dailyKey),
    weekly: rebindBucketToReset(state.weekly, "weekly", nextReset.weeklyKey),
    todo: rebindBucketToReset(state.todo, "todo", TODO_RESET_KEY)
  };
}

function syncPayloadResetWindow(payload: DashboardPayload) {
  const { state, reset } = buildResetBoundState(payload.state);

  return {
    ...payload,
    state,
    reset
  };
}

function persistGuestState(state: UserChecklistState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(GUEST_STATE_KEY, JSON.stringify(state));
}

function buildBooleanMap(ids: string[], source?: Record<string, boolean>) {
  return Object.fromEntries(ids.map((id) => [id, Boolean(source?.[id])])) as Record<string, boolean>;
}

function hydrateGuestState(
  state: UserChecklistState,
  preferredLocale: Locale,
  preferredTimeZone: string
) {
  if (typeof window === "undefined") {
    return state;
  }

  const raw = window.localStorage.getItem(GUEST_STATE_KEY);
  if (!raw) {
    return buildResetBoundState({
      locale: preferredLocale,
      timeZone: preferredTimeZone,
      resetHour: state.resetHour,
      resetMinute: state.resetMinute,
      daily: state.daily,
      weekly: state.weekly,
      todo: state.todo
    }).state;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserChecklistState>;
    const locale = getPreferredLocale(parsed.locale) ?? preferredLocale;
    const timeZone = getPreferredTimeZone(parsed.timeZone ?? preferredTimeZone);
    const preferredReset = getPreferredResetTime(parsed.resetHour, parsed.resetMinute);
    const isLegacyResetState =
      !Number.isInteger(parsed.resetHour) ||
      !Number.isInteger(parsed.resetMinute) ||
      parsed.resetHour !== preferredReset.resetHour ||
      parsed.resetMinute !== preferredReset.resetMinute ||
      (typeof parsed.timeZone === "string" && getPreferredTimeZone(parsed.timeZone) !== parsed.timeZone);

    if (isLegacyResetState) {
      const reset = getResetInfo(new Date(), timeZone, preferredReset.resetHour, preferredReset.resetMinute);

      return {
        locale,
        timeZone,
        resetHour: preferredReset.resetHour,
        resetMinute: preferredReset.resetMinute,
        daily: rebindBucketToReset(parsed.daily, "daily", reset.dailyKey),
        weekly: rebindBucketToReset(parsed.weekly, "weekly", reset.weeklyKey),
        todo: rebindBucketToReset(parsed.todo, "todo", TODO_RESET_KEY)
      };
    }

    return buildResetBoundState({
      locale,
      timeZone,
      resetHour: preferredReset.resetHour,
      resetMinute: preferredReset.resetMinute,
      daily: parsed.daily,
      weekly: parsed.weekly,
      todo: parsed.todo
    }).state;
  } catch {
    return buildResetBoundState({
      locale: preferredLocale,
      timeZone: preferredTimeZone,
      resetHour: state.resetHour,
      resetMinute: state.resetMinute,
      daily: state.daily,
      weekly: state.weekly,
      todo: state.todo
    }).state;
  }
}

function applyActionLocally(state: UserChecklistState, action: UserStateAction): UserChecklistState {
  const nextState = cloneState(state);

  switch (action.action) {
    case "toggle-task": {
      const bucket = getBucket(nextState, action.schedule);
      bucket.taskStates[action.taskId] = action.completed;
      return nextState;
    }
    case "toggle-custom-task": {
      const bucket = getBucket(nextState, action.schedule);
      bucket.customTaskStates[action.taskId] = action.completed;
      return nextState;
    }
    case "add-custom-task": {
      const bucket = getBucket(nextState, action.schedule);
      const nextTask = createClientCustomTask(action);

      if (!nextTask.title) {
        return nextState;
      }

      bucket.customTasks.push(nextTask);
      bucket.customTaskStates[nextTask.id] = false;
      bucket.itemOrder = [...bucket.itemOrder.filter((id) => id !== nextTask.id), nextTask.id];
      return nextState;
    }
    case "edit-custom-task": {
      const bucket = getBucket(nextState, action.schedule);
      const task = bucket.customTasks.find((entry) => entry.id === action.taskId);

      if (!task) {
        return nextState;
      }

      const title = normalizeCustomTaskText(action.title, 80);
      if (!title) {
        return nextState;
      }

      task.title = title;
      task.description = normalizeCustomTaskText(action.description, 280);
      task.icon = customTaskIcons.has(action.icon) ? action.icon : DEFAULT_CUSTOM_TASK_ICON;
      return nextState;
    }
    case "delete-custom-task": {
      const bucket = getBucket(nextState, action.schedule);
      bucket.customTasks = bucket.customTasks.filter((task) => task.id !== action.taskId);
      delete bucket.customTaskStates[action.taskId];
      bucket.itemOrder = bucket.itemOrder.filter((id) => id !== action.taskId);
      return nextState;
    }
    case "reorder-task-items": {
      const bucket = getBucket(nextState, action.schedule);
      bucket.itemOrder = normalizeItemOrder(action.itemOrder, buildItemIds(action.schedule, bucket.customTasks));
      return nextState;
    }
    case "set-locale": {
      nextState.locale = action.locale;
      return nextState;
    }
    case "set-timezone": {
      return rebindStateToResetPreferences(
        nextState,
        action.timeZone,
        nextState.resetHour,
        nextState.resetMinute
      );
    }
    case "set-reset-time": {
      return rebindStateToResetPreferences(
        nextState,
        nextState.timeZone,
        action.resetHour,
        action.resetMinute
      );
    }
    default:
      return nextState;
  }
}

function getProgress(
  bucket: ChecklistBucket,
  schedule: Schedule,
  options?: { includeCustom?: boolean }
) {
  const taskIds = getTaskIds(schedule);
  const baseCompleted = taskIds.filter((taskId) => bucket.taskStates[taskId]).length;
  const includeCustom = options?.includeCustom ?? true;
  const customTaskIds = includeCustom ? bucket.customTasks.map((task) => task.id) : [];
  const customCompleted = customTaskIds.filter((taskId) => bucket.customTaskStates[taskId]).length;
  const total = taskIds.length + customTaskIds.length;
  const completed = baseCompleted + customCompleted;

  return {
    completed,
    total,
    ratio: total === 0 ? 0 : completed / total
  };
}

function formatCountdown(
  targetIso: string,
  locale: Locale,
  currentTime: number,
  options?: { includeDays?: boolean }
) {
  const diff = Math.max(0, new Date(targetIso).getTime() - currentTime);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const time = [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");

  if (options?.includeDays) {
    return `${t(locale, "resetIn")}: ${days.toString().padStart(2, "0")}d ${time}`;
  }

  return `${t(locale, "resetIn")}: ${time}`;
}

function affectsCommunity(action: UserStateAction) {
  return action.action === "toggle-task";
}

function deriveCommunityStats(
  community: CommunityStats,
  previousState: UserChecklistState,
  nextState: UserChecklistState
) {
  const previousDaily = getProgress(previousState.daily, "daily", { includeCustom: false });
  const previousWeekly = getProgress(previousState.weekly, "weekly", { includeCustom: false });
  const nextDaily = getProgress(nextState.daily, "daily", { includeCustom: false });
  const nextWeekly = getProgress(nextState.weekly, "weekly", { includeCustom: false });

  const previousChecks = previousDaily.completed + previousWeekly.completed;
  const nextChecks = nextDaily.completed + nextWeekly.completed;
  const previousDailyClear = previousDaily.total > 0 && previousDaily.completed === previousDaily.total;
  const nextDailyClear = nextDaily.total > 0 && nextDaily.completed === nextDaily.total;
  const previousWeeklyClear = previousWeekly.total > 0 && previousWeekly.completed === previousWeekly.total;
  const nextWeeklyClear = nextWeekly.total > 0 && nextWeekly.completed === nextWeekly.total;

  return {
    totalChecks: Math.max(0, community.totalChecks + nextChecks - previousChecks),
    dailyFinishers: Math.max(
      0,
      community.dailyFinishers + Number(nextDailyClear) - Number(previousDailyClear)
    ),
    weeklyFinishers: Math.max(
      0,
      community.weeklyFinishers + Number(nextWeeklyClear) - Number(previousWeeklyClear)
    ),
    dailyVisitors: community.dailyVisitors,
    totalVisitors: community.totalVisitors
  };
}

function applyPresentationPreferences(nextPayload: DashboardPayload) {
  const clonedPayload = {
    ...nextPayload,
    state: cloneState(nextPayload.state)
  };

  if (!hasExplicitLocaleSelection()) {
    clonedPayload.state.locale = getDetectedLocale();
  }

  return syncPayloadResetWindow(clonedPayload);
}

function applyGuestPresentationPreferences(
  nextPayload: DashboardPayload,
  preferredLocale: Locale,
  preferredTimeZone: string
) {
  const initialState = cloneState(nextPayload.state);
  const hydratedState = hydrateGuestState(nextPayload.state, preferredLocale, preferredTimeZone);
  const syncedPayload = syncPayloadResetWindow({
    ...nextPayload,
    state: hydratedState
  });

  return {
    ...syncedPayload,
    community: deriveCommunityStats(nextPayload.community, initialState, syncedPayload.state)
  };
}

function scrollToSection(id: string) {
  const target = document.getElementById(id);

  if (!target) {
    return;
  }

  const nextTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 16);
  window.scrollTo({
    top: nextTop,
    behavior: "smooth"
  });
}

function SectionButton({
  label,
  onClick
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center justify-center rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-center text-sm font-semibold text-white/88 transition hover:border-white/20 hover:bg-white/12"
    >
      {label}
    </button>
  );
}

function ProgressCard({
  label,
  progress,
  countdown,
  localReset,
  completeTone
}: {
  label: string;
  progress: { completed: number; total: number; ratio: number };
  countdown: string;
  localReset: string;
  completeTone: "cyan" | "pink";
}) {
  const isComplete = progress.total > 0 && progress.completed === progress.total;

  return (
    <article className="rounded-[28px] border border-white/12 bg-white/7 p-5 shadow-glass backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">{label}</p>
          <p className="mt-2 font-[var(--font-heading)] text-4xl uppercase leading-none tracking-[0.05em] text-white sm:text-5xl">
            {progress.completed}/{progress.total}
          </p>
        </div>
        <p className="max-w-36 text-right text-[11px] leading-5 text-white/60">{countdown}</p>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/30">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isComplete
              ? completeTone === "cyan"
                ? "animate-progress-glow bg-gradient-to-r from-accent via-cyan-300 to-cyan-200"
                : "animate-progress-glow bg-gradient-to-r from-accent via-pink-400 to-fuchsia-300"
              : "bg-gradient-to-r from-accent to-orange-200"
          )}
          style={{ width: `${Math.max(progress.ratio * 100, progress.total ? 10 : 0)}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-white/55">{localReset}</p>
    </article>
  );
}

function LinkTile({ link, locale }: { link: UsefulLink; locale: Locale }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      className="group min-h-[132px] rounded-[24px] border border-white/12 bg-white/7 p-4 shadow-glass backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/11"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-black/20 text-accent">
        <MaterialIcon name={link.icon} className="text-[20px]" />
      </span>
      <div className="mt-4 space-y-1">
        <p className="text-sm font-semibold text-white">{pickLocalizedText(locale, link.title)}</p>
        <p className="text-xs leading-5 text-white/60">{pickLocalizedText(locale, link.detail)}</p>
      </div>
    </a>
  );
}

function getOrderedChecklistItems(bucket: ChecklistBucket, schedule: Schedule, locale: Locale): ChecklistItem[] {
  const definitions =
    schedule === "daily" ? DAILY_TASKS : schedule === "weekly" ? WEEKLY_TASKS : [];
  const definitionMap = new Map(definitions.map((task) => [task.id, task]));
  const customTaskMap = new Map(bucket.customTasks.map((task) => [task.id, task]));
  const orderedIds = normalizeItemOrder(bucket.itemOrder, buildItemIds(schedule, bucket.customTasks));
  const items: ChecklistItem[] = [];

  for (const id of orderedIds) {
    const definition = definitionMap.get(id);

    if (definition) {
      items.push({
        id,
        kind: "standard",
        icon: definition.icon,
        title: pickLocalizedText(locale, definition.label),
        detail: pickLocalizedText(locale, definition.detail),
        completed: Boolean(bucket.taskStates[id])
      });
      continue;
    }

    const customTask = customTaskMap.get(id);
    if (!customTask) {
      continue;
    }

    items.push({
      id,
      kind: "custom",
      icon: customTask.icon,
      title: customTask.title,
      detail: customTask.description,
      completed: Boolean(bucket.customTaskStates[id]),
      customTask
    });
  }

  return items;
}

function ChecklistTaskButton({
  icon,
  title,
  detail,
  completed,
  pending,
  isShining,
  onClick,
  sideActions,
  badge
}: {
  icon: string;
  title: string;
  detail?: string;
  completed: boolean;
  pending: boolean;
  isShining: boolean;
  onClick: () => void;
  sideActions?: ReactNode;
  badge?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={pending ? -1 : 0}
      onClick={() => {
        if (!pending) {
          onClick();
        }
      }}
      onKeyDown={(event) => {
        if (pending) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      aria-pressed={completed}
      className={cn(
        "group relative min-h-[112px] overflow-hidden rounded-[26px] border p-4 text-left shadow-glass backdrop-blur-xl transition duration-300",
        completed
          ? "border-accent/45 bg-white/12"
          : "border-white/10 bg-black/15 hover:border-white/18 hover:bg-white/10"
        ,
        pending ? "cursor-not-allowed" : "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 left-[-30%] w-1/2 rotate-[12deg] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0",
          isShining && "animate-tile-shine"
        )}
      />
      <div className="flex items-start gap-3">
        {sideActions ? <div className="relative z-10 flex shrink-0 flex-col gap-2">{sideActions}</div> : null}
        <div className="flex min-h-[80px] min-w-0 flex-1 items-start justify-between gap-4 rounded-[22px] text-left">
          <div className="flex min-w-0 gap-3">
            <span
              className={cn(
                "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-white/85",
                completed ? "border-accent/35 bg-accent/12 text-accent" : "border-white/12 bg-black/25"
              )}
            >
              <MaterialIcon name={icon} className="text-[20px]" />
            </span>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-white">{title}</p>
                {badge ? (
                  <span className="inline-flex min-h-[24px] items-center rounded-full border border-white/12 bg-white/8 px-2.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/58">
                    {badge}
                  </span>
                ) : null}
              </div>
              {detail ? <p className="max-w-xl text-sm leading-6 text-white/58">{detail}</p> : null}
            </div>
          </div>
          <span
            className={cn(
              "mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition",
              completed
                ? "border-accent/45 bg-accent text-black"
                : "border-white/14 bg-black/25 text-white/50"
            )}
          >
            <MaterialIcon name="check" filled={completed} className="text-[18px]" />
          </span>
        </div>
      </div>
    </div>
  );
}

function SortableChecklistTask({
  locale,
  item,
  pending,
  isShining,
  onToggle,
  onEdit
}: {
  locale: Locale;
  item: ChecklistItem;
  pending: boolean;
  isShining: boolean;
  onToggle: () => void;
  onEdit?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: pending
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
      className={cn(isDragging && "relative z-20 scale-[1.01]")}
    >
      <ChecklistTaskButton
        icon={item.icon}
        title={item.title}
        detail={item.detail}
        completed={item.completed}
        pending={pending}
        isShining={isShining}
        badge={item.kind === "custom" ? t(locale, "customTaskBadge") : undefined}
        sideActions={(
          <>
            <button
              type="button"
              disabled={pending}
              aria-label={t(locale, "dragHandle")}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/28 text-white/68 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ touchAction: "none" }}
              {...attributes}
              {...listeners}
            >
              <MaterialIcon name="drag_indicator" className="text-[18px]" />
            </button>
            {item.kind === "custom" && onEdit ? (
              <button
                type="button"
                disabled={pending}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
                onKeyDown={(event) => event.stopPropagation()}
                aria-label={t(locale, "editTask")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/28 text-white/72 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MaterialIcon name="edit" className="text-[16px]" />
              </button>
            ) : null}
          </>
        )}
        onClick={onToggle}
      />
    </div>
  );
}

type SectionProps = {
  locale: Locale;
  schedule: Schedule;
  bucket: ChecklistBucket;
  title: string;
  subtitle: string;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onToggleCustomTask: (taskId: string, completed: boolean) => void;
  onEditCustomTask: (task: CustomTask) => void;
  onReorder: (itemOrder: string[]) => void;
  onAddTask: () => void;
  pending: boolean;
  shineId: string | null;
};

function ChecklistSection({
  locale,
  schedule,
  bucket,
  title,
  subtitle,
  onToggleTask,
  onToggleCustomTask,
  onEditCustomTask,
  onReorder,
  onAddTask,
  pending,
  shineId
}: SectionProps) {
  const items = getOrderedChecklistItems(bucket, schedule, locale);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 140,
        tolerance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const itemIds = items.map((item) => item.id);
    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return;
    }

    onReorder(arrayMove(itemIds, oldIndex, newIndex));
  }

  return (
    <section
      id={getSectionId(schedule)}
      className="rounded-[30px] border border-white/12 bg-white/7 p-5 shadow-glass backdrop-blur-2xl sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">{subtitle}</p>
          <h2 className="mt-2 font-[var(--font-heading)] text-4xl uppercase leading-none tracking-[0.05em] text-white">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onAddTask}
          disabled={pending}
          className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[18px] border border-white/12 bg-black/22 px-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MaterialIcon name="add_circle" className="text-[18px]" />
          <span>{t(locale, "addTask")}</span>
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/48">{t(locale, "dragToSort")}</p>

      <div className="mt-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3">
              {items.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/14 bg-black/18 px-4 py-5 text-sm leading-6 text-white/60">
                  {t(locale, "todoEmptyState")}
                </div>
              ) : null}
              {items.map((item) => {
                const isShining = shineId === item.id;

                return (
                  <SortableChecklistTask
                    key={item.id}
                    locale={locale}
                    item={item}
                    pending={pending}
                    isShining={isShining}
                    onEdit={item.customTask ? () => onEditCustomTask(item.customTask as CustomTask) : undefined}
                    onToggle={() => {
                      if (item.completed) {
                        if (item.kind === "standard") {
                          onToggleTask(item.id, false);
                        } else {
                          onToggleCustomTask(item.id, false);
                        }
                        return;
                      }

                      if (item.kind === "standard") {
                        onToggleTask(item.id, true);
                        return;
                      }

                      onToggleCustomTask(item.id, true);
                    }}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}

function CustomTaskModal({
  locale,
  draft,
  pending,
  onClose,
  onChange,
  onSubmit,
  onDelete
}: {
  locale: Locale;
  draft: CustomTaskDraft;
  pending: boolean;
  onClose: () => void;
  onChange: (patch: Partial<Omit<CustomTaskDraft, "schedule">>) => void;
  onSubmit: () => void;
  onDelete?: () => void;
}) {
  const normalizedTitle = normalizeCustomTaskText(draft.title, 80);
  const isEditing = draft.mode === "edit";
  const modalText =
    draft.schedule === "todo"
      ? isEditing
        ? t(locale, "todoEditModalText")
        : t(locale, "todoModalText")
      : isEditing
        ? t(locale, "customTaskEditModalText")
        : t(locale, "customTaskModalText");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain px-4 py-4 sm:items-center sm:px-6 sm:py-6">
      <button
        type="button"
        aria-label={t(locale, "cancel")}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-task-dialog-title"
        className="relative z-10 my-auto w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/14 bg-white/10 p-5 shadow-glass backdrop-blur-2xl max-h-[calc(100dvh-2rem)] overscroll-contain sm:max-h-[calc(100dvh-3rem)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">{getScheduleLabel(locale, draft.schedule)}</p>
            <h3
              id="custom-task-dialog-title"
              className="mt-2 font-[var(--font-heading)] text-3xl uppercase leading-none tracking-[0.05em] text-white sm:text-4xl"
            >
              {isEditing ? t(locale, "customTaskEditModalTitle") : t(locale, "customTaskModalTitle")}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/62">
              {modalText}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-accent/35 bg-black/28 text-accent">
              <MaterialIcon name={draft.icon} className="text-[26px]" />
            </span>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/22 text-white/70 transition hover:border-white/20 hover:bg-white/8"
            >
              <MaterialIcon name="close" className="text-[20px]" />
            </button>
          </div>
        </div>

        <form
          className="mt-6 grid gap-4"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="grid gap-2 rounded-[24px] border border-white/10 bg-black/18 p-4">
            <span className="text-[11px] uppercase tracking-[0.28em] text-white/40">{t(locale, "customTaskTitleLabel")}</span>
            <input
              value={draft.title}
              maxLength={80}
              autoFocus
              onChange={(event) => onChange({ title: event.target.value })}
              placeholder={t(locale, "customTaskTitlePlaceholder")}
              className="min-h-[48px] rounded-[18px] border border-white/12 bg-black/28 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent"
            />
          </label>

          <label className="grid gap-2 rounded-[24px] border border-white/10 bg-black/18 p-4">
            <span className="text-[11px] uppercase tracking-[0.28em] text-white/40">{t(locale, "customTaskDescriptionLabel")}</span>
            <textarea
              value={draft.description}
              maxLength={280}
              rows={4}
              onChange={(event) => onChange({ description: event.target.value })}
              placeholder={t(locale, "customTaskDescriptionPlaceholder")}
              className="min-h-[120px] resize-y rounded-[18px] border border-white/12 bg-black/28 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent"
            />
          </label>

          <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] uppercase tracking-[0.28em] text-white/40">{t(locale, "customTaskIconLabel")}</span>
              <span className="text-xs text-white/45">{t(locale, "customTaskPrivateNote")}</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
              {CUSTOM_TASK_ICONS.map((icon) => {
                const selected = draft.icon === icon;

                return (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => onChange({ icon })}
                    className={cn(
                      "inline-flex h-14 items-center justify-center rounded-[18px] border bg-black/28 text-white/78 transition",
                      selected
                        ? "border-accent/45 bg-accent/12 text-accent"
                        : "border-white/12 hover:border-white/22 hover:bg-white/8"
                    )}
                  >
                    <MaterialIcon name={icon} className="text-[24px]" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {isEditing && onDelete ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={onDelete}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-[18px] border border-red-400/35 bg-red-500/10 px-4 text-sm font-semibold text-red-100 transition hover:border-red-300/55 hover:bg-red-500/16 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MaterialIcon name="delete" className="text-[18px]" />
                  <span>{t(locale, "deleteTask")}</span>
                </button>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] rounded-[18px] border border-white/12 bg-black/25 px-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
              >
                {t(locale, "cancel")}
              </button>
              <button
                type="submit"
                disabled={!normalizedTitle || pending}
                className="min-h-[48px] rounded-[18px] border border-accent/35 bg-accent px-4 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isEditing ? t(locale, "updateTask") : t(locale, "saveTask")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [customTaskDraft, setCustomTaskDraft] = useState<CustomTaskDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [shineId, setShineId] = useState<string | null>(null);
  const [tick, setTick] = useState(Date.now());
  const autoRefreshResetWindowRef = useRef<string | null>(null);

  const locale = payload?.state.locale ?? DEFAULT_LOCALE;
  const timeZone = payload?.state.timeZone ?? DEFAULT_DISPLAY_TIMEZONE;
  const resetHour = payload?.state.resetHour ?? DEFAULT_RESET_HOUR;
  const resetMinute = payload?.state.resetMinute ?? DEFAULT_RESET_MINUTE;
  const timeZoneLabel = getTimeZoneLabel(timeZone);
  const timeZoneGroup = getTimeZoneGroup(timeZone);
  const timeZoneDisplay = timeZoneGroup === timeZoneLabel ? timeZoneLabel : `${timeZoneGroup} · ${timeZoneLabel}`;
  const timeZoneOptions = groupTimeZoneOptions(AVAILABLE_TIME_ZONES);
  const resetClockLabel = formatResetClock(resetHour, resetMinute, locale);
  const dictionary = {
    appTag: t(locale, "appTag"),
    heroTitle: t(locale, "heroTitle"),
    heroText: t(locale, "heroText"),
    guestHint: t(locale, "guestHint"),
    authPersistent: t(locale, "authPersistent")
  };

  async function loadDashboard() {
    setIsLoading(true);
    setMessage(null);

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const authError = searchParams.get("authError");
      const response = await fetch("/api/user-state", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("LOAD_FAILED");
      }

      let nextPayload = (await response.json()) as DashboardPayload;
      const preferredLocale = getDetectedLocale();
      const preferredTimeZone = getDetectedTimeZone();

      if (!nextPayload.authenticated) {
        nextPayload = applyGuestPresentationPreferences(nextPayload, preferredLocale, preferredTimeZone);
        persistGuestState(nextPayload.state);
        persistLocale(nextPayload.state.locale, false);
        persistTimeZone(nextPayload.state.timeZone, false);
      } else {
        nextPayload = applyPresentationPreferences(nextPayload);
      }

      setPayload(nextPayload);

      if (authError === "google") {
        setMessage(t(nextPayload.state.locale, "googleAuthError"));
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("authError");
        window.history.replaceState({}, "", cleanUrl);
      }
    } catch {
      setMessage(t(getDetectedLocale(), "loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  async function commitAction(action: UserStateAction) {
    if (!payload) {
      return;
    }

    const optimisticState = applyActionLocally(payload.state, action);
    const optimisticPayload = {
      ...payload,
      state: optimisticState,
      reset:
        action.action === "set-timezone" || action.action === "set-reset-time"
          ? getResetInfo(
              new Date(),
              optimisticState.timeZone,
              optimisticState.resetHour,
              optimisticState.resetMinute
            )
          : payload.reset,
      community: affectsCommunity(action)
        ? deriveCommunityStats(payload.community, payload.state, optimisticState)
        : payload.community
    };

    setPayload(optimisticPayload);

    if (action.action === "set-locale") {
      persistLocale(action.locale, true);
    }

    if (action.action === "set-timezone") {
      persistTimeZone(action.timeZone, true);
    }

    if (!payload.authenticated) {
      persistGuestState(optimisticState);
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/user-state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(action)
        });

        if (!response.ok) {
          throw new Error("UPDATE_FAILED");
        }

        const updatedPayload = applyPresentationPreferences((await response.json()) as DashboardPayload);
        setPayload(updatedPayload);
      } catch {
        await loadDashboard();
      }
    });
  }

  function openCustomTaskDialog(schedule: Schedule) {
    setCustomTaskDraft({
      mode: "create",
      schedule,
      taskId: null,
      title: "",
      description: "",
      icon: DEFAULT_CUSTOM_TASK_ICON
    });
  }

  function openEditCustomTaskDialog(schedule: Schedule, task: CustomTask) {
    setCustomTaskDraft({
      mode: "edit",
      schedule,
      taskId: task.id,
      title: task.title,
      description: task.description,
      icon: toDraftIcon(task.icon)
    });
  }

  function submitCustomTask() {
    if (!customTaskDraft) {
      return;
    }

    const title = normalizeCustomTaskText(customTaskDraft.title, 80);
    if (!title) {
      return;
    }

    if (customTaskDraft.mode === "edit") {
      if (!customTaskDraft.taskId) {
        return;
      }

      void commitAction({
        action: "edit-custom-task",
        schedule: customTaskDraft.schedule,
        taskId: customTaskDraft.taskId,
        title,
        description: normalizeCustomTaskText(customTaskDraft.description, 280),
        icon: customTaskDraft.icon
      });
    } else {
      void commitAction({
        action: "add-custom-task",
        schedule: customTaskDraft.schedule,
        title,
        description: normalizeCustomTaskText(customTaskDraft.description, 280),
        icon: customTaskDraft.icon
      });
    }

    setCustomTaskDraft(null);
  }

  function deleteCustomTask() {
    if (!customTaskDraft || customTaskDraft.mode !== "edit" || !customTaskDraft.taskId) {
      return;
    }

    if (shineId === customTaskDraft.taskId) {
      setShineId(null);
    }

    void commitAction({
      action: "delete-custom-task",
      schedule: customTaskDraft.schedule,
      taskId: customTaskDraft.taskId
    });
    setCustomTaskDraft(null);
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!payload) {
      return;
    }

    const resetWindowKey = `${payload.reset.nextDailyResetAt}:${payload.reset.nextWeeklyResetAt}`;
    const nextResetTimes = [Date.parse(payload.reset.nextDailyResetAt), Date.parse(payload.reset.nextWeeklyResetAt)].filter(
      (value) => Number.isFinite(value)
    );

    if (nextResetTimes.length === 0 || tick < Math.min(...nextResetTimes)) {
      return;
    }

    if (autoRefreshResetWindowRef.current === resetWindowKey) {
      return;
    }

    autoRefreshResetWindowRef.current = resetWindowKey;
    window.location.reload();
  }, [payload, tick]);

  useEffect(() => {
    if (!shineId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShineId(null);
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [shineId]);

  useEffect(() => {
    if (!customTaskDraft) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCustomTaskDraft(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [customTaskDraft]);

  if (isLoading || !payload) {
    return (
      <main className="min-h-screen px-4 py-4 text-ink sm:px-6 sm:py-6">
        <div className="mx-auto grid max-w-6xl gap-4">
          <div className="animate-panel-rise h-64 rounded-[32px] border border-white/10 bg-white/6 shadow-glass backdrop-blur-2xl" />
          <div className="grid gap-4 lg:grid-cols-[1.35fr,0.95fr]">
            <div className="animate-panel-rise h-[540px] rounded-[32px] border border-white/10 bg-white/6 shadow-glass backdrop-blur-2xl" />
            <div className="animate-panel-rise h-[540px] rounded-[32px] border border-white/10 bg-white/6 shadow-glass backdrop-blur-2xl" />
          </div>
        </div>
      </main>
    );
  }

  const dailyProgress = getProgress(payload.state.daily, "daily");
  const weeklyProgress = getProgress(payload.state.weekly, "weekly");
  const totalCommunityChecks = formatCompactCount(payload.community.totalChecks);
  const totalVisitors = formatCompactCount(payload.community.totalVisitors);
  const dailyLocalReset = `${t(locale, "localResetTime")}: ${formatResetDateTime(
    payload.reset.nextDailyResetAt,
    locale,
    timeZone
  )} · ${timeZoneLabel}`;
  const weeklyLocalReset = `${t(locale, "localResetTime")}: ${formatResetDateTime(
    payload.reset.nextWeeklyResetAt,
    locale,
    timeZone
  )} · ${timeZoneLabel}`;

  return (
    <main className="min-h-screen px-4 py-4 text-ink sm:px-6 sm:py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <header id="hub" className="animate-panel-rise overflow-hidden rounded-[34px] border border-white/12 bg-white/7 p-5 shadow-glass backdrop-blur-2xl sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <p className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/65">
                  {dictionary.appTag}
                </p>
                <div className="space-y-3">
                  <h1 className="max-w-4xl font-[var(--font-heading)] text-5xl uppercase leading-none tracking-[0.05em] text-white sm:text-7xl">
                    {dictionary.heroTitle}
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-white/68 sm:text-base">{dictionary.heroText}</p>
                </div>
              </div>

              <div className="flex w-full max-w-md flex-col gap-3">
                <div className="flex items-center gap-2 self-start rounded-full border border-white/12 bg-black/20 p-1">
                  {(["en", "de"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => void commitAction({ action: "set-locale", locale: option })}
                      className={cn(
                        "min-h-[40px] rounded-full px-4 text-xs font-semibold uppercase tracking-[0.28em] transition",
                        locale === option ? "bg-white text-black" : "text-white/55"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="rounded-[24px] border border-white/12 bg-black/22 p-4 text-left shadow-glass backdrop-blur-2xl">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">{`${timeZoneDisplay} · ${resetClockLabel}`}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-white/40">{t(locale, "timeZoneLabel")}</span>
                      <select
                        value={timeZone}
                        onChange={(event) =>
                          void commitAction({
                            action: "set-timezone",
                            timeZone: event.target.value
                          })
                        }
                        className="min-h-[48px] w-full rounded-[18px] border border-white/12 bg-black/28 px-4 text-sm text-white outline-none transition focus:border-accent"
                      >
                        {timeZoneOptions.map((group) => (
                          <optgroup key={group.id} label={group.label}>
                            {group.options.map((option) => (
                              <option key={option.id} value={option.id}>
                                {formatTimeZoneOptionLabel(option.id, locale)}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-white/40">{t(locale, "resetTimeLabel")}</span>
                      <select
                        value={String(resetHour)}
                        disabled={isPending}
                        onChange={(event) => {
                          const nextHour = Number.parseInt(event.target.value, 10);

                          if (!Number.isInteger(nextHour)) {
                            return;
                          }

                          void commitAction({
                            action: "set-reset-time",
                            resetHour: nextHour,
                            resetMinute: 0
                          });
                        }}
                        className="min-h-[48px] w-full rounded-[18px] border border-white/12 bg-black/28 px-4 text-sm text-white outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {RESET_HOUR_OPTIONS.map((hour) => (
                          <option key={hour} value={hour}>
                            {formatResetClock(hour, 0, locale)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="mt-4 grid gap-2 text-xs leading-6 text-white/60">
                    <p>
                      <span className="mr-2 uppercase tracking-[0.24em] text-white/35">{t(locale, "dailyReset")}</span>
                      {formatResetDateTime(payload.reset.nextDailyResetAt, locale, timeZone)}
                    </p>
                    <p>
                      <span className="mr-2 uppercase tracking-[0.24em] text-white/35">{t(locale, "weeklyReset")}</span>
                      {formatResetDateTime(payload.reset.nextWeeklyResetAt, locale, timeZone)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr),minmax(320px,0.8fr)]">
                <article className="rounded-[28px] border border-white/12 bg-black/22 p-5 shadow-glass backdrop-blur-2xl">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">{t(locale, "communityTitle")}</p>
                  <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.75fr),minmax(0,1.25fr)] lg:items-start">
                    <div>
                      <p className="font-[var(--font-heading)] text-5xl uppercase leading-none tracking-[0.05em] text-white">
                        {totalCommunityChecks}
                      </p>
                      <p className="mt-3 max-w-md text-sm leading-6 text-white/62">{t(locale, "communityText")}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-white/62">
                      <div className="rounded-[18px] border border-white/10 bg-white/7 px-3 py-2">
                        <span className="block uppercase tracking-[0.22em] text-white/38">{t(locale, "dailyFinishers")}</span>
                        <strong className="mt-1 block text-lg text-white">
                          {formatCompactCount(payload.community.dailyFinishers)}
                        </strong>
                      </div>
                      <div className="rounded-[18px] border border-white/10 bg-white/7 px-3 py-2">
                        <span className="block uppercase tracking-[0.22em] text-white/38">{t(locale, "weeklyFinishers")}</span>
                        <strong className="mt-1 block text-lg text-white">
                          {formatCompactCount(payload.community.weeklyFinishers)}
                        </strong>
                      </div>
                      <div className="col-span-2 rounded-[18px] border border-white/10 bg-white/7 px-3 py-2">
                        <span className="block uppercase tracking-[0.22em] text-white/38">{t(locale, "totalVisitors")}</span>
                        <strong className="mt-1 block text-lg text-white">{totalVisitors}</strong>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="rounded-[28px] border border-white/12 bg-black/22 p-5 shadow-glass backdrop-blur-2xl">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">{t(locale, "discordCommunityTitle")}</p>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-white/62">{t(locale, "discordCommunityText")}</p>
                  <a
                    href={JANNI_FUN_DISCORD_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-[16px] border border-accent/35 bg-accent px-4 text-sm font-semibold text-black transition hover:brightness-110"
                  >
                    <MaterialIcon name="chat" className="text-[18px]" />
                    <span>{t(locale, "joinDiscord")}</span>
                    <MaterialIcon name="arrow_outward" className="text-[18px]" />
                  </a>
                </article>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <ProgressCard
                  label={`${t(locale, "dailyProgress")}: ${dailyProgress.completed}/${dailyProgress.total}`}
                  progress={dailyProgress}
                  countdown={formatCountdown(payload.reset.nextDailyResetAt, locale, tick)}
                  localReset={dailyLocalReset}
                  completeTone="cyan"
                />
                <ProgressCard
                  label={`${t(locale, "weeklyProgress")}: ${weeklyProgress.completed}/${weeklyProgress.total}`}
                  progress={weeklyProgress}
                  countdown={formatCountdown(payload.reset.nextWeeklyResetAt, locale, tick, { includeDays: true })}
                  localReset={weeklyLocalReset}
                  completeTone="pink"
                />
              </div>
            </div>

            <nav className="grid gap-2 sm:grid-cols-5">
              <SectionButton label={t(locale, "hub")} onClick={() => scrollToSection("hub")} />
              <SectionButton label={t(locale, "dailys")} onClick={() => scrollToSection("dailys")} />
              <SectionButton label={t(locale, "weeklys")} onClick={() => scrollToSection("weeklys")} />
              <SectionButton label={t(locale, "todos")} onClick={() => scrollToSection("todos")} />
              <SectionButton label={t(locale, "usefulLinks")} onClick={() => scrollToSection("useful-links")} />
            </nav>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.35fr,0.95fr]">
          <div className="space-y-4">
            <ChecklistSection
              locale={locale}
              schedule="daily"
              bucket={payload.state.daily}
              title={t(locale, "dailys")}
              subtitle={t(locale, "starterLoadout")}
              pending={isPending}
              shineId={shineId}
              onAddTask={() => openCustomTaskDialog("daily")}
              onEditCustomTask={(task) => openEditCustomTaskDialog("daily", task)}
              onReorder={(itemOrder) => {
                void commitAction({
                  action: "reorder-task-items",
                  schedule: "daily",
                  itemOrder
                });
              }}
              onToggleTask={(taskId, completed) => {
                if (completed) {
                  setShineId(taskId);
                }
                void commitAction({
                  action: "toggle-task",
                  schedule: "daily",
                  taskId,
                  completed
                });
              }}
              onToggleCustomTask={(taskId, completed) => {
                if (completed) {
                  setShineId(taskId);
                }
                void commitAction({
                  action: "toggle-custom-task",
                  schedule: "daily",
                  taskId,
                  completed
                });
              }}
            />

            <ChecklistSection
              locale={locale}
              schedule="weekly"
              bucket={payload.state.weekly}
              title={t(locale, "weeklys")}
              subtitle={t(locale, "starterLoadout")}
              pending={isPending}
              shineId={shineId}
              onAddTask={() => openCustomTaskDialog("weekly")}
              onEditCustomTask={(task) => openEditCustomTaskDialog("weekly", task)}
              onReorder={(itemOrder) => {
                void commitAction({
                  action: "reorder-task-items",
                  schedule: "weekly",
                  itemOrder
                });
              }}
              onToggleTask={(taskId, completed) => {
                if (completed) {
                  setShineId(taskId);
                }
                void commitAction({
                  action: "toggle-task",
                  schedule: "weekly",
                  taskId,
                  completed
                });
              }}
              onToggleCustomTask={(taskId, completed) => {
                if (completed) {
                  setShineId(taskId);
                }
                void commitAction({
                  action: "toggle-custom-task",
                  schedule: "weekly",
                  taskId,
                  completed
                });
              }}
            />

            <ChecklistSection
              locale={locale}
              schedule="todo"
              bucket={payload.state.todo}
              title={t(locale, "todos")}
              subtitle={t(locale, "customTasks")}
              pending={isPending}
              shineId={shineId}
              onAddTask={() => openCustomTaskDialog("todo")}
              onEditCustomTask={(task) => openEditCustomTaskDialog("todo", task)}
              onReorder={(itemOrder) => {
                void commitAction({
                  action: "reorder-task-items",
                  schedule: "todo",
                  itemOrder
                });
              }}
              onToggleTask={(taskId, completed) => {
                if (completed) {
                  setShineId(taskId);
                }
                void commitAction({
                  action: "toggle-task",
                  schedule: "todo",
                  taskId,
                  completed
                });
              }}
              onToggleCustomTask={(taskId, completed) => {
                if (completed) {
                  setShineId(taskId);
                }
                void commitAction({
                  action: "toggle-custom-task",
                  schedule: "todo",
                  taskId,
                  completed
                });
              }}
            />
          </div>

          <aside className="space-y-4">
            <section className="rounded-[30px] border border-white/12 bg-white/7 p-5 shadow-glass backdrop-blur-2xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">{t(locale, "authTitle")}</p>
                  <p className="mt-3 text-sm leading-7 text-white/65">{t(locale, "authText")}</p>
                </div>
                {payload.authenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      startTransition(async () => {
                        await fetch("/api/logout", {
                          method: "POST"
                        });
                        await loadDashboard();
                      });
                    }}
                    className="min-h-[46px] rounded-[18px] border border-white/12 bg-black/25 px-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                  >
                    {t(locale, "signOut")}
                  </button>
                ) : null}
              </div>

              <div className="mt-5 rounded-[22px] border border-white/10 bg-black/18 p-4">
                {payload.authenticated && payload.user ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.26em] text-white/40">{dictionary.authPersistent}</p>
                    <p className="text-xl font-semibold text-white">{payload.user.name}</p>
                    <p className="text-sm text-white/55">{payload.user.email}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAuthMode("signin")}
                        className={cn(
                          "min-h-[44px] flex-1 rounded-[16px] border px-4 text-sm font-semibold transition",
                          authMode === "signin"
                            ? "border-accent/35 bg-accent text-black"
                            : "border-white/12 bg-black/22 text-white/60"
                        )}
                      >
                        {t(locale, "signIn")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode("register")}
                        className={cn(
                          "min-h-[44px] flex-1 rounded-[16px] border px-4 text-sm font-semibold transition",
                          authMode === "register"
                            ? "border-accent/35 bg-accent text-black"
                            : "border-white/12 bg-black/22 text-white/60"
                        )}
                      >
                        {t(locale, "register")}
                      </button>
                    </div>

                    <form
                      className="mt-4 grid gap-3"
                      onSubmit={(event: FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        setMessage(null);

                        startTransition(async () => {
                          try {
                            if (authMode === "register") {
                              const registerResponse = await fetch("/api/register", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json"
                                },
                                body: JSON.stringify(authForm)
                              });

                              if (!registerResponse.ok) {
                                throw new Error("REGISTER_FAILED");
                              }
                            }

                            const loginResponse = await fetch("/api/login", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json"
                              },
                              body: JSON.stringify({
                                email: authForm.email,
                                password: authForm.password
                              })
                            });

                            if (!loginResponse.ok) {
                              throw new Error("AUTH_FAILED");
                            }

                            setAuthForm({ name: "", email: "", password: "" });
                            await loadDashboard();
                          } catch (error) {
                            if (error instanceof Error && error.message === "REGISTER_FAILED") {
                              setMessage(t(locale, "registerError"));
                              return;
                            }
                            setMessage(t(locale, "authError"));
                          }
                        });
                      }}
                    >
                      {authMode === "register" ? (
                        <input
                          value={authForm.name}
                          onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                          placeholder={t(locale, "name")}
                          className="min-h-[48px] rounded-[18px] border border-white/12 bg-black/25 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent"
                        />
                      ) : null}
                      <input
                        value={authForm.email}
                        onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                        placeholder={t(locale, "email")}
                        className="min-h-[48px] rounded-[18px] border border-white/12 bg-black/25 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent"
                      />
                      <input
                        type="password"
                        value={authForm.password}
                        onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder={t(locale, "password")}
                        className="min-h-[48px] rounded-[18px] border border-white/12 bg-black/25 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent"
                      />

                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          type="submit"
                          disabled={isPending}
                          className="min-h-[48px] rounded-[18px] border border-accent/35 bg-accent px-4 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
                        >
                          {authMode === "signin" ? t(locale, "signIn") : t(locale, "register")}
                        </button>
                        <button
                          type="button"
                          disabled={!payload.googleEnabled || isPending}
                          onClick={() => {
                            if (!payload.googleEnabled) {
                              return;
                            }
                            window.location.href = "/api/auth/google";
                          }}
                          className={cn(
                            "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[18px] border px-4 text-sm font-semibold transition",
                            payload.googleEnabled
                              ? "border-white/12 bg-black/25 text-white hover:border-white/20 hover:bg-white/8"
                              : "border-white/10 bg-black/18 text-white/35"
                          )}
                        >
                          <MaterialIcon name="login" className="text-[18px]" />
                          <span>{payload.googleEnabled ? t(locale, "continueWithGoogle") : t(locale, "googleMissing")}</span>
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>

              <p className="mt-4 text-xs leading-6 text-white/45">
                {payload.authenticated ? dictionary.authPersistent : dictionary.guestHint}
              </p>
              {message ? <p className="mt-3 text-sm text-orange-200">{message}</p> : null}
            </section>

            <section
              id="useful-links"
              className="rounded-[30px] border border-white/12 bg-white/7 p-5 shadow-glass backdrop-blur-2xl sm:p-6"
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">{t(locale, "hub")}</p>
                  <h2 className="mt-2 font-[var(--font-heading)] text-4xl uppercase leading-none tracking-[0.05em] text-white">
                    {t(locale, "usefulLinks")}
                  </h2>
                </div>
                <p className="max-w-44 text-right text-xs leading-5 text-white/52">{timeZoneDisplay}</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {payload.usefulLinks.map((link) => (
                  <LinkTile key={link.id} link={link} locale={locale} />
                ))}
              </div>
            </section>
          </aside>
        </section>

        <footer className="rounded-[30px] border border-white/12 bg-white/7 px-5 py-4 shadow-glass backdrop-blur-2xl sm:px-6">
          <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
            <div>
              <a
                href={JANNI_FUN_URL}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-white/86 transition hover:text-white"
              >
                {t(locale, "poweredBy")}
              </a>
              <p className="mt-2 max-w-2xl text-xs leading-6 text-white/45">{t(locale, "disclaimer")}</p>
            </div>

            <a
              href={JANNI_FUN_URL}
              target="_blank"
              rel="noreferrer"
              className="mx-auto block w-fit rounded-[22px] border border-white/10 bg-black/18 px-5 py-3 shadow-glass transition hover:border-white/20 hover:bg-white/8"
            >
              <img
                src={JANNI_FUN_LOGO_URL}
                alt="janni.fun"
                className="h-12 w-auto object-contain sm:h-14"
                loading="lazy"
                decoding="async"
              />
            </a>

            <div className="space-y-2 text-left md:text-right">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">{t(locale, "legalHeading")}</p>
              <div className="flex flex-col gap-2 text-sm font-semibold text-white/86 md:items-end">
                <a href="/legal/imprint" className="transition hover:text-white">
                  {t(locale, "legalNotice")}
                </a>
                <a href="/legal/privacy" className="transition hover:text-white">
                  {t(locale, "privacyPolicy")}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-white/32">
            <span>{t(locale, "dailyReset")}: {formatCountdown(payload.reset.nextDailyResetAt, locale, tick)}</span>
            <span>{t(locale, "weeklyReset")}: {formatCountdown(payload.reset.nextWeeklyResetAt, locale, tick, { includeDays: true })}</span>
          </div>
        </footer>

        {customTaskDraft ? (
          <CustomTaskModal
            locale={locale}
            draft={customTaskDraft}
            pending={isPending}
            onClose={() => setCustomTaskDraft(null)}
            onChange={(patch) => {
              setCustomTaskDraft((current) => (current ? { ...current, ...patch } : current));
            }}
            onSubmit={submitCustomTask}
            onDelete={customTaskDraft.mode === "edit" ? deleteCustomTask : undefined}
          />
        ) : null}
      </div>
    </main>
  );
}