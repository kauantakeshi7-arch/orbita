import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

const NAV_ITEMS = [
  { href: "/app", label: "Início" },
  { href: "/app/mapa", label: "Mapa" },
  { href: "/app/tarot", label: "Tarot" },
  { href: "/app/diario", label: "Diário" },
  { href: "/app/perfil", label: "Perfil" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <Link href="/app" className="font-display font-bold text-lg shrink-0">
            Órbita
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-ink-muted hover:text-ink hover:bg-surface-2 rounded-full px-3 py-1.5 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-ink-dim hidden sm:inline">{user?.displayName}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-8">{children}</main>
    </div>
  );
}
