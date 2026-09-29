import { CATEGORY_LABELS } from "./category-labels";

export type ObserverSection = "gifts" | "heart" | "abilities";

export interface ObserverItem {
  section: ObserverSection;
  category: string;
  label: string;
  text: string;
}

const GIFT_ITEMS: Record<string, string> = {
  TEACHING:
    "Orang ini membantu orang lain memahami Firman atau suatu kebenaran dengan lebih jelas.",
  SERVING:
    "Orang ini secara alami melihat kebutuhan praktis dan menolong tanpa banyak disorot.",
  LEADERSHIP:
    "Orang ini menggerakkan orang lain menuju arah atau visi yang jelas.",
  GIVING:
    "Orang ini murah hati mendukung orang atau pekerjaan Tuhan dengan sumber dayanya.",
  MERCY:
    "Orang ini mudah hadir bagi yang menderita, kesepian, atau tersisih.",
  FAITH:
    "Orang ini menguatkan pengharapan orang lain kepada Tuhan di tengah ketidakpastian.",
  WISDOM:
    "Orang ini sering dimintai nasihat untuk keputusan hidup yang rumit.",
  KNOWLEDGE:
    "Orang ini menikmati mendalami Alkitab atau kebenaran secara mendalam dan tepat.",
  EXHORTATION:
    "Setelah berbicara dengan orang ini, orang lain sering merasa lebih termotivasi.",
  EVANGELISM:
    "Orang ini nyaman dan aktif berbagi iman dengan orang yang belum percaya.",
};

const HEART_ITEMS: Record<string, string> = {
  EDUCATION: "Orang ini tergerak menolong orang belajar dan bertumbuh.",
  SOCIAL_JUSTICE:
    "Orang ini tidak bisa diam melihat orang tertindas atau diperlakukan tidak adil.",
  ARTS: "Orang ini tergerak memakai seni atau kreativitas untuk menggerakkan hati orang.",
  HEALTH: "Orang ini peduli pada pemulihan fisik atau kesehatan orang lain.",
  FAMILY: "Orang ini punya beban menguatkan keluarga dan rumah tangga.",
  YOUTH: "Orang ini punya beban khusus bagi generasi muda.",
  MISSIONS: "Orang ini terdorong menjangkau orang dari konteks atau budaya lain.",
  COMMUNITY: "Orang ini membangun ruang di mana orang merasa diterima.",
  TECHNOLOGY:
    "Orang ini melihat teknologi sebagai alat untuk dampak pelayanan yang lebih luas.",
  ENVIRONMENT:
    "Orang ini peduli pada penatalayanan ciptaan dan lingkungan.",
};

const ABILITY_ITEMS: Record<string, string> = {
  COMMUNICATION: "Orang ini menyampaikan ide secara lisan dengan jelas.",
  ORGANIZATION: "Orang ini merapikan proses, jadwal, atau sumber daya dengan baik.",
  ANALYTICAL: "Orang ini memecahkan masalah kompleks secara logis.",
  CREATIVE: "Orang ini menghasilkan ide atau karya yang baru dan bermakna.",
  TECHNICAL: "Orang ini andal membantu hal teknis atau digital.",
  INTERPERSONAL: "Orang ini mudah membangun rapport dan membuat orang nyaman.",
  WRITING: "Tulisan orang ini membantu orang memahami suatu gagasan.",
  MUSICAL: "Orang ini berkontribusi nyata di bidang musik.",
  LEADERSHIP_ABILITY: "Orang ini mendelegasikan dan mengarahkan tim secara efektif.",
  TEACHING_ABILITY: "Orang ini sabar menjelaskan sampai orang lain mengerti.",
};

function toItems(
  section: ObserverSection,
  map: Record<string, string>,
): ObserverItem[] {
  return Object.entries(map).map(([category, text]) => ({
    section,
    category,
    label: CATEGORY_LABELS[category] || category,
    text,
  }));
}

export const OBSERVER_ITEMS: ObserverItem[] = [
  ...toItems("gifts", GIFT_ITEMS),
  ...toItems("heart", HEART_ITEMS),
  ...toItems("abilities", ABILITY_ITEMS),
];

export const OBSERVER_LIKERT = [
  { value: 1, label: "Sangat tidak terlihat" },
  { value: 2, label: "Kurang terlihat" },
  { value: 3, label: "Cukup terlihat" },
  { value: 4, label: "Jelas terlihat" },
  { value: 5, label: "Sangat jelas terlihat" },
];
