import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

import type { Locale, ResetInfo } from "@/lib/types";

type ResetTimeZoneOption = {
  id: string;
  timeZone: string;
  group: string;
  label: string;
};

const LEGACY_TIME_ZONE_ID_MAP = {
  "america-pst": "America/Los_Angeles",
  "america-mst": "America/Denver",
  "america-cst": "America/Chicago",
  "america-est": "America/New_York",
  "europe-wet": "Europe/London",
  "europe-cet": "Europe/Berlin",
  "europe-eet": "Europe/Athens",
  "asia-ist": "Asia/Kolkata",
  "asia-cst": "Asia/Shanghai",
  "asia-hkt": "Asia/Hong_Kong",
  "asia-pht": "Asia/Manila",
  "asia-jst": "Asia/Tokyo",
  "asia-kst": "Asia/Seoul"
} as const;

const intlWithSupportedValues = Intl as typeof Intl & {
  supportedValuesOf?: (key: string) => string[];
};

export const DEFAULT_DISPLAY_TIMEZONE = "Europe/Berlin";
export const DEFAULT_RESET_HOUR = 5;
export const DEFAULT_RESET_MINUTE = 0;

function formatTimeZoneSegment(value: string) {
  return value.replace(/_/g, " ");
}

function resolveLegacyTimeZone(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(LEGACY_TIME_ZONE_ID_MAP, value)) {
    return LEGACY_TIME_ZONE_ID_MAP[value as keyof typeof LEGACY_TIME_ZONE_ID_MAP];
  }

  return value;
}

function getCanonicalTimeZone(value: string | null | undefined) {
  const candidate = resolveLegacyTimeZone(value);

  if (!candidate) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: candidate }).resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

function getResolvedTimeZoneParts(value: string | null | undefined) {
  const timeZone = getPreferredTimeZone(value);
  const [group = "Other", ...remainder] = timeZone.split("/");

  return {
    timeZone,
    group: group === "Etc" && remainder.length === 0 ? "UTC" : formatTimeZoneSegment(group),
    label:
      remainder.length > 0
        ? remainder.map((segment) => formatTimeZoneSegment(segment)).join(" / ")
        : formatTimeZoneSegment(timeZone)
  };
}

function compareTimeZones(left: string, right: string) {
  const leftParts = getResolvedTimeZoneParts(left);
  const rightParts = getResolvedTimeZoneParts(right);

  return (
    leftParts.group.localeCompare(rightParts.group) ||
    leftParts.label.localeCompare(rightParts.label) ||
    leftParts.timeZone.localeCompare(rightParts.timeZone)
  );
}

function buildAvailableTimeZones() {
  const timeZones = new Set<string>();
  const supportedTimeZones = intlWithSupportedValues.supportedValuesOf?.("timeZone") ?? [];

  for (const candidate of [
    ...supportedTimeZones,
    DEFAULT_DISPLAY_TIMEZONE,
    "UTC",
    ...Object.values(LEGACY_TIME_ZONE_ID_MAP)
  ]) {
    const canonical = getCanonicalTimeZone(candidate);

    if (canonical) {
      timeZones.add(canonical);
    }
  }

  return [...timeZones].sort(compareTimeZones).map<ResetTimeZoneOption>((timeZone) => {
    const parts = getResolvedTimeZoneParts(timeZone);

    return {
      id: parts.timeZone,
      timeZone: parts.timeZone,
      group: parts.group,
      label: parts.label
    };
  });
}

const availableTimeZones = buildAvailableTimeZones();

function formatCycleKey(cycleStart: Date, timeZone: string, resetHour: number, resetMinute: number) {
  return `${timeZone}|${resetHour.toString().padStart(2, "0")}:${resetMinute
    .toString()
    .padStart(2, "0")}|${formatInTimeZone(cycleStart, timeZone, "yyyy-MM-dd")}`;
}

function getTodayReset(
  now: Date,
  value: string | null | undefined,
  resetHour: number = DEFAULT_RESET_HOUR,
  resetMinute: number = DEFAULT_RESET_MINUTE
) {
  const timeZone = getPreferredTimeZone(value);
  const preferredReset = getPreferredResetTime(resetHour, resetMinute);
  const zonedNow = toZonedTime(now, timeZone);
  const todayReset = new Date(zonedNow);
  todayReset.setHours(preferredReset.resetHour, preferredReset.resetMinute, 0, 0);

  return {
    timeZone,
    resetHour: preferredReset.resetHour,
    resetMinute: preferredReset.resetMinute,
    zonedNow,
    todayReset
  };
}

export function isValidTimeZone(value: string | null | undefined): value is string {
  return Boolean(getCanonicalTimeZone(value));
}

export function getPreferredTimeZone(value: string | null | undefined) {
  return getCanonicalTimeZone(value) ?? DEFAULT_DISPLAY_TIMEZONE;
}

export function getPreferredResetTime(
  resetHour: number | null | undefined,
  resetMinute: number | null | undefined
) {
  const safeHour = Number.isInteger(resetHour) ? Math.min(23, Math.max(0, Number(resetHour))) : DEFAULT_RESET_HOUR;
  const safeMinute = DEFAULT_RESET_MINUTE;

  return {
    resetHour: safeHour,
    resetMinute: safeMinute
  };
}

export function getAvailableTimeZones() {
  return availableTimeZones;
}

export function getTimeZoneLabel(value: string | null | undefined) {
  return getResolvedTimeZoneParts(value).label;
}

export function getTimeZoneGroup(value: string | null | undefined) {
  return getResolvedTimeZoneParts(value).group;
}

function getLocaleTag(locale: Locale) {
  return locale === "de" ? "de-DE" : "en-US";
}

function getTimeZoneOffsetLabel(timeZone: string, locale: Locale) {
  try {
    return (
      new Intl.DateTimeFormat(getLocaleTag(locale), {
        timeZone,
        timeZoneName: "shortOffset"
      })
        .formatToParts(new Date())
        .find((part) => part.type === "timeZoneName")
        ?.value.replace("GMT", "UTC") ?? ""
    );
  } catch {
    return "";
  }
}

export function formatTimeZoneOptionLabel(value: string | null | undefined, locale: Locale) {
  const timeZone = getPreferredTimeZone(value);
  const label = getTimeZoneLabel(timeZone);
  const offsetLabel = getTimeZoneOffsetLabel(timeZone, locale);

  return offsetLabel ? `${label} (${offsetLabel})` : label;
}

export function formatResetClock(
  resetHour: number | null | undefined = DEFAULT_RESET_HOUR,
  resetMinute: number | null | undefined = DEFAULT_RESET_MINUTE,
  locale: Locale
) {
  const preferredReset = getPreferredResetTime(resetHour, resetMinute);
  const localeTag = locale === "de" ? "de-DE" : "en-US";
  const sample = new Date(Date.UTC(2024, 0, 1, preferredReset.resetHour, preferredReset.resetMinute));

  return new Intl.DateTimeFormat(localeTag, {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit"
  }).format(sample);
}

export function formatResetDateTime(targetIso: string, locale: Locale, timeZone: string) {
  const preferredTimeZone = getPreferredTimeZone(timeZone);
  const localeTag = getLocaleTag(locale);

  return new Intl.DateTimeFormat(localeTag, {
    timeZone: preferredTimeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(targetIso));
}

export function getNextDailyReset(
  now: Date = new Date(),
  timeZone: string = DEFAULT_DISPLAY_TIMEZONE,
  resetHour: number = DEFAULT_RESET_HOUR,
  resetMinute: number = DEFAULT_RESET_MINUTE
) {
  const { timeZone: preferredTimeZone, zonedNow, todayReset } = getTodayReset(now, timeZone, resetHour, resetMinute);

  if (zonedNow >= todayReset) {
    todayReset.setDate(todayReset.getDate() + 1);
  }

  return fromZonedTime(todayReset, preferredTimeZone);
}

export function getCurrentDailyKey(
  now: Date = new Date(),
  timeZone: string = DEFAULT_DISPLAY_TIMEZONE,
  resetHour: number = DEFAULT_RESET_HOUR,
  resetMinute: number = DEFAULT_RESET_MINUTE
) {
  const { timeZone: preferredTimeZone, resetHour: safeHour, resetMinute: safeMinute, zonedNow, todayReset } = getTodayReset(
    now,
    timeZone,
    resetHour,
    resetMinute
  );

  if (zonedNow < todayReset) {
    todayReset.setDate(todayReset.getDate() - 1);
  }

  const cycleStart = fromZonedTime(todayReset, preferredTimeZone);
  return formatCycleKey(cycleStart, preferredTimeZone, safeHour, safeMinute);
}

export function getNextWeeklyReset(
  now: Date = new Date(),
  timeZone: string = DEFAULT_DISPLAY_TIMEZONE,
  resetHour: number = DEFAULT_RESET_HOUR,
  resetMinute: number = DEFAULT_RESET_MINUTE
) {
  const preferredTimeZone = getPreferredTimeZone(timeZone);
  const preferredReset = getPreferredResetTime(resetHour, resetMinute);
  const zonedNow = toZonedTime(now, preferredTimeZone);
  const nextWeeklyReset = new Date(zonedNow);
  nextWeeklyReset.setHours(preferredReset.resetHour, preferredReset.resetMinute, 0, 0);

  let daysUntilMonday = (8 - nextWeeklyReset.getDay()) % 7;
  if (daysUntilMonday === 0 && zonedNow >= nextWeeklyReset) {
    daysUntilMonday = 7;
  }

  nextWeeklyReset.setDate(nextWeeklyReset.getDate() + daysUntilMonday);
  return fromZonedTime(nextWeeklyReset, preferredTimeZone);
}

export function getCurrentWeeklyKey(
  now: Date = new Date(),
  timeZone: string = DEFAULT_DISPLAY_TIMEZONE,
  resetHour: number = DEFAULT_RESET_HOUR,
  resetMinute: number = DEFAULT_RESET_MINUTE
) {
  const preferredTimeZone = getPreferredTimeZone(timeZone);
  const preferredReset = getPreferredResetTime(resetHour, resetMinute);
  const zonedNow = toZonedTime(now, preferredTimeZone);
  const weeklyStart = new Date(zonedNow);
  weeklyStart.setHours(preferredReset.resetHour, preferredReset.resetMinute, 0, 0);

  const daysSinceMonday = (weeklyStart.getDay() + 6) % 7;
  weeklyStart.setDate(weeklyStart.getDate() - daysSinceMonday);

  if (zonedNow < weeklyStart) {
    weeklyStart.setDate(weeklyStart.getDate() - 7);
  }

  const cycleStart = fromZonedTime(weeklyStart, preferredTimeZone);
  return formatCycleKey(cycleStart, preferredTimeZone, preferredReset.resetHour, preferredReset.resetMinute);
}

export function getResetInfo(
  now: Date = new Date(),
  timeZone: string = DEFAULT_DISPLAY_TIMEZONE,
  resetHour: number = DEFAULT_RESET_HOUR,
  resetMinute: number = DEFAULT_RESET_MINUTE
): ResetInfo {
  const preferredTimeZone = getPreferredTimeZone(timeZone);
  const preferredReset = getPreferredResetTime(resetHour, resetMinute);

  return {
    timezone: getTimeZoneLabel(preferredTimeZone),
    dailyKey: getCurrentDailyKey(now, preferredTimeZone, preferredReset.resetHour, preferredReset.resetMinute),
    weeklyKey: getCurrentWeeklyKey(now, preferredTimeZone, preferredReset.resetHour, preferredReset.resetMinute),
    nextDailyResetAt: getNextDailyReset(now, preferredTimeZone, preferredReset.resetHour, preferredReset.resetMinute).toISOString(),
    nextWeeklyResetAt: getNextWeeklyReset(now, preferredTimeZone, preferredReset.resetHour, preferredReset.resetMinute).toISOString()
  };
}
