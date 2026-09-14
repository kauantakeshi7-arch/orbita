import { randomUUID } from "crypto";
import { getPool } from "./store";
import type { BirthProfile, TarotDrawRecord, User } from "./types";

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    passwordHash: row.password_hash as string,
    displayName: row.display_name as string,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

function rowToProfile(row: Record<string, unknown>): BirthProfile {
  return {
    userId: row.user_id as string,
    birthDate: row.birth_date as string,
    birthTime: row.birth_time as string,
    timeUnknown: row.time_unknown as boolean,
    placeLabel: row.place_label as string,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function rowToDraw(row: Record<string, unknown>): TarotDrawRecord {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: row.date as string,
    spread: row.spread as TarotDrawRecord["spread"],
    cardIds: row.card_ids as number[],
    reversed: row.reversed as boolean[],
    note: (row.note as string | null) ?? null,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email.toLowerCase()]
  );
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const pool = getPool();
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  displayName: string;
}): Promise<User> {
  const pool = getPool();
  const normalizedEmail = input.email.toLowerCase();
  const existing = await pool.query("SELECT 1 FROM users WHERE email = $1", [
    normalizedEmail,
  ]);
  if ((existing.rowCount ?? 0) > 0) {
    throw new Error("EMAIL_TAKEN");
  }
  const id = randomUUID();
  const { rows } = await pool.query(
    `INSERT INTO users (id, email, password_hash, display_name)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, normalizedEmail, input.passwordHash, input.displayName]
  );
  return rowToUser(rows[0]);
}

export async function getBirthProfile(
  userId: string
): Promise<BirthProfile | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT * FROM birth_profiles WHERE user_id = $1",
    [userId]
  );
  return rows[0] ? rowToProfile(rows[0]) : null;
}

export async function saveBirthProfile(
  profile: Omit<BirthProfile, "updatedAt">
): Promise<BirthProfile> {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO birth_profiles
       (user_id, birth_date, birth_time, time_unknown, place_label, latitude, longitude, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, now())
     ON CONFLICT (user_id) DO UPDATE SET
       birth_date = EXCLUDED.birth_date,
       birth_time = EXCLUDED.birth_time,
       time_unknown = EXCLUDED.time_unknown,
       place_label = EXCLUDED.place_label,
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude,
       updated_at = now()
     RETURNING *`,
    [
      profile.userId,
      profile.birthDate,
      profile.birthTime,
      profile.timeUnknown,
      profile.placeLabel,
      profile.latitude,
      profile.longitude,
    ]
  );
  return rowToProfile(rows[0]);
}

function todayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function getTodayDraw(
  userId: string
): Promise<TarotDrawRecord | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT * FROM tarot_draws
     WHERE user_id = $1 AND date = $2 AND spread = 'single'
     LIMIT 1`,
    [userId, todayKey()]
  );
  return rows[0] ? rowToDraw(rows[0]) : null;
}

export async function createDraw(input: {
  userId: string;
  spread: TarotDrawRecord["spread"];
  cardIds: number[];
  reversed: boolean[];
}): Promise<TarotDrawRecord> {
  const pool = getPool();
  const id = randomUUID();
  const { rows } = await pool.query(
    `INSERT INTO tarot_draws (id, user_id, date, spread, card_ids, reversed, note)
     VALUES ($1, $2, $3, $4, $5, $6, NULL) RETURNING *`,
    [id, input.userId, todayKey(), input.spread, input.cardIds, input.reversed]
  );
  return rowToDraw(rows[0]);
}

export async function setDrawNote(
  drawId: string,
  userId: string,
  note: string
): Promise<TarotDrawRecord | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `UPDATE tarot_draws SET note = $1
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [note, drawId, userId]
  );
  return rows[0] ? rowToDraw(rows[0]) : null;
}

export async function getStreak(userId: string): Promise<number> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT date FROM tarot_draws
     WHERE user_id = $1 AND spread = 'single'`,
    [userId]
  );
  const singleDrawDates = new Set(rows.map((r) => r.date as string));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(
      cursor.getDate()
    ).padStart(2, "0")}`;
    if (!singleDrawDates.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function listDraws(userId: string): Promise<TarotDrawRecord[]> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT * FROM tarot_draws WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(rowToDraw);
}

// ---------- Conteúdo gerado por IA (cache) ----------

export async function getAiContent(
  userId: string,
  kind: string,
  refKey: string
): Promise<string | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT content FROM ai_content WHERE user_id = $1 AND kind = $2 AND ref_key = $3`,
    [userId, kind, refKey]
  );
  return rows[0]?.content ?? null;
}

export async function saveAiContent(
  userId: string,
  kind: string,
  refKey: string,
  content: string
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO ai_content (id, user_id, kind, ref_key, content)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, kind, ref_key) DO UPDATE SET content = EXCLUDED.content`,
    [randomUUID(), userId, kind, refKey, content]
  );
}

// ---------- Chat sobre o mapa ----------

export interface ChatMessageRecord {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export async function listChatMessages(
  userId: string,
  limit = 30
): Promise<ChatMessageRecord[]> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT role, content, created_at FROM chat_messages
     WHERE user_id = $1 ORDER BY created_at ASC LIMIT $2`,
    [userId, limit]
  );
  return rows.map((r) => ({
    role: r.role as "user" | "assistant",
    content: r.content as string,
    createdAt: (r.created_at as Date).toISOString(),
  }));
}

export async function addChatMessage(
  userId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO chat_messages (id, user_id, role, content) VALUES ($1, $2, $3, $4)`,
    [randomUUID(), userId, role, content]
  );
}
