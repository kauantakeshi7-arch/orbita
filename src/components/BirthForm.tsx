"use client";

import { useEffect, useRef, useState } from "react";

export interface BirthFormValues {
  birthDate: string;
  birthTime: string;
  timeUnknown: boolean;
  placeLabel: string;
  latitude: number;
  longitude: number;
}

interface CityResult {
  label: string;
  latitude: number;
  longitude: number;
}

const inputClass =
  "w-full rounded-lg bg-surface-2 border border-line px-3 py-2.5 text-ink placeholder:text-ink-dim focus:outline-none focus:border-accent transition-colors";

export function BirthForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<BirthFormValues>;
  submitLabel: string;
  onSubmit: (values: BirthFormValues) => Promise<string | void>;
}) {
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(initial?.birthTime ?? "12:00");
  const [timeUnknown, setTimeUnknown] = useState(initial?.timeUnknown ?? false);
  const [cityQuery, setCityQuery] = useState(initial?.placeLabel ?? "");
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityResult | null>(
    initial?.placeLabel && initial?.latitude !== undefined && initial?.longitude !== undefined
      ? { label: initial.placeLabel, latitude: initial.latitude, longitude: initial.longitude }
      : null
  );
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selectedCity && cityQuery === selectedCity.label) {
      setCityResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (cityQuery.trim().length < 2) {
      setCityResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(cityQuery)}`);
        const data = await res.json();
        setCityResults(data.results ?? []);
      } catch {
        setCityResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityQuery]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!birthDate) {
      setError("Informe a data de nascimento.");
      return;
    }
    if (!selectedCity) {
      setError("Escolha a cidade de nascimento na lista.");
      return;
    }

    setSubmitting(true);
    try {
      const msg = await onSubmit({
        birthDate,
        birthTime: timeUnknown ? "12:00" : birthTime || "12:00",
        timeUnknown,
        placeLabel: selectedCity.label,
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude,
      });
      if (msg) setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-sm text-ink-muted mb-1.5" htmlFor="birthDate">
          Data de nascimento
        </label>
        <input
          id="birthDate"
          type="date"
          required
          className={inputClass}
          value={birthDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm text-ink-muted" htmlFor="birthTime">
            Hora de nascimento
          </label>
          <label className="flex items-center gap-1.5 text-xs text-ink-dim cursor-pointer">
            <input
              type="checkbox"
              checked={timeUnknown}
              onChange={(e) => setTimeUnknown(e.target.checked)}
              className="accent-accent"
            />
            não sei a hora
          </label>
        </div>
        <input
          id="birthTime"
          type="time"
          disabled={timeUnknown}
          className={`${inputClass} disabled:opacity-40`}
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
        />
        {timeUnknown && (
          <p className="text-xs text-ink-dim mt-1.5">
            Sem hora exata, calculamos ao meio-dia. Sol e Lua ficam certos; Ascendente e casas ficam aproximados.
          </p>
        )}
      </div>

      <div className="relative">
        <label className="block text-sm text-ink-muted mb-1.5" htmlFor="city">
          Cidade de nascimento
        </label>
        <input
          id="city"
          type="text"
          required
          autoComplete="off"
          placeholder="Digite o nome da cidade"
          className={inputClass}
          value={cityQuery}
          onChange={(e) => {
            setCityQuery(e.target.value);
            setSelectedCity(null);
          }}
        />
        {searching && <p className="text-xs text-ink-dim mt-1">buscando…</p>}
        {cityResults.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-line bg-surface shadow-lg overflow-hidden">
            {cityResults.map((c) => (
              <li key={`${c.label}-${c.latitude}-${c.longitude}`}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-surface-2 transition-colors"
                  onClick={() => {
                    setSelectedCity(c);
                    setCityQuery(c.label);
                    setCityResults([]);
                  }}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-accent text-ground px-6 py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Calculando…" : submitLabel}
      </button>
    </form>
  );
}
