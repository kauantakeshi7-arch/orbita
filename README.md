# Órbita

Mapa astral, tarot do dia e horóscopo personalizado — MVP das Fases 0 e 1 do
plano de produto, rodando localmente.

## Rodando pela primeira vez

Pré-requisitos: [Node.js](https://nodejs.org) 20+ e um Postgres (local ou o
mesmo banco de produção).

```bash
npm install
DATABASE_URL="postgres://..." npm run migrate   # cria as tabelas (1x)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Pronto — crie uma conta,
preencha data/hora/cidade de nascimento e o mapa já é calculado de verdade.

O `npm install` gera automaticamente um arquivo `.env.local` com uma chave de
sessão aleatória (`SESSION_SECRET`) na primeira vez que roda. Adicione nesse
mesmo arquivo a linha `DATABASE_URL=postgres://...` apontando pro banco que
quer usar localmente — pode ser o mesmo Postgres de produção (dá pra usar o
site publicado e o `localhost` ao mesmo tempo, os dados ficam sincronizados)
ou um Postgres local seu.

## Como os dados são guardados

Órbita usa Postgres como banco de dados — necessário pra hospedagem
serverless (Vercel não mantém arquivos locais entre requisições). O acesso a
dados fica isolado em `src/lib/store.ts` (conexão/pool) e `src/lib/repo.ts`
(consultas). `scripts/migrate.mjs` cria as tabelas (`users`,
`birth_profiles`, `tarot_draws`) — rode `npm run migrate` sempre que apontar
pra um banco novo.

## O que já funciona (Fases 0 + 1 do plano)

- Cadastro e login (sessão local, senha com hash bcrypt)
- Cálculo real de mapa astral (Sol, Lua, Ascendente, planetas, casas Placidus
  e aspectos maiores) via `circular-natal-horoscope-js`
- Busca de cidade de nascimento (geocodificação via API pública, precisa de
  internet)
- Tarot do dia (uma tiragem grátis por dia) + tiragem livre de 3 cartas
  (passado/presente/futuro), baralho completo de 78 cartas
- Horóscopo diário combinando o Sol da pessoa com o trânsito real da Lua do
  dia
- Diário astral com histórico de tiragens e anotações
- Sequência (streak) de dias seguidos tirando carta

## O que ainda falta (Fase 2 do plano — próxima etapa)

Amigos e comparação de mapas, feed social, selos/conquistas, alertas de
trânsito e clubes por afinidade — a camada social do plano. Também fica pra
essa etapa: trocar o armazenamento local por um banco hospedado quando formos
publicar o site de verdade.

## Comandos

```bash
npm run dev     # ambiente de desenvolvimento
npm run build   # build de produção
npm run start   # roda o build de produção
npm run lint    # checagem de lint
```

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · circular-natal-horoscope-js
