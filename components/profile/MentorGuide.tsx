"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function MentorGuide() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Panduan membaca bersama mentee</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
        <p>
          Skor 1–5 adalah rata-rata jawaban orang ini, bukan ranking di gereja.
          Ranking “top” hanya berarti relatif lebih menonjol di dalam dirinya.
          Jika ada peringatan profil belum terdiferensiasi, jangan tetapkan
          peran — undang cerita dan eksperimen kecil.
        </p>
        <p>
          Spektrum kepribadian yang bertanda “sinyal campuran” berarti kedua
          kutub sama-sama kuat atau lemah. Tanyakan situasi: kapan ia memimpin,
          kapan ia mendukung.
        </p>
        <ol className="list-decimal list-inside space-y-1 text-foreground">
          <li>Baca cerita hidup sebelum menafsirkan radar.</li>
          <li>Tanyakan: “Apa yang terasa benar? Apa yang terasa berlebihan?”</li>
          <li>Pilih satu eksperimen 4–12 minggu, bukan lima pelayanan baru.</li>
          <li>Undang 2 orang yang mengenal mentee untuk konfirmasi.</li>
          <li>Jadwalkan tinjauan ulang sekitar 6 bulan kemudian.</li>
        </ol>
      </CardContent>
    </Card>
  );
}
