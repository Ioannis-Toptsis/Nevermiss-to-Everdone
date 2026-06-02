import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import type { AppSession, AppStore, AppUser, AppVisitor, UserChecklistState } from "@/lib/types";

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "app.db");
const legacyStorePath = path.join(dataDirectory, "store.json");

type UserRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  password_hash: string | null;
  provider: "credentials" | "google";
  created_at: string;
};

type SessionRow = {
  token: string;
  user_id: string;
  created_at: string;
  expires_at: string;
};

type StateRow = {
  user_id: string;
  payload: string;
};

type VisitorRow = {
  id: string;
  first_seen_at: string;
  last_seen_at: string;
  last_daily_key: string;
};

let database: DatabaseSync | null = null;

function parseJson<T>(value: string, fallback: T) {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeLegacyStore(input: Partial<AppStore> | undefined): AppStore {
  return {
    users: Array.isArray(input?.users) ? input.users.filter(Boolean) as AppUser[] : [],
    states: input?.states && typeof input.states === "object" ? input.states : {},
    sessions: Array.isArray(input?.sessions) ? input.sessions.filter(Boolean) as AppSession[] : [],
    visitors: Array.isArray(input?.visitors) ? input.visitors.filter(Boolean) as AppVisitor[] : []
  };
}

function readLegacyStore() {
  if (!existsSync(legacyStorePath)) {
    return null;
  }

  const raw = readFileSync(legacyStorePath, "utf8");
  return normalizeLegacyStore(parseJson<Partial<AppStore>>(raw, {}));
}

function writeStoreInternal(nextStore: AppStore) {
  const db = getDatabase();

  db.exec("BEGIN");

  try {
    db.exec("DELETE FROM visitors");
    db.exec("DELETE FROM user_states");
    db.exec("DELETE FROM sessions");
    db.exec("DELETE FROM users");

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, image, password_hash, provider, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertSession = db.prepare(`
      INSERT INTO sessions (token, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `);
    const insertState = db.prepare(`
      INSERT INTO user_states (user_id, payload)
      VALUES (?, ?)
    `);
    const insertVisitor = db.prepare(`
      INSERT INTO visitors (id, first_seen_at, last_seen_at, last_daily_key)
      VALUES (?, ?, ?, ?)
    `);

    for (const user of nextStore.users) {
      insertUser.run(
        user.id,
        user.name,
        user.email,
        user.image ?? null,
        user.passwordHash ?? null,
        user.provider,
        user.createdAt
      );
    }

    for (const session of nextStore.sessions) {
      insertSession.run(session.token, session.userId, session.createdAt, session.expiresAt);
    }

    for (const [userId, state] of Object.entries(nextStore.states)) {
      insertState.run(userId, JSON.stringify(state));
    }

    for (const visitor of nextStore.visitors) {
      insertVisitor.run(visitor.id, visitor.firstSeenAt, visitor.lastSeenAt, visitor.lastDailyKey);
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function maybeMigrateLegacyStore(db: DatabaseSync) {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number };
  const stateCount = db.prepare("SELECT COUNT(*) AS count FROM user_states").get() as { count: number };
  const sessionCount = db.prepare("SELECT COUNT(*) AS count FROM sessions").get() as { count: number };
  const visitorCount = db.prepare("SELECT COUNT(*) AS count FROM visitors").get() as { count: number };

  if (userCount.count > 0 || stateCount.count > 0 || sessionCount.count > 0 || visitorCount.count > 0) {
    return;
  }

  const legacyStore = readLegacyStore();
  if (!legacyStore) {
    return;
  }

  writeStoreInternal(legacyStore);
}

export function getDatabase() {
  if (database) {
    return database;
  }

  mkdirSync(dataDirectory, { recursive: true });

  database = new DatabaseSync(databasePath);
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      image TEXT,
      password_hash TEXT,
      provider TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_states (
      user_id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      last_daily_key TEXT NOT NULL
    );
  `);

  maybeMigrateLegacyStore(database);
  return database;
}

export function readStoreFromDatabase(): AppStore {
  const db = getDatabase();
  const userRows = db.prepare("SELECT * FROM users").all() as UserRow[];
  const sessionRows = db.prepare("SELECT * FROM sessions").all() as SessionRow[];
  const stateRows = db.prepare("SELECT * FROM user_states").all() as StateRow[];
  const visitorRows = db.prepare("SELECT * FROM visitors").all() as VisitorRow[];

  return {
    users: userRows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      passwordHash: row.password_hash,
      provider: row.provider,
      createdAt: row.created_at
    })),
    sessions: sessionRows.map((row) => ({
      token: row.token,
      userId: row.user_id,
      createdAt: row.created_at,
      expiresAt: row.expires_at
    })),
    states: Object.fromEntries(
      stateRows.map((row) => [row.user_id, parseJson<UserChecklistState>(row.payload, {} as UserChecklistState)])
    ),
    visitors: visitorRows.map((row) => ({
      id: row.id,
      firstSeenAt: row.first_seen_at,
      lastSeenAt: row.last_seen_at,
      lastDailyKey: row.last_daily_key
    }))
  };
}

export function writeStoreToDatabase(nextStore: AppStore) {
  writeStoreInternal(nextStore);
}
