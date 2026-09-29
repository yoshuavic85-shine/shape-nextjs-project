"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { OBSERVER_LIKERT, type ObserverItem } from "@/lib/constants/observer-items";
import { Loader2 } from "lucide-react";

export default function ObservePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [raterName, setRaterName] = useState("");
  const [items, setItems] = useState<ObserverItem[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/observe/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Tautan tidak valid");
        setSubjectName(data.subjectName);
        setRaterName(data.raterName);
        setItems(data.items);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/observe/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratings, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal mengirim");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim");
    } finally {
      setSaving(false);
    }
  };

  const allFilled = items.every((i) => ratings[i.category] != null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Terima kasih</h1>
          <p className="text-muted-foreground">
            Penilaian Anda membantu {subjectName} dan mentornya membaca
            konfirmasi dari tubuh Kristus, bukan hanya persepsi diri.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">
          Konfirmasi SHAPE — {subjectName}
        </h1>
        <p className="text-muted-foreground mt-2 mb-6 leading-relaxed">
          Halo {raterName}. Berdasarkan apa yang Anda lihat dalam kehidupan
          orang ini, seberapa jelas pola berikut terlihat? Ini bukan tes
          psikologis. Jawab jujur dari pengamatan Anda.
        </p>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.category} className="p-4 rounded-2xl bg-surface">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className="text-sm text-foreground mb-3">{item.text}</p>
              <div className="flex flex-wrap gap-2">
                {OBSERVER_LIKERT.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setRatings((prev) => ({
                        ...prev,
                        [item.category]: opt.value,
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs ${
                      ratings[item.category] === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {opt.value}. {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">
            Catatan singkat (opsional)
          </p>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Apa yang Anda lihat paling menonjol pada orang ini?"
          />
        </div>
        <div className="mt-6">
          <Button onClick={submit} disabled={!allFilled || saving} size="lg">
            {saving && <Loader2 className="animate-spin" />}
            Kirim penilaian
          </Button>
        </div>
      </div>
    </div>
  );
}
