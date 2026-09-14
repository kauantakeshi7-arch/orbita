// Gera um .env.local com um SESSION_SECRET aleatório na primeira instalação.
// Rodado automaticamente pelo hook "postinstall" do package.json.
import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");

if (!existsSync(envPath)) {
  const secret = randomBytes(32).toString("hex");
  const content = `# Gerado automaticamente por scripts/setup-env.mjs\n# Não compartilhe este arquivo — ele assina as sessões de login.\nSESSION_SECRET=${secret}\n`;
  writeFileSync(envPath, content, "utf-8");
  console.log("[orbita] .env.local criado com um novo SESSION_SECRET.");
} else {
  console.log("[orbita] .env.local já existe — mantido sem alterações.");
}
