import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Heart,
  Zap,
  User,
  BookOpen,
  ArrowRight,
  Church,
} from "lucide-react";

const SHAPE_ITEMS = [
  {
    letter: "S",
    title: "Spiritual Gifts",
    desc: "Karunia rohani yang Tuhan berikan kepada Anda untuk melayani tubuh Kristus.",
    icon: Sparkles,
    color: "#8B6F47",
  },
  {
    letter: "H",
    title: "Heart",
    desc: "Passion dan beban hati yang menggerakkan Anda untuk bertindak.",
    icon: Heart,
    color: "#C4956A",
  },
  {
    letter: "A",
    title: "Abilities",
    desc: "Kemampuan alami dan yang dipelajari yang memperlengkapi Anda.",
    icon: Zap,
    color: "#6B8E5A",
  },
  {
    letter: "P",
    title: "Personality",
    desc: "Cara unik Anda berinteraksi dan merespons dunia di sekitar Anda.",
    icon: User,
    color: "#8B6F47",
  },
  {
    letter: "E",
    title: "Experience",
    desc: "Pengalaman hidup yang membentuk perspektif dan empati Anda.",
    icon: BookOpen,
    color: "#C4956A",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md shadow-[0_4px_12px_var(--shadow-dark)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/shapeLogo2.png"
              alt="SHAPE Compass"
              width={104}
              height={28}
              className="object-contain h-7 w-auto"
              priority
            />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="neo-button px-6 py-2 text-sm font-medium text-primary border-2 border-primary bg-transparent hover:bg-primary/10 rounded-xl transition-colors"
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="neo-card max-w-3xl mx-auto">
          <div className="mx-auto mb-6 flex justify-center">
            <Image
              src="/shapeLogo1.png"
              alt="SHAPE Compass"
              width={64}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Temukan Desain Unik Anda
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            SHAPE Compass membantu Anda memahami bagaimana Tuhan merancang Anda
            secara unik melalui karunia rohani, passion, kemampuan, kepribadian,
            dan pengalaman hidup Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="neo-button inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-primary text-primary bg-transparent hover:bg-primary/10 rounded-xl text-base font-semibold transition-colors"
            >
              Mulai Assessment
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register?role=leader"
              className="neo-button inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-secondary text-secondary bg-transparent hover:bg-secondary/10 rounded-xl text-base font-semibold transition-colors"
            >
              <Church className="w-5 h-5" />
              Untuk Gereja
            </Link>
          </div>
        </div>
      </section>

      {/* SHAPE Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-2xl font-bold text-foreground text-center mb-12">
          Apa itu SHAPE?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {SHAPE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.letter} className="neo-card text-center">
                <div
                  className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon className="w-7 h-7" style={{ color: item.color }} />
                </div>
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: item.color }}
                >
                  {item.letter}
                </div>
                <h4 className="font-semibold text-foreground mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-2xl font-bold text-foreground text-center mb-12">
          Bagaimana Cara Kerjanya?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "1",
              title: "Jawab Assessment",
              desc: "Jawab 90 pertanyaan yang mencakup 5 dimensi SHAPE. Setiap pertanyaan dirancang untuk membantu Anda merefleksikan diri.",
            },
            {
              step: "2",
              title: "AI Menganalisis",
              desc: "AI kami menganalisis pola dari jawaban Anda dan menghubungkan kelima dimensi SHAPE menjadi gambaran yang utuh.",
            },
            {
              step: "3",
              title: "Terima Laporan",
              desc: "Dapatkan laporan SHAPE Profile lengkap dengan insight reflektif dan rekomendasi arah pelayanan.",
            },
          ].map((item) => (
            <div key={item.step} className="neo-card text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-bold">
                {item.step}
              </div>
              <h4 className="font-semibold text-foreground mb-2">
                {item.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface shadow-[0_-4px_12px_var(--shadow-dark)]">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image
              src="/shapeLogo2.png"
              alt="SHAPE Compass"
              width={80}
              height={22}
              className="object-contain h-[22px] w-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Membantu umat Kristen memahami desain unik mereka untuk pelayanan
            yang bermakna.
          </p>
        </div>
      </footer>
    </div>
  );
}
