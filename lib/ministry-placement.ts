import { CATEGORY_LABELS } from "@/lib/constants/category-labels";

export interface MinistryProfile {
  id: string;
  name: string;
  gifts: Record<string, number>;
  heart: Record<string, number>;
  abilities: Record<string, number>;
  experience: Record<string, number>;
  personality: {
    introvertExtrovert: number;
    taskPeople: number;
    structuredFlexible: number;
    thinkerFeeler: number;
    leaderSupporter: number;
    ambiguousDimensions?: string[];
  } | null;
}

export interface PlacementCandidate {
  id: string;
  name: string;
  score: number;
  reason: string;
}

export interface PlacementRoleView {
  id: string;
  name: string;
  note?: string;
  people: PlacementCandidate[];
}

export interface PlacementDepartmentView {
  id: string;
  name: string;
  roles: PlacementRoleView[];
}

type Domain = "gifts" | "heart" | "abilities" | "experience";

interface SignalWeight {
  domain: Domain;
  key: string;
  weight: number;
}

interface PersonalityWeight {
  key:
    | "introvertExtrovert"
    | "taskPeople"
    | "structuredFlexible"
    | "thinkerFeeler"
    | "leaderSupporter";
  prefer: "high" | "low";
  weight: number;
}

interface Gate {
  domain: Domain;
  key: string;
  min: number;
}

interface MinistryRole {
  id: string;
  name: string;
  note?: string;
  signals: SignalWeight[];
  personality?: PersonalityWeight[];
  requiredAll?: Gate[];
  requiredAny?: Gate[];
}

interface MinistryDepartment {
  id: string;
  name: string;
  roles: MinistryRole[];
}

const DEPARTMENTS: MinistryDepartment[] = [
  {
    id: "musik",
    name: "Musik",
    roles: [
      {
        id: "wl",
        name: "WL",
        note: "Memimpin pujian. Konfirmasi kemampuan vokal dan memimpin lagu.",
        signals: [
          { domain: "abilities", key: "MUSICAL", weight: 3 },
          { domain: "gifts", key: "LEADERSHIP", weight: 2 },
          { domain: "abilities", key: "LEADERSHIP_ABILITY", weight: 1.5 },
          { domain: "heart", key: "ARTS", weight: 1 },
        ],
        personality: [
          { key: "introvertExtrovert", prefer: "high", weight: 1.2 },
          { key: "leaderSupporter", prefer: "high", weight: 1.2 },
        ],
        requiredAll: [{ domain: "abilities", key: "MUSICAL", min: 3.6 }],
      },
      {
        id: "singer",
        name: "Singer",
        note: "Konfirmasi kemampuan vokal.",
        signals: [
          { domain: "abilities", key: "MUSICAL", weight: 3 },
          { domain: "abilities", key: "COMMUNICATION", weight: 1.2 },
          { domain: "heart", key: "ARTS", weight: 1.2 },
        ],
        personality: [
          { key: "introvertExtrovert", prefer: "high", weight: 0.8 },
        ],
        requiredAll: [{ domain: "abilities", key: "MUSICAL", min: 3.6 }],
      },
      {
        id: "choir",
        name: "Choir",
        note: "Konfirmasi kemampuan vokal paduan.",
        signals: [
          { domain: "abilities", key: "MUSICAL", weight: 3 },
          { domain: "gifts", key: "SERVING", weight: 1.2 },
          { domain: "heart", key: "ARTS", weight: 1 },
          { domain: "heart", key: "COMMUNITY", weight: 1 },
        ],
        personality: [
          { key: "leaderSupporter", prefer: "low", weight: 1 },
        ],
        requiredAll: [{ domain: "abilities", key: "MUSICAL", min: 3.4 }],
      },
      {
        id: "instrument",
        name: "Pemain musik",
        note: "Keyboard, gitar, bass, saxophone, drum, dan perkusi. SHAPE hanya melihat kemampuan musik, bukan instrumen. Konfirmasi skill sebelum menempatkan.",
        signals: [
          { domain: "abilities", key: "MUSICAL", weight: 3 },
          { domain: "heart", key: "ARTS", weight: 1.5 },
          { domain: "abilities", key: "TECHNICAL", weight: 0.8 },
        ],
        requiredAll: [{ domain: "abilities", key: "MUSICAL", min: 3.7 }],
      },
      {
        id: "dancer",
        name: "Dancer",
        note: "Konfirmasi kemampuan gerak dan tari.",
        signals: [
          { domain: "abilities", key: "CREATIVE", weight: 2.2 },
          { domain: "heart", key: "ARTS", weight: 2 },
          { domain: "abilities", key: "MUSICAL", weight: 1 },
        ],
        personality: [
          { key: "introvertExtrovert", prefer: "high", weight: 1 },
          { key: "structuredFlexible", prefer: "low", weight: 0.6 },
        ],
        requiredAny: [
          { domain: "abilities", key: "CREATIVE", min: 3.6 },
          { domain: "heart", key: "ARTS", min: 3.6 },
        ],
      },
      {
        id: "sound",
        name: "Sound",
        note: "Konfirmasi skill mixer dan audio.",
        signals: [
          { domain: "abilities", key: "TECHNICAL", weight: 3 },
          { domain: "abilities", key: "ORGANIZATION", weight: 1 },
          { domain: "abilities", key: "MUSICAL", weight: 0.8 },
        ],
        personality: [
          { key: "structuredFlexible", prefer: "high", weight: 1 },
          { key: "taskPeople", prefer: "high", weight: 0.8 },
        ],
        requiredAll: [{ domain: "abilities", key: "TECHNICAL", min: 3.6 }],
      },
      {
        id: "lighting",
        name: "Lighting",
        note: "Konfirmasi skill lampu panggung.",
        signals: [
          { domain: "abilities", key: "TECHNICAL", weight: 2.4 },
          { domain: "abilities", key: "CREATIVE", weight: 1.6 },
          { domain: "heart", key: "ARTS", weight: 1 },
        ],
        personality: [
          { key: "structuredFlexible", prefer: "high", weight: 0.8 },
        ],
        requiredAll: [{ domain: "abilities", key: "TECHNICAL", min: 3.5 }],
      },
    ],
  },
  {
    id: "multimedia",
    name: "Multimedia",
    roles: [
      {
        id: "kameraman",
        name: "Kameraman",
        note: "Konfirmasi skill kamera.",
        signals: [
          { domain: "abilities", key: "TECHNICAL", weight: 2 },
          { domain: "abilities", key: "CREATIVE", weight: 1.8 },
          { domain: "heart", key: "ARTS", weight: 1.2 },
        ],
        personality: [
          { key: "structuredFlexible", prefer: "low", weight: 0.5 },
        ],
        requiredAny: [
          { domain: "abilities", key: "TECHNICAL", min: 3.5 },
          { domain: "abilities", key: "CREATIVE", min: 3.6 },
        ],
      },
      {
        id: "operator",
        name: "Operator",
        signals: [
          { domain: "abilities", key: "TECHNICAL", weight: 2.6 },
          { domain: "abilities", key: "ORGANIZATION", weight: 1.4 },
          { domain: "heart", key: "TECHNOLOGY", weight: 1.2 },
        ],
        personality: [
          { key: "structuredFlexible", prefer: "high", weight: 1 },
          { key: "taskPeople", prefer: "high", weight: 0.8 },
        ],
        requiredAll: [{ domain: "abilities", key: "TECHNICAL", min: 3.6 }],
      },
      {
        id: "switcher",
        name: "Switcher",
        note: "Keputusan cepat di ruang siaran. Konfirmasi skill switcher.",
        signals: [
          { domain: "abilities", key: "TECHNICAL", weight: 2.2 },
          { domain: "abilities", key: "ANALYTICAL", weight: 1.6 },
          { domain: "abilities", key: "ORGANIZATION", weight: 1 },
        ],
        personality: [
          { key: "taskPeople", prefer: "high", weight: 0.8 },
          { key: "thinkerFeeler", prefer: "high", weight: 0.6 },
        ],
        requiredAll: [{ domain: "abilities", key: "TECHNICAL", min: 3.5 }],
      },
      {
        id: "editor-video",
        name: "Editor video",
        note: "Konfirmasi skill editing.",
        signals: [
          { domain: "abilities", key: "CREATIVE", weight: 2 },
          { domain: "abilities", key: "TECHNICAL", weight: 1.8 },
          { domain: "heart", key: "ARTS", weight: 1.2 },
          { domain: "abilities", key: "ANALYTICAL", weight: 0.8 },
        ],
        requiredAny: [
          { domain: "abilities", key: "CREATIVE", min: 3.5 },
          { domain: "abilities", key: "TECHNICAL", min: 3.5 },
        ],
      },
      {
        id: "desain",
        name: "Desain grafis",
        note: "Konfirmasi skill desain.",
        signals: [
          { domain: "abilities", key: "CREATIVE", weight: 2.6 },
          { domain: "heart", key: "ARTS", weight: 2 },
          { domain: "abilities", key: "WRITING", weight: 0.6 },
        ],
        requiredAny: [
          { domain: "abilities", key: "CREATIVE", min: 3.6 },
          { domain: "heart", key: "ARTS", min: 3.7 },
        ],
      },
      {
        id: "host-multimedia",
        name: "Host",
        signals: [
          { domain: "abilities", key: "COMMUNICATION", weight: 2.6 },
          { domain: "abilities", key: "CREATIVE", weight: 1 },
          { domain: "heart", key: "ARTS", weight: 0.8 },
        ],
        personality: [
          { key: "introvertExtrovert", prefer: "high", weight: 1.2 },
        ],
        requiredAll: [
          { domain: "abilities", key: "COMMUNICATION", min: 3.6 },
        ],
      },
    ],
  },
  {
    id: "organizer",
    name: "Service Organizer",
    roles: [
      {
        id: "stage-manager",
        name: "Stage manajer",
        signals: [
          { domain: "abilities", key: "ORGANIZATION", weight: 2.4 },
          { domain: "gifts", key: "LEADERSHIP", weight: 1.8 },
          { domain: "abilities", key: "LEADERSHIP_ABILITY", weight: 1.4 },
        ],
        personality: [
          { key: "structuredFlexible", prefer: "high", weight: 1 },
          { key: "leaderSupporter", prefer: "high", weight: 1 },
          { key: "taskPeople", prefer: "high", weight: 0.6 },
        ],
        requiredAny: [
          { domain: "abilities", key: "ORGANIZATION", min: 3.6 },
          { domain: "gifts", key: "LEADERSHIP", min: 3.6 },
        ],
      },
      {
        id: "lo-multimedia",
        name: "LO Multimedia & Lighting",
        signals: [
          { domain: "abilities", key: "ORGANIZATION", weight: 2 },
          { domain: "abilities", key: "TECHNICAL", weight: 1.8 },
          { domain: "abilities", key: "INTERPERSONAL", weight: 1 },
        ],
        personality: [
          { key: "structuredFlexible", prefer: "high", weight: 0.8 },
        ],
        requiredAll: [{ domain: "abilities", key: "TECHNICAL", min: 3.4 }],
      },
      {
        id: "lo-pembicara",
        name: "LO Pembicara & Time Keeper",
        signals: [
          { domain: "abilities", key: "ORGANIZATION", weight: 2.4 },
          { domain: "abilities", key: "COMMUNICATION", weight: 1.4 },
          { domain: "gifts", key: "SERVING", weight: 1 },
        ],
        personality: [
          { key: "structuredFlexible", prefer: "high", weight: 1.2 },
          { key: "taskPeople", prefer: "high", weight: 0.6 },
        ],
        requiredAll: [{ domain: "abilities", key: "ORGANIZATION", min: 3.6 }],
      },
      {
        id: "koordinator-lapangan",
        name: "Koordinator lapangan / tim",
        signals: [
          { domain: "gifts", key: "LEADERSHIP", weight: 2.2 },
          { domain: "abilities", key: "ORGANIZATION", weight: 1.6 },
          { domain: "abilities", key: "LEADERSHIP_ABILITY", weight: 1.4 },
          { domain: "heart", key: "COMMUNITY", weight: 1 },
        ],
        personality: [
          { key: "leaderSupporter", prefer: "high", weight: 1 },
        ],
        requiredAny: [
          { domain: "gifts", key: "LEADERSHIP", min: 3.6 },
          { domain: "abilities", key: "LEADERSHIP_ABILITY", min: 3.6 },
        ],
      },
      {
        id: "host-ibadah",
        name: "Host Ibadah Raya",
        signals: [
          { domain: "abilities", key: "COMMUNICATION", weight: 2.6 },
          { domain: "gifts", key: "LEADERSHIP", weight: 1.2 },
          { domain: "gifts", key: "SERVING", weight: 1 },
        ],
        personality: [
          { key: "introvertExtrovert", prefer: "high", weight: 1.2 },
        ],
        requiredAll: [
          { domain: "abilities", key: "COMMUNICATION", min: 3.6 },
        ],
      },
    ],
  },
  {
    id: "diaken",
    name: "Diaken",
    roles: [
      {
        id: "usher",
        name: "Usher",
        signals: [
          { domain: "gifts", key: "SERVING", weight: 2.4 },
          { domain: "abilities", key: "INTERPERSONAL", weight: 1.8 },
          { domain: "heart", key: "COMMUNITY", weight: 1.2 },
        ],
        personality: [
          { key: "taskPeople", prefer: "low", weight: 1 },
          { key: "leaderSupporter", prefer: "low", weight: 0.6 },
        ],
        requiredAny: [
          { domain: "gifts", key: "SERVING", min: 3.6 },
          { domain: "abilities", key: "INTERPERSONAL", min: 3.6 },
        ],
      },
      {
        id: "kolektan",
        name: "Kolektan",
        signals: [
          { domain: "gifts", key: "SERVING", weight: 2 },
          { domain: "gifts", key: "GIVING", weight: 1.6 },
          { domain: "abilities", key: "ORGANIZATION", weight: 1 },
        ],
        personality: [
          { key: "structuredFlexible", prefer: "high", weight: 0.8 },
          { key: "leaderSupporter", prefer: "low", weight: 0.6 },
        ],
        requiredAny: [
          { domain: "gifts", key: "SERVING", min: 3.5 },
          { domain: "gifts", key: "GIVING", min: 3.5 },
        ],
      },
      {
        id: "hospitality",
        name: "Hospitality",
        signals: [
          { domain: "gifts", key: "MERCY", weight: 2 },
          { domain: "abilities", key: "INTERPERSONAL", weight: 2 },
          { domain: "gifts", key: "SERVING", weight: 1.2 },
          { domain: "heart", key: "COMMUNITY", weight: 1 },
        ],
        personality: [
          { key: "taskPeople", prefer: "low", weight: 1 },
          { key: "thinkerFeeler", prefer: "low", weight: 0.8 },
        ],
        requiredAny: [
          { domain: "gifts", key: "MERCY", min: 3.5 },
          { domain: "abilities", key: "INTERPERSONAL", min: 3.6 },
        ],
      },
    ],
  },
  {
    id: "pendoa",
    name: "Pendoa",
    roles: [
      {
        id: "pendoa",
        name: "Pendoa",
        signals: [
          { domain: "gifts", key: "FAITH", weight: 2.8 },
          { domain: "experience", key: "SPIRITUAL_EXP", weight: 2 },
          { domain: "gifts", key: "MERCY", weight: 1 },
          { domain: "gifts", key: "EXHORTATION", weight: 0.8 },
        ],
        requiredAny: [
          { domain: "gifts", key: "FAITH", min: 3.7 },
          { domain: "experience", key: "SPIRITUAL_EXP", min: 3.7 },
        ],
      },
    ],
  },
  {
    id: "kids",
    name: "Kids",
    roles: [
      {
        id: "kids-keeper",
        name: "Pendamping / Keeper",
        signals: [
          { domain: "gifts", key: "MERCY", weight: 1.6 },
          { domain: "abilities", key: "INTERPERSONAL", weight: 1.6 },
          { domain: "heart", key: "YOUTH", weight: 2.2 },
          { domain: "gifts", key: "SERVING", weight: 1 },
        ],
        personality: [{ key: "taskPeople", prefer: "low", weight: 0.8 }],
        requiredAll: [{ domain: "heart", key: "YOUTH", min: 3.5 }],
      },
      {
        id: "kids-story",
        name: "Pengkhotbah / Story teller",
        signals: [
          { domain: "gifts", key: "TEACHING", weight: 2 },
          { domain: "abilities", key: "COMMUNICATION", weight: 1.6 },
          { domain: "abilities", key: "TEACHING_ABILITY", weight: 1.4 },
          { domain: "heart", key: "YOUTH", weight: 1.8 },
          { domain: "heart", key: "EDUCATION", weight: 1 },
          { domain: "abilities", key: "CREATIVE", weight: 0.8 },
        ],
        requiredAll: [{ domain: "heart", key: "YOUTH", min: 3.4 }],
      },
      {
        id: "kids-creative",
        name: "Creative team / Activity leader",
        signals: [
          { domain: "abilities", key: "CREATIVE", weight: 2 },
          { domain: "heart", key: "YOUTH", weight: 2 },
          { domain: "abilities", key: "TEACHING_ABILITY", weight: 1 },
        ],
        personality: [
          { key: "structuredFlexible", prefer: "low", weight: 0.6 },
        ],
        requiredAll: [
          { domain: "heart", key: "YOUTH", min: 3.4 },
          { domain: "abilities", key: "CREATIVE", min: 3.4 },
        ],
      },
      {
        id: "wl-kids",
        name: "WL Kids",
        note: "Konfirmasi kemampuan memimpin pujian anak.",
        signals: [
          { domain: "abilities", key: "MUSICAL", weight: 2.4 },
          { domain: "heart", key: "YOUTH", weight: 2 },
          { domain: "gifts", key: "LEADERSHIP", weight: 1 },
        ],
        personality: [
          { key: "introvertExtrovert", prefer: "high", weight: 0.8 },
        ],
        requiredAll: [
          { domain: "abilities", key: "MUSICAL", min: 3.5 },
          { domain: "heart", key: "YOUTH", min: 3.4 },
        ],
      },
      {
        id: "operator-kids",
        name: "Operator",
        signals: [
          { domain: "abilities", key: "TECHNICAL", weight: 2.2 },
          { domain: "heart", key: "YOUTH", weight: 1.8 },
          { domain: "abilities", key: "ORGANIZATION", weight: 0.8 },
        ],
        requiredAll: [
          { domain: "abilities", key: "TECHNICAL", min: 3.5 },
          { domain: "heart", key: "YOUTH", min: 3.3 },
        ],
      },
    ],
  },
  {
    id: "production",
    name: "Production House",
    roles: [
      {
        id: "director",
        name: "Director",
        signals: [
          { domain: "gifts", key: "LEADERSHIP", weight: 2 },
          { domain: "abilities", key: "CREATIVE", weight: 1.8 },
          { domain: "abilities", key: "LEADERSHIP_ABILITY", weight: 1.4 },
          { domain: "heart", key: "ARTS", weight: 1.2 },
          { domain: "abilities", key: "ORGANIZATION", weight: 1 },
        ],
        personality: [{ key: "leaderSupporter", prefer: "high", weight: 1 }],
        requiredAny: [
          { domain: "gifts", key: "LEADERSHIP", min: 3.6 },
          { domain: "abilities", key: "LEADERSHIP_ABILITY", min: 3.6 },
        ],
      },
      {
        id: "copywriter",
        name: "Copy writer",
        signals: [
          { domain: "abilities", key: "WRITING", weight: 3 },
          { domain: "abilities", key: "CREATIVE", weight: 1.4 },
          { domain: "heart", key: "ARTS", weight: 1 },
        ],
        personality: [{ key: "thinkerFeeler", prefer: "high", weight: 0.6 }],
        requiredAll: [{ domain: "abilities", key: "WRITING", min: 3.6 }],
      },
      {
        id: "talent",
        name: "Talent",
        note: "Konfirmasi kenyamanan di depan kamera.",
        signals: [
          { domain: "abilities", key: "COMMUNICATION", weight: 2.4 },
          { domain: "abilities", key: "CREATIVE", weight: 1.2 },
          { domain: "heart", key: "ARTS", weight: 1.2 },
        ],
        personality: [
          { key: "introvertExtrovert", prefer: "high", weight: 1.2 },
        ],
        requiredAll: [
          { domain: "abilities", key: "COMMUNICATION", min: 3.6 },
        ],
      },
      {
        id: "videographer",
        name: "Videographer",
        note: "Konfirmasi skill kamera.",
        signals: [
          { domain: "abilities", key: "TECHNICAL", weight: 2 },
          { domain: "abilities", key: "CREATIVE", weight: 1.6 },
          { domain: "heart", key: "ARTS", weight: 1.4 },
        ],
        requiredAny: [
          { domain: "abilities", key: "TECHNICAL", min: 3.5 },
          { domain: "abilities", key: "CREATIVE", min: 3.6 },
        ],
      },
      {
        id: "editor-ph",
        name: "Editor",
        note: "Konfirmasi skill editing.",
        signals: [
          { domain: "abilities", key: "CREATIVE", weight: 1.8 },
          { domain: "abilities", key: "TECHNICAL", weight: 1.8 },
          { domain: "abilities", key: "ANALYTICAL", weight: 1.2 },
          { domain: "heart", key: "ARTS", weight: 1 },
        ],
        requiredAny: [
          { domain: "abilities", key: "TECHNICAL", min: 3.5 },
          { domain: "abilities", key: "CREATIVE", min: 3.5 },
        ],
      },
    ],
  },
  {
    id: "generasi",
    name: "Generasi",
    roles: [
      {
        id: "generasi-muda",
        name: "Teens, pemuda, dan dewasa muda",
        note: "Usia tidak ada di profil SHAPE. Ini minat pada generasi muda, bukan golongan umur.",
        signals: [
          { domain: "heart", key: "YOUTH", weight: 3 },
          { domain: "gifts", key: "TEACHING", weight: 1.2 },
          { domain: "gifts", key: "EXHORTATION", weight: 1.2 },
          { domain: "abilities", key: "INTERPERSONAL", weight: 1 },
          { domain: "gifts", key: "LEADERSHIP", weight: 0.8 },
        ],
        requiredAll: [{ domain: "heart", key: "YOUTH", min: 3.7 }],
      },
    ],
  },
  {
    id: "jemaat",
    name: "Jemaat",
    roles: [
      {
        id: "keluarga",
        name: "Keluarga",
        signals: [
          { domain: "heart", key: "FAMILY", weight: 3 },
          { domain: "gifts", key: "MERCY", weight: 1.2 },
          { domain: "abilities", key: "INTERPERSONAL", weight: 1.2 },
        ],
        personality: [{ key: "taskPeople", prefer: "low", weight: 0.6 }],
        requiredAll: [{ domain: "heart", key: "FAMILY", min: 3.7 }],
      },
      {
        id: "komunitas",
        name: "Komunitas",
        note: "Termasuk komunitas senior. Usia tidak diukur.",
        signals: [
          { domain: "heart", key: "COMMUNITY", weight: 2.6 },
          { domain: "gifts", key: "SERVING", weight: 1.2 },
          { domain: "abilities", key: "INTERPERSONAL", weight: 1.2 },
          { domain: "gifts", key: "MERCY", weight: 1 },
        ],
        requiredAll: [{ domain: "heart", key: "COMMUNITY", min: 3.7 }],
      },
    ],
  },
  {
    id: "pastoral",
    name: "Pastoral",
    roles: [
      {
        id: "konseling",
        name: "Konseling",
        note: "Bukan lisensi konselor. Ini kecocokan pendampingan, tetap perlu pembinaan dan batas etika.",
        signals: [
          { domain: "gifts", key: "MERCY", weight: 1.8 },
          { domain: "gifts", key: "EXHORTATION", weight: 1.8 },
          { domain: "gifts", key: "WISDOM", weight: 1.8 },
          { domain: "abilities", key: "INTERPERSONAL", weight: 1.4 },
          { domain: "experience", key: "PAINFUL_EXP", weight: 1.2 },
        ],
        personality: [{ key: "thinkerFeeler", prefer: "low", weight: 0.8 }],
        requiredAny: [
          { domain: "gifts", key: "MERCY", min: 3.6 },
          { domain: "gifts", key: "EXHORTATION", min: 3.6 },
          { domain: "gifts", key: "WISDOM", min: 3.6 },
        ],
      },
      {
        id: "pengajaran",
        name: "Pengajaran",
        signals: [
          { domain: "gifts", key: "TEACHING", weight: 2.6 },
          { domain: "gifts", key: "KNOWLEDGE", weight: 1.4 },
          { domain: "abilities", key: "TEACHING_ABILITY", weight: 1.8 },
          { domain: "heart", key: "EDUCATION", weight: 1.4 },
        ],
        requiredAny: [
          { domain: "gifts", key: "TEACHING", min: 3.6 },
          { domain: "abilities", key: "TEACHING_ABILITY", min: 3.6 },
        ],
      },
      {
        id: "penginjilan",
        name: "Penginjilan dan misi",
        signals: [
          { domain: "gifts", key: "EVANGELISM", weight: 2.6 },
          { domain: "heart", key: "MISSIONS", weight: 2 },
          { domain: "gifts", key: "FAITH", weight: 1 },
        ],
        personality: [
          { key: "introvertExtrovert", prefer: "high", weight: 0.6 },
        ],
        requiredAny: [
          { domain: "gifts", key: "EVANGELISM", min: 3.6 },
          { domain: "heart", key: "MISSIONS", min: 3.7 },
        ],
      },
    ],
  },
];

const PERSONALITY_REASON: Record<
  PersonalityWeight["key"],
  { high: string; low: string }
> = {
  introvertExtrovert: { high: "Extrovert", low: "Introvert" },
  taskPeople: { high: "Berorientasi tugas", low: "Berorientasi relasi" },
  structuredFlexible: { high: "Terstruktur", low: "Fleksibel" },
  thinkerFeeler: { high: "Pemikir", low: "Perasa" },
  leaderSupporter: { high: "Cenderung memimpin", low: "Cenderung mendukung" },
};

const TOP_ROLES = 3;
const MIN_SCORE = 62;

function domainValue(profile: MinistryProfile, signal: SignalWeight): number {
  return profile[signal.domain][signal.key] ?? 0;
}

function norm(raw: number): number {
  if (!raw) return 0;
  return Math.min(1, Math.max(0, (raw - 1) / 4));
}

function passesGate(profile: MinistryProfile, gate: Gate): boolean {
  return (profile[gate.domain][gate.key] ?? 0) >= gate.min;
}

function personalityFit(
  profile: MinistryProfile,
  weight: PersonalityWeight,
): number | null {
  const personality = profile.personality;
  if (!personality) return null;
  if (personality.ambiguousDimensions?.includes(weight.key)) return null;
  const value = personality[weight.key];
  if (typeof value !== "number") return null;
  return weight.prefer === "high" ? value : 1 - value;
}

function scoreRole(
  profile: MinistryProfile,
  role: MinistryRole,
): { score: number; reason: string } | null {
  if (role.requiredAll?.some((gate) => !passesGate(profile, gate))) return null;
  if (role.requiredAny && !role.requiredAny.some((gate) => passesGate(profile, gate))) {
    return null;
  }

  let weighted = 0;
  let total = 0;
  const reasons: { label: string; value: number }[] = [];

  for (const signal of role.signals) {
    const raw = domainValue(profile, signal);
    const fit = norm(raw);
    weighted += signal.weight * fit;
    total += signal.weight;
    if (raw >= 3.5) {
      reasons.push({
        label: CATEGORY_LABELS[signal.key] ?? signal.key,
        value: signal.weight * fit,
      });
    }
  }

  for (const trait of role.personality ?? []) {
    const fit = personalityFit(profile, trait);
    if (fit == null) continue;
    weighted += trait.weight * fit;
    total += trait.weight;
    if (fit >= 0.62) {
      reasons.push({
        label: PERSONALITY_REASON[trait.key][trait.prefer],
        value: trait.weight * fit,
      });
    }
  }

  if (total === 0) return null;
  const score = Math.round((weighted / total) * 100);
  if (score < MIN_SCORE) return null;

  const reason = reasons
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((item) => item.label)
    .join(", ");

  return { score, reason: reason || "Kecocokan profil" };
}

export function placeInMinistries(
  profiles: MinistryProfile[],
): PlacementDepartmentView[] {
  const chosen = new Map<string, Map<string, PlacementCandidate>>();

  for (const profile of profiles) {
    const fits: {
      roleId: string;
      candidate: PlacementCandidate;
    }[] = [];

    for (const department of DEPARTMENTS) {
      for (const role of department.roles) {
        const scored = scoreRole(profile, role);
        if (!scored) continue;
        fits.push({
          roleId: role.id,
          candidate: {
            id: profile.id,
            name: profile.name,
            score: scored.score,
            reason: scored.reason,
          },
        });
      }
    }

    fits
      .sort((a, b) => b.candidate.score - a.candidate.score)
      .slice(0, TOP_ROLES)
      .forEach((fit) => {
        const bucket = chosen.get(fit.roleId) ?? new Map();
        const existing = bucket.get(profile.id);
        if (!existing || existing.score < fit.candidate.score) {
          bucket.set(profile.id, fit.candidate);
        }
        chosen.set(fit.roleId, bucket);
      });
  }

  return DEPARTMENTS.map((department) => ({
    id: department.id,
    name: department.name,
    roles: department.roles.map((role) => ({
      id: role.id,
      name: role.name,
      note: role.note,
      people: [...(chosen.get(role.id)?.values() ?? [])].sort(
        (a, b) => b.score - a.score || a.name.localeCompare(b.name, "id"),
      ),
    })),
  }));
}

export function readSectionScores(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  const block = value as {
    rawMeans?: Record<string, number>;
    scores?: Record<string, number>;
    top?: Array<{ category?: string; score?: number }>;
  };
  const source = block.rawMeans ?? block.scores;
  if (source && typeof source === "object") {
    const scores: Record<string, number> = {};
    for (const [key, score] of Object.entries(source)) {
      if (typeof score === "number") scores[key] = score;
    }
    if (Object.keys(scores).length > 0) return scores;
  }
  const fromTop: Record<string, number> = {};
  for (const item of block.top ?? []) {
    if (item?.category && typeof item.score === "number") {
      fromTop[item.category] = item.score;
    }
  }
  return fromTop;
}

export function readPersonality(
  value: unknown,
): MinistryProfile["personality"] {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const keys = [
    "introvertExtrovert",
    "taskPeople",
    "structuredFlexible",
    "thinkerFeeler",
    "leaderSupporter",
  ] as const;
  if (!keys.every((key) => typeof raw[key] === "number")) return null;
  const ambiguous = Array.isArray(raw.ambiguousDimensions)
    ? raw.ambiguousDimensions.filter((item): item is string => typeof item === "string")
    : [];
  return {
    introvertExtrovert: raw.introvertExtrovert as number,
    taskPeople: raw.taskPeople as number,
    structuredFlexible: raw.structuredFlexible as number,
    thinkerFeeler: raw.thinkerFeeler as number,
    leaderSupporter: raw.leaderSupporter as number,
    ambiguousDimensions: ambiguous,
  };
}
