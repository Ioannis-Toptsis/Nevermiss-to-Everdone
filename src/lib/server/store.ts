import bcrypt from "bcryptjs";

import {
  CUSTOM_TASK_ICONS,
  DAILY_TASKS,
  DEFAULT_CUSTOM_TASK_ICON,
  DEFAULT_LOCALE,
  USEFUL_LINKS,
  WEEKLY_TASKS
} from "@/lib/data";
import { isLocale } from "@/lib/i18n";
import {
  DEFAULT_DISPLAY_TIMEZONE,
  DEFAULT_RESET_HOUR,
  DEFAULT_RESET_MINUTE,
  getPreferredResetTime,
  getPreferredTimeZone,
  getResetInfo
} from "@/lib/reset";
import { readStoreFromDatabase, writeStoreToDatabase } from "@/lib/server/database";
import type {
  AppSession,
  AppStore,
  AppUser,
  AppVisitor,
  ChecklistBucket,
  CommunityStats,
  CustomTask,
  DashboardPayload,
  Locale,
  PublicUser,
  Schedule,
  UserChecklistState,
  UserStateAction
} from "@/lib/types";

const dailyTaskIds = DAILY_TASKS.map((task) => task.id);
const weeklyTaskIds = WEEKLY_TASKS.map((task) => task.id);
const todoTaskIds: string[] = [];
const TODO_RESET_KEY = "todo:permanent";
const customTaskIcons = new Set<string>(CUSTOM_TASK_ICONS);

const emptyStore: AppStore = {
  users: [],
  states: {},
  sessions: [],
  visitors: []
};

let writeQueue = Promise.resolve();

function toPublicUser(user: AppUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null
  };
}

function buildEmptyStateMap(ids: string[]) {
  return Object.fromEntries(ids.map((id) => [id, false]));
}

function normalizeBooleanMap(source: Record<string, boolean> | undefined, ids: string[]) {
  return Object.fromEntries(ids.map((id) => [id, Boolean(source?.[id])])) as Record<string, boolean>;
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

function buildItemIds(taskIds: string[], customTasks: CustomTask[]) {
  return [...taskIds, ...customTasks.map((task) => task.id)];
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

function createBucket(
  resetKey: string,
  taskIds: string[],
  customTasks: CustomTask[] = [],
  customTaskStates?: Record<string, boolean>,
  itemOrder?: string[]
): ChecklistBucket {
  const validIds = buildItemIds(taskIds, customTasks);

  return {
    resetKey,
    taskStates: buildEmptyStateMap(taskIds),
    customTasks,
    customTaskStates: buildCustomTaskStateMap(customTasks, customTaskStates),
    itemOrder: normalizeItemOrder(itemOrder, validIds)
  };
}

function normalizeBucket(
  bucket: ChecklistBucket | undefined,
  resetKey: string,
  taskIds: string[]
): ChecklistBucket {
  const customTasks = normalizeCustomTasks(bucket?.customTasks);
  const keepStates = bucket?.resetKey === resetKey;
  const validIds = buildItemIds(taskIds, customTasks);

  return {
    resetKey,
    taskStates: keepStates ? normalizeBooleanMap(bucket?.taskStates, taskIds) : buildEmptyStateMap(taskIds),
    customTasks,
    customTaskStates: buildCustomTaskStateMap(customTasks, keepStates ? bucket?.customTaskStates : undefined),
    itemOrder: normalizeItemOrder(bucket?.itemOrder, validIds)
  };
}

function rebindBucketToReset(
  bucket: ChecklistBucket | undefined,
  resetKey: string,
  taskIds: string[]
): ChecklistBucket {
  const customTasks = normalizeCustomTasks(bucket?.customTasks);
  const validIds = buildItemIds(taskIds, customTasks);

  return {
    resetKey,
    taskStates: normalizeBooleanMap(bucket?.taskStates, taskIds),
    customTasks,
    customTaskStates: buildCustomTaskStateMap(customTasks, bucket?.customTaskStates),
    itemOrder: normalizeItemOrder(bucket?.itemOrder, validIds)
  };
}
  function rebindStateToResetPreferences(
    state: UserChecklistState,
    timeZone: string,
    resetHour: number,
    resetMinute: number
  ) {
    const resetInfo = getResetInfo(new Date(), timeZone, resetHour, resetMinute);

    state.timeZone = timeZone;
    state.resetHour = resetHour;
    state.resetMinute = resetMinute;
    state.daily = rebindBucketToReset(state.daily, resetInfo.dailyKey, dailyTaskIds);
    state.weekly = rebindBucketToReset(state.weekly, resetInfo.weeklyKey, weeklyTaskIds);
      state.todo = rebindBucketToReset(state.todo, TODO_RESET_KEY, todoTaskIds);
  }

function createDefaultState(
  locale: Locale,
    timeZone: string = DEFAULT_DISPLAY_TIMEZONE,
    resetHour: number = DEFAULT_RESET_HOUR,
    resetMinute: number = DEFAULT_RESET_MINUTE
): UserChecklistState {
  const preferredTimeZone = getPreferredTimeZone(timeZone);
    const preferredReset = getPreferredResetTime(resetHour, resetMinute);
    const resetInfo = getResetInfo(
      new Date(),
      preferredTimeZone,
      preferredReset.resetHour,
      preferredReset.resetMinute
    );

  return {
    locale,
    timeZone: preferredTimeZone,
      resetHour: preferredReset.resetHour,
      resetMinute: preferredReset.resetMinute,
    daily: createBucket(resetInfo.dailyKey, dailyTaskIds),
    weekly: createBucket(resetInfo.weeklyKey, weeklyTaskIds),
    todo: createBucket(TODO_RESET_KEY, todoTaskIds)
  };
}

function hydrateState(state: UserChecklistState | undefined): UserChecklistState {
  if (!state) {
    return createDefaultState(DEFAULT_LOCALE, DEFAULT_DISPLAY_TIMEZONE);
  }

  const locale = isLocale(state.locale) ? state.locale : DEFAULT_LOCALE;
  const timeZone = getPreferredTimeZone(state.timeZone);
  const preferredReset = getPreferredResetTime(state.resetHour, state.resetMinute);
  const resetInfo = getResetInfo(new Date(), timeZone, preferredReset.resetHour, preferredReset.resetMinute);
  const shouldRebindExistingState =
    !Number.isInteger(state.resetHour) ||
    !Number.isInteger(state.resetMinute) ||
    state.resetHour !== preferredReset.resetHour ||
    state.resetMinute !== preferredReset.resetMinute ||
    state.timeZone !== timeZone;
  const dailySource = shouldRebindExistingState
    ? rebindBucketToReset(state.daily, resetInfo.dailyKey, dailyTaskIds)
    : normalizeBucket(state.daily, resetInfo.dailyKey, dailyTaskIds);
  const weeklySource = shouldRebindExistingState
    ? rebindBucketToReset(state.weekly, resetInfo.weeklyKey, weeklyTaskIds)
    : normalizeBucket(state.weekly, resetInfo.weeklyKey, weeklyTaskIds);
  const todoSource = rebindBucketToReset(state.todo, TODO_RESET_KEY, todoTaskIds);

  return {
    locale,
    timeZone,
    resetHour: preferredReset.resetHour,
    resetMinute: preferredReset.resetMinute,
    daily: dailySource,
    weekly: weeklySource,
    todo: todoSource
  };
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

function getTaskIdsForSchedule(schedule: Schedule) {
  switch (schedule) {
    case "daily":
      return dailyTaskIds;
    case "weekly":
      return weeklyTaskIds;
    case "todo":
      return todoTaskIds;
    default:
      return todoTaskIds;
  }
}

function findCustomTask(bucket: ChecklistBucket, taskId: string) {
  return bucket.customTasks.find((task) => task.id === taskId) ?? null;
}

function getTotals(bucket: ChecklistBucket, taskIds: string[]) {
  const baseCompleted = taskIds.filter((taskId) => bucket.taskStates[taskId]).length;

  return {
    completed: baseCompleted,
    total: taskIds.length
  };
}

function recordVisitorVisit(store: AppStore, visitorId: string | null | undefined, dailyKey: string) {
  if (!visitorId) {
    return;
  }

  const now = new Date().toISOString();
  const visitor = store.visitors.find((entry) => entry.id === visitorId);

  if (visitor) {
    visitor.lastSeenAt = now;
    visitor.lastDailyKey = dailyKey;
    return;
  }

  const nextVisitor: AppVisitor = {
    id: visitorId,
    firstSeenAt: now,
    lastSeenAt: now,
    lastDailyKey: dailyKey
  };

  store.visitors.push(nextVisitor);
}

function computeCommunityStats(store: AppStore, viewerDailyKey: string): CommunityStats {
  let totalChecks = 0;
  let dailyFinishers = 0;
  let weeklyFinishers = 0;

  for (const user of store.users) {
    const state = hydrateState(store.states[user.id]);
    store.states[user.id] = state;

    const daily = getTotals(state.daily, dailyTaskIds);
    const weekly = getTotals(state.weekly, weeklyTaskIds);

    totalChecks += daily.completed + weekly.completed;

    if (daily.total > 0 && daily.completed === daily.total) {
      dailyFinishers += 1;
    }

    if (weekly.total > 0 && weekly.completed === weekly.total) {
      weeklyFinishers += 1;
    }
  }

  return {
    totalChecks,
    dailyFinishers,
    weeklyFinishers,
    dailyVisitors: store.visitors.filter((visitor) => visitor.lastDailyKey === viewerDailyKey).length,
    totalVisitors: store.visitors.length
  };
}

function normalizeStore(input: Partial<AppStore> | undefined): AppStore {
  return {
    users: Array.isArray(input?.users) ? input.users.filter(Boolean) as AppUser[] : [],
    states: input?.states && typeof input.states === "object" ? input.states : {},
    sessions: Array.isArray(input?.sessions) ? input.sessions.filter(Boolean) as AppSession[] : [],
    visitors: Array.isArray(input?.visitors) ? input.visitors.filter(Boolean) as AppVisitor[] : []
  };
}

function pruneSessions(store: AppStore) {
  const now = Date.now();
  store.sessions = store.sessions.filter((session) => new Date(session.expiresAt).getTime() > now);
}

async function readStore() {
  return normalizeStore(readStoreFromDatabase());
}

async function writeStore(store: AppStore) {
  writeQueue = writeQueue.then(async () => {
    writeStoreToDatabase(store);
  });

  await writeQueue;
}

async function mutateStore<T>(mutator: (store: AppStore) => Promise<T> | T) {
  const store = await readStore();
  const result = await mutator(store);
  await writeStore(store);
  return result;
}

function buildDashboardPayload(
  store: AppStore,
  state: UserChecklistState,
  user: AppUser | null
): DashboardPayload {
  const resetInfo = getResetInfo(new Date(), state.timeZone, state.resetHour, state.resetMinute);

  return {
    authenticated: Boolean(user),
    user: user ? toPublicUser(user) : null,
    state,
    community: computeCommunityStats(store, resetInfo.dailyKey),
    reset: resetInfo,
    usefulLinks: USEFUL_LINKS,
    googleEnabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  };
}

function findUserById(store: AppStore, userId: string) {
  return store.users.find((user) => user.id === userId) ?? null;
}

export async function createCredentialsUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  return mutateStore(async (store) => {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim().slice(0, 36);

    if (store.users.some((user) => user.email.toLowerCase() === email)) {
      throw new Error("USER_EXISTS");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user: AppUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
      provider: "credentials",
      createdAt: new Date().toISOString()
    };

    store.users.push(user);
    store.states[user.id] = createDefaultState(DEFAULT_LOCALE, DEFAULT_DISPLAY_TIMEZONE);

    return toPublicUser(user);
  });
}

export async function verifyCredentials(email: string, password: string) {
  const store = await readStore();
  const normalizedEmail = email.trim().toLowerCase();
  const user = store.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);

  if (!user?.passwordHash) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? toPublicUser(user) : null;
}

export async function upsertGoogleUser(input: {
  email: string;
  name: string;
  image?: string | null;
}) {
  return mutateStore((store) => {
    const email = input.email.trim().toLowerCase();
    const existingUser = store.users.find((user) => user.email.toLowerCase() === email);

    if (existingUser) {
      existingUser.name = input.name.trim().slice(0, 36) || existingUser.name;
      existingUser.image = input.image ?? existingUser.image ?? null;
      existingUser.provider = "google";
      store.states[existingUser.id] = hydrateState(store.states[existingUser.id]);
      return toPublicUser(existingUser);
    }

    const user: AppUser = {
      id: crypto.randomUUID(),
      name: input.name.trim().slice(0, 36) || email.split("@")[0],
      email,
      image: input.image ?? null,
      provider: "google",
      passwordHash: null,
      createdAt: new Date().toISOString()
    };

    store.users.push(user);
    store.states[user.id] = createDefaultState(DEFAULT_LOCALE, DEFAULT_DISPLAY_TIMEZONE);
    return toPublicUser(user);
  });
}

export async function getDashboardData(userId?: string | null, visitorId?: string | null) {
  return mutateStore((store) => {
    pruneSessions(store);
    const user = userId ? findUserById(store, userId) : null;
    const state = user
      ? hydrateState(store.states[user.id])
      : createDefaultState(DEFAULT_LOCALE, DEFAULT_DISPLAY_TIMEZONE);

    if (user) {
      store.states[user.id] = state;
    }

    recordVisitorVisit(store, visitorId, state.daily.resetKey);

    return buildDashboardPayload(store, state, user);
  });
}

export async function createCredentialsSession(input: {
  email: string;
  password: string;
}) {
  return mutateStore(async (store) => {
    pruneSessions(store);

    const normalizedEmail = input.email.trim().toLowerCase();
    const user = store.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);

    if (!user?.passwordHash) {
      return null;
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      return null;
    }

    return createSessionForUser(store, user);
  });
}

function createSessionForUser(store: AppStore, user: AppUser) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString();
    const session: AppSession = {
      token: crypto.randomUUID(),
      userId: user.id,
      createdAt: now.toISOString(),
      expiresAt
    };

    store.sessions.push(session);

    return {
      token: session.token,
      expiresAt: session.expiresAt,
      user: toPublicUser(user)
    };
}

export async function createSessionForUserId(userId: string) {
  return mutateStore((store) => {
    pruneSessions(store);

    const user = findUserById(store, userId);
    if (!user) {
      return null;
    }

    return createSessionForUser(store, user);
  });
}

export async function getUserIdForSessionToken(token: string) {
  return mutateStore((store) => {
    pruneSessions(store);
    return store.sessions.find((session) => session.token === token)?.userId ?? null;
  });
}

export async function deleteSession(token: string) {
  return mutateStore((store) => {
    pruneSessions(store);
    store.sessions = store.sessions.filter((session) => session.token !== token);
  });
}

export async function updateUserDashboard(userId: string, action: UserStateAction) {
  return mutateStore((store) => {
    const user = findUserById(store, userId);

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const state = hydrateState(store.states[user.id]);
    store.states[user.id] = state;

    switch (action.action) {
      case "toggle-task": {
        const bucket = getBucket(state, action.schedule);
        if (!(action.taskId in bucket.taskStates)) {
          throw new Error("TASK_NOT_FOUND");
        }
        bucket.taskStates[action.taskId] = action.completed;
        break;
      }
      case "toggle-custom-task": {
        const bucket = getBucket(state, action.schedule);
        if (!(action.taskId in bucket.customTaskStates)) {
          throw new Error("CUSTOM_TASK_NOT_FOUND");
        }
        bucket.customTaskStates[action.taskId] = action.completed;
        break;
      }
      case "add-custom-task": {
        const bucket = getBucket(state, action.schedule);
        const title = normalizeCustomTaskText(action.title, 80);

        if (!title) {
          throw new Error("INVALID_CUSTOM_TASK_TITLE");
        }

        const nextTask: CustomTask = {
          id: crypto.randomUUID(),
          title,
          description: normalizeCustomTaskText(action.description, 280),
          icon: customTaskIcons.has(action.icon) ? action.icon : DEFAULT_CUSTOM_TASK_ICON,
          createdAt: new Date().toISOString()
        };

        bucket.customTasks.push(nextTask);
        bucket.customTaskStates[nextTask.id] = false;
        bucket.itemOrder = [...bucket.itemOrder.filter((id) => id !== nextTask.id), nextTask.id];
        break;
      }
      case "edit-custom-task": {
        const bucket = getBucket(state, action.schedule);
        const task = findCustomTask(bucket, action.taskId);
        const title = normalizeCustomTaskText(action.title, 80);

        if (!task) {
          throw new Error("CUSTOM_TASK_NOT_FOUND");
        }

        if (!title) {
          throw new Error("INVALID_CUSTOM_TASK_TITLE");
        }

        task.title = title;
        task.description = normalizeCustomTaskText(action.description, 280);
        task.icon = customTaskIcons.has(action.icon) ? action.icon : DEFAULT_CUSTOM_TASK_ICON;
        break;
      }
      case "delete-custom-task": {
        const bucket = getBucket(state, action.schedule);

        if (!findCustomTask(bucket, action.taskId)) {
          throw new Error("CUSTOM_TASK_NOT_FOUND");
        }

        bucket.customTasks = bucket.customTasks.filter((task) => task.id !== action.taskId);
        delete bucket.customTaskStates[action.taskId];
        bucket.itemOrder = bucket.itemOrder.filter((id) => id !== action.taskId);
        break;
      }
      case "reorder-task-items": {
        const bucket = getBucket(state, action.schedule);
        const validIds = buildItemIds(getTaskIdsForSchedule(action.schedule), bucket.customTasks);
        bucket.itemOrder = normalizeItemOrder(action.itemOrder, validIds);
        break;
      }
      case "set-locale": {
        state.locale = action.locale;
        break;
      }
      case "set-timezone": {
        const nextTimeZone = getPreferredTimeZone(action.timeZone);
        rebindStateToResetPreferences(state, nextTimeZone, state.resetHour, state.resetMinute);
        break;
      }
      case "set-reset-time": {
        const preferredReset = getPreferredResetTime(action.resetHour, action.resetMinute);
        rebindStateToResetPreferences(
          state,
          state.timeZone,
          preferredReset.resetHour,
          preferredReset.resetMinute
        );
        break;
      }
      default:
        break;
    }

    return buildDashboardPayload(store, state, user);
  });
}
