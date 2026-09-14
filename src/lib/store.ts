import { Pool } from "pg";

// Órbita usa Postgres como banco de dados (necessário para hospedagem
// serverless na Vercel: funções não mantêm arquivos locais entre
// requisições, então um JSON local não funcionaria em produção). O pool é
// reaproveitado entre invocações da função serverless via variável global,
// evitando abrir uma conexão nova a cada requisição.

declare global {
  // eslint-disable-next-line no-var
  var __orbitaPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não configurada. Defina a variável de ambiente apontando para o Postgres."
    );
  }
  const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString);
  return new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 5,
  });
}

export function getPool(): Pool {
  if (!global.__orbitaPool) {
    global.__orbitaPool = createPool();
  }
  return global.__orbitaPool;
}

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
`;

/** Cria as tabelas se ainda não existirem. Idempotente — seguro de chamar
 * toda vez que a aplicação sobe. */
export async function migrate(): Promise<void> {
  const pool = getPool();
  await pool.query(SCHEMA_SQL);
}
