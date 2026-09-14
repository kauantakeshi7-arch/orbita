// Cria as tabelas do Órbita no Postgres apontado por DATABASE_URL.
// Uso: DATABASE_URL="postgres://..." node scripts/migrate.mjs
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Defina DATABASE_URL antes de rodar a migração.");
  process.exit(1);
}

const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString);
const pool = new pg.Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS birth_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  birth_date TEXT NOT NULL,
  birth_time TEXT NOT NULL,
  time_unknown BOOLEAN NOT NULL,
  place_label TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tarot_draws (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  spread TEXT NOT NULL,
  card_ids INTEGER[] NOT NULL,
  reversed BOOLEAN[] NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tarot_draws_user ON tarot_draws(user_id);
CREATE INDEX IF NOT EXISTS idx_tarot_draws_user_date_spread
  ON tarot_draws(user_id, date, spread);

CREATE TABLE IF NOT EXISTS ai_content (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  ref_key TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, kind, ref_key)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user
  ON chat_messages(user_id, created_at);
`;

try {
  await pool.query(SCHEMA_SQL);
  console.log("Migração aplicada com sucesso.");
} catch (err) {
  console.error("Falha na migração:", err);
  process.exit(1);
} finally {
  await pool.end();
}
