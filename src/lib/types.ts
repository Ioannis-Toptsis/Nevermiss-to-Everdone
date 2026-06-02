export type Locale = "en" | "de";

export type Schedule = "daily" | "weekly" | "todo";

export type IconName = string;

export type LocalizedText = Record<Locale, string>;

export type TaskDefinition = {
  id: string;
  schedule: Schedule;
  icon: IconName;
  label: LocalizedText;
  detail: LocalizedText;
  points: number;
};

export type UsefulLink = {
  id: string;
  icon: IconName;
  href: string;
  title: LocalizedText;
  detail: LocalizedText;
};

export type CustomTask = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  createdAt: string;
};

export type ChecklistBucket = {
  resetKey: string;
  taskStates: Record<string, boolean>;
  customTasks: CustomTask[];
  customTaskStates: Record<string, boolean>;
  itemOrder: string[];
};

export type UserChecklistState = {
  locale: Locale;
  timeZone: string;
  resetHour: number;
  resetMinute: number;
  daily: ChecklistBucket;
  weekly: ChecklistBucket;
  todo: ChecklistBucket;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  passwordHash?: string | null;
  provider: "credentials" | "google";
  createdAt: string;
};

export type AppSession = {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type AppVisitor = {
  id: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastDailyKey: string;
};

export type AppStore = {
  users: AppUser[];
  states: Record<string, UserChecklistState>;
  sessions: AppSession[];
  visitors: AppVisitor[];
};

export type ResetInfo = {
  timezone: string;
  dailyKey: string;
  weeklyKey: string;
  nextDailyResetAt: string;
  nextWeeklyResetAt: string;
};

export type CommunityStats = {
  totalChecks: number;
  dailyFinishers: number;
  weeklyFinishers: number;
  dailyVisitors: number;
  totalVisitors: number;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type DashboardPayload = {
  authenticated: boolean;
  user: PublicUser | null;
  state: UserChecklistState;
  community: CommunityStats;
  reset: ResetInfo;
  usefulLinks: UsefulLink[];
  googleEnabled: boolean;
};

export type UserStateAction =
  | {
      action: "toggle-task";
      schedule: Schedule;
      taskId: string;
      completed: boolean;
    }
  | {
      action: "toggle-custom-task";
      schedule: Schedule;
      taskId: string;
      completed: boolean;
    }
  | {
      action: "add-custom-task";
      schedule: Schedule;
      title: string;
      description: string;
      icon: IconName;
    }
  | {
      action: "edit-custom-task";
      schedule: Schedule;
      taskId: string;
      title: string;
      description: string;
      icon: IconName;
    }
  | {
      action: "delete-custom-task";
      schedule: Schedule;
      taskId: string;
    }
  | {
      action: "reorder-task-items";
      schedule: Schedule;
      itemOrder: string[];
    }
  | {
      action: "set-locale";
      locale: Locale;
    }
  | {
      action: "set-timezone";
      timeZone: string;
    }
  | {
      action: "set-reset-time";
      resetHour: number;
      resetMinute: number;
    };
