import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="max-w-5xl mx-auto w-full px-5 py-6 flex items-center justify-between">
        <span className="font-display font-bold text-lg tracking-tight">Órbita</span>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/entrar" className="text-ink-muted hover:text-ink transition-colors">
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-full bg-accent text-ground px-4 py-2 font-semibold hover:opacity-90 transition-opacity"
          >
            Criar conta
          </Link>
        </nav>
      </header>

      <section className="max-w-5xl mx-auto w-full px-5 pt-10 pb-16 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 min-w-0">
          <p className="font-mono-label text-xs text-ink-dim mb-4">
            mapa astral · tarot · horóscopo diário
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.08] mb-5">
            Seu mapa astral, sem o clichê místico.
          </h1>
          <p className="text-ink-muted text-lg max-w-[46ch] mb-8">
            Cálculo astronômico real, tarot todo dia e uma comunidade pra comparar
            mapas com amigos — de graça, sem paywall na primeira sessão.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/cadastro"
              className="rounded-full bg-accent text-ground px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
            >
              Gerar meu mapa grátis
            </Link>
            <Link href="/entrar" className="text-ink-muted hover:text-ink transition-colors text-sm">
              Já tenho conta →
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center w-full max-w-[360px]">
          <svg viewBox="0 0 320 320" className="w-full h-auto" role="img" aria-label="Roda de exemplo de um mapa astral">
            <circle cx="160" cy="160" r="148" fill="none" stroke="var(--line)" />
            <circle cx="160" cy="160" r="96" fill="none" stroke="var(--line)" />
            <circle cx="160" cy="160" r="60" fill="none" stroke="var(--line)" strokeWidth="0.6" />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              const x1 = 160 + 132 * Math.cos(a);
              const y1 = 160 + 132 * Math.sin(a);
              const x2 = 160 + 148 * Math.cos(a);
              const y2 = 160 + 148 * Math.sin(a);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--line)" />;
            })}
            {["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((g, i) => {
              const a = ((i * 30 + 15) * Math.PI) / 180;
              const x = 160 + 116 * Math.cos(a);
              const y = 160 + 116 * Math.sin(a);
              return (
                <text key={g} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="var(--ink-muted)">
                  {g}
                </text>
              );
            })}
          </svg>
        </div>
      </section>

      <section className="max-w-5xl mx-auto w-full px-5 py-14 border-t border-line grid grid-cols-1 md:grid-cols-3 gap-5">
        <FeatureCard title="Mapa preciso" desc="Sol, Lua, Ascendente, planetas e casas calculados de verdade, não texto genérico de revista." />
        <FeatureCard title="Tarot todo dia" desc="Uma tiragem gratuita por dia, com tiragem de 3 cartas liberada a qualquer hora." />
        <FeatureCard title="Diário astral" desc="Suas tiragens e seu mapa guardados numa linha do tempo pessoal, não somem no dia seguinte." />
      </section>

      <footer className="max-w-5xl mx-auto w-full px-5 py-8 text-xs text-ink-dim border-t border-line">
        Órbita — projeto em construção.
      </footer>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-ink-muted">{desc}</p>
    </div>
  );
}
