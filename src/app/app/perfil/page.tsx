import { getCurrentUser } from "@/lib/auth";
import { getBirthProfile } from "@/lib/repo";
import { PerfilBirthEditor } from "@/components/PerfilBirthEditor";

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getBirthProfile(user.id);

  return (
    <div className="max-w-lg flex flex-col gap-10">
      <div>
        <p className="font-mono-label text-xs text-ink-dim mb-3">conta</p>
        <div className="rounded-xl border border-line bg-surface p-5 flex flex-col gap-1">
          <p className="font-semibold">{user.displayName}</p>
          <p className="text-sm text-ink-muted">{user.email}</p>
        </div>
      </div>

      <div>
        <p className="font-mono-label text-xs text-ink-dim mb-3">dados de nascimento</p>
        <PerfilBirthEditor
          initial={
            profile
              ? {
                  birthDate: profile.birthDate,
                  birthTime: profile.birthTime,
                  timeUnknown: profile.timeUnknown,
                  placeLabel: profile.placeLabel,
                  latitude: profile.latitude,
                  longitude: profile.longitude,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
