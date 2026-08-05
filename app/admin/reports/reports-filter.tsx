"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ReportsFilter({
  initialQ,
  initialStatus,
}: {
  initialQ: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);

  const apply = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <form
      className="flex flex-col sm:flex-row gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <Input
        placeholder="Cari nama atau email..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="sm:max-w-xs"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">Semua status</option>
        <option value="IN_PROGRESS">Berjalan</option>
        <option value="COMPLETED">Selesai</option>
        <option value="ANALYZED">Dianalisis</option>
      </select>
      <Button type="submit" variant="default">
        Terapkan
      </Button>
    </form>
  );
}
