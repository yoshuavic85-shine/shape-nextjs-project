"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import {
  NotebookPen,
  ListChecks,
  Users,
  Copy,
  Loader2,
} from "lucide-react";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
}

interface Plan {
  id: string;
  title: string;
  description: string;
  status: "PLANNED" | "IN_PROGRESS" | "DONE" | "DEFERRED";
  dueDate: string | null;
  source: string;
  createdBy: { id: string; name: string };
}

interface Invite {
  id: string;
  token: string;
  raterName: string;
  raterRelation: string;
  submittedAt: string | null;
  expiresAt: string;
}

interface MentoringPanelProps {
  assessmentId: string;
  canMentor: boolean;
  isOwner: boolean;
  developmentPath?: string[];
}

const STATUS_LABEL: Record<Plan["status"], string> = {
  PLANNED: "Direncanakan",
  IN_PROGRESS: "Berjalan",
  DONE: "Selesai",
  DEFERRED: "Ditunda",
};

export function MentoringPanel({
  assessmentId,
  canMentor,
  isOwner,
  developmentPath = [],
}: MentoringPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [canWrite, setCanWrite] = useState(canMentor);
  const [noteDraft, setNoteDraft] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const [planDue, setPlanDue] = useState("");
  const [raterName, setRaterName] = useState("");
  const [raterRelation, setRaterRelation] = useState("rekan");
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const [n, p, o] = await Promise.all([
      fetch(`/api/assessment/${assessmentId}/notes`).then((r) => r.json()),
      fetch(`/api/assessment/${assessmentId}/plans`).then((r) => r.json()),
      fetch(`/api/assessment/${assessmentId}/observers`).then((r) => r.json()),
    ]);
    if (n.notes) {
      setNotes(n.notes);
      setCanWrite(Boolean(n.canWrite));
    }
    if (p.plans) setPlans(p.plans);
    if (o.invites) setInvites(o.invites);
  };

  useEffect(() => {
    setLoading(true);
    reload()
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  const addNote = async () => {
    const res = await fetch(`/api/assessment/${assessmentId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteDraft }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Gagal menyimpan catatan");
      return;
    }
    setNoteDraft("");
    await reload();
  };

  const addPlan = async (title: string, source = "manual") => {
    const res = await fetch(`/api/assessment/${assessmentId}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        source,
        dueDate: planDue || undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Gagal menyimpan rencana");
      return;
    }
    setPlanTitle("");
    setPlanDue("");
    await reload();
  };

  const setStatus = async (planId: string, status: Plan["status"]) => {
    await fetch(`/api/assessment/${assessmentId}/plans`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, status }),
    });
    await reload();
  };

  const inviteObserver = async () => {
    const res = await fetch(`/api/assessment/${assessmentId}/observers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raterName, raterRelation }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Gagal membuat undangan");
      return;
    }
    setRaterName("");
    await reload();
    const url = `${window.location.origin}/observe/${data.invite.token}`;
    await navigator.clipboard.writeText(url);
    setCopied(data.invite.token);
  };

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/observe/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(token);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            Eksperimen pelayanan / langkah hidup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ubah saran AI menjadi komitmen berbatas waktu, lalu tinjau bersama
            mentor. Wawasan tidak mengubah hidup sampai dicoba.
          </p>
          {plans.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Belum ada eksperimen yang dicatat.
            </p>
          )}
          <ul className="space-y-2">
            {plans.map((plan) => (
              <li
                key={plan.id}
                className="p-3 rounded-xl bg-background flex flex-col sm:flex-row sm:items-center gap-2 justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {plan.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {STATUS_LABEL[plan.status]}
                    {plan.dueDate
                      ? ` · target ${formatDate(plan.dueDate)}`
                      : ""}
                    {` · oleh ${plan.createdBy.name}`}
                  </p>
                </div>
                <select
                  className="text-xs rounded-lg bg-surface px-2 py-1"
                  value={plan.status}
                  onChange={(e) =>
                    setStatus(plan.id, e.target.value as Plan["status"])
                  }
                >
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
          {(isOwner || canMentor) && (
            <div className="space-y-2">
              <Input
                placeholder="Judul eksperimen (contoh: dampingi 1 anak muda 8 minggu)"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
              />
              <Input
                type="date"
                value={planDue}
                onChange={(e) => setPlanDue(e.target.value)}
              />
              <Button
                size="sm"
                onClick={() => addPlan(planTitle)}
                disabled={planTitle.trim().length < 3}
              >
                Tambah eksperimen
              </Button>
            </div>
          )}
          {developmentPath.length > 0 && (isOwner || canMentor) && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">
                Dari saran AI — jadikan eksperimen:
              </p>
              <div className="flex flex-col gap-2">
                {developmentPath.map((path) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => addPlan(path, "ai")}
                    className="text-left text-sm p-2 rounded-lg bg-muted/40 hover:bg-muted/70"
                  >
                    + {path}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Konfirmasi orang lain (2–3 pengamat)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Karunia dikonfirmasi oleh tubuh Kristus, bukan hanya persepsi diri.
            Undang orang yang mengenal Anda untuk menilai pola yang mereka lihat.
          </p>
          {invites.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-2 p-3 rounded-xl bg-background text-sm"
            >
              <div>
                <p className="font-medium">
                  {inv.raterName} · {inv.raterRelation}
                </p>
                <p className="text-xs text-muted-foreground">
                  {inv.submittedAt
                    ? `Sudah diisi ${formatDate(inv.submittedAt)}`
                    : `Menunggu · kedaluwarsa ${formatDate(inv.expiresAt)}`}
                </p>
              </div>
              {!inv.submittedAt && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => copyLink(inv.token)}
                >
                  <Copy className="w-3 h-3" />
                  {copied === inv.token ? "Tersalin" : "Salin tautan"}
                </Button>
              )}
            </div>
          ))}
          {(isOwner || canMentor) && (
            <div className="grid sm:grid-cols-3 gap-2 pt-2">
              <Input
                placeholder="Nama pengamat"
                value={raterName}
                onChange={(e) => setRaterName(e.target.value)}
              />
              <Input
                placeholder="Hubungan (pemimpin, teman, keluarga)"
                value={raterRelation}
                onChange={(e) => setRaterRelation(e.target.value)}
              />
              <Button onClick={inviteObserver} disabled={raterName.length < 2}>
                Buat tautan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NotebookPen className="w-5 h-5 text-accent" />
            Catatan mentor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Belum ada catatan pendampingan.
            </p>
          )}
          {notes.map((note) => (
            <div key={note.id} className="p-3 rounded-xl bg-background">
              <p className="text-sm text-foreground whitespace-pre-line">
                {note.content}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {note.author.name} · {formatDate(note.createdAt)}
              </p>
            </div>
          ))}
          {canWrite && (
            <div className="space-y-2">
              <Textarea
                placeholder="Catatan sesi, pertanyaan lanjutan, atau kesepakatan…"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
              />
              <Button
                size="sm"
                onClick={addNote}
                disabled={noteDraft.trim().length < 3}
              >
                Simpan catatan
              </Button>
            </div>
          )}
          {!canWrite && isOwner && (
            <p className="text-xs text-muted-foreground">
              Pemimpin gereja Anda dapat menambahkan catatan setelah membaca
              laporan ini bersama Anda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
