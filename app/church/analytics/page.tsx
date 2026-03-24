"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3, Star, AlertTriangle } from "lucide-react";

interface Distribution {
  [key: string]: number;
}

interface AnalyticsData {
  giftDistribution: Distribution;
  abilityDistribution: Distribution;
  heartDistribution: Distribution;
  potentialLeaders: {
    id: string;
    name: string;
    topGifts: string[];
    leadershipScore: number;
  }[];
  totalMembers: number;
  totalProfiles: number;
}

export default function ChurchAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/church/analytics")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error);
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const renderDistribution = (
    dist: Distribution,
    color: string,
    title: string,
  ) => {
    const sorted = Object.entries(dist).sort(([, a], [, b]) => b - a);
    const max = sorted[0]?.[1] || 1;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.map(([label, count]) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">{label}</span>
                <span className="text-muted-foreground">{count} orang</span>
              </div>
              <div className="w-full h-3 rounded-full neo-inset overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(count / max) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Belum ada data
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analitik Gereja</h1>
        <p className="text-muted-foreground mt-1">
          {data.totalProfiles} dari {data.totalMembers} anggota memiliki profil
          SHAPE
        </p>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {renderDistribution(
          data.giftDistribution,
          "#8B6F47",
          "Distribusi Karunia Rohani",
        )}
        {renderDistribution(
          data.abilityDistribution,
          "#6B8E5A",
          "Distribusi Kemampuan",
        )}
      </div>

      {renderDistribution(
        data.heartDistribution,
        "#C4956A",
        "Distribusi Passion / Heart",
      )}

      {/* Potential Leaders */}
      {data.potentialLeaders.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              Potensi Pemimpin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.potentialLeaders.map((leader) => (
                <div
                  key={leader.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-background"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {leader.name}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {(leader.topGifts ?? []).map((g) => (
                        <span
                          key={g}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      Skor: {(leader.leadershipScore ?? 0).toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ministry Gap Warning */}
      {data.totalProfiles > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              Catatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Analitik ini didasarkan pada profil yang telah diselesaikan.
              Dorong seluruh anggota untuk menyelesaikan assessment SHAPE agar
              gambaran yang lebih akurat dapat diperoleh untuk perencanaan
              pelayanan.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
