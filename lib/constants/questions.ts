export type ShapeSectionKey =
  | "SPIRITUAL_GIFTS"
  | "HEART"
  | "ABILITIES"
  | "PERSONALITY"
  | "EXPERIENCE";

export interface QuestionDefinition {
  section: ShapeSectionKey;
  category: string;
  text: string;
  orderIndex: number;
  reverseKeyed: boolean;
  isAttentionCheck: boolean;
}

interface RawItem {
  text: string;
  reverseKeyed?: boolean;
}

/**
 * Round-robin interleave items across categories so consecutive questions
 * rarely share the same construct (reduces response-set inflation).
 */
function interleaveSection(
  section: ShapeSectionKey,
  byCategory: Record<string, RawItem[]>,
  attention?: { text: string; expectedValue?: number },
): QuestionDefinition[] {
  const categories = Object.keys(byCategory);
  const maxLen = Math.max(...categories.map((c) => byCategory[c].length));
  const items: Omit<QuestionDefinition, "orderIndex">[] = [];

  for (let i = 0; i < maxLen; i++) {
    for (const cat of categories) {
      const item = byCategory[cat][i];
      if (!item) continue;
      items.push({
        section,
        category: cat,
        text: item.text,
        reverseKeyed: Boolean(item.reverseKeyed),
        isAttentionCheck: false,
      });
    }
  }

  if (attention) {
    const mid = Math.floor(items.length / 2);
    items.splice(mid, 0, {
      section,
      category: "ATTENTION",
      text: attention.text,
      reverseKeyed: false,
      isAttentionCheck: true,
    });
  }

  return items.map((q, idx) => ({ ...q, orderIndex: idx + 1 }));
}

const ATTENTION_SG =
  "Untuk memastikan Anda membaca dengan saksama, pilih angka 2 pada pertanyaan ini.";
const ATTENTION_HEART =
  "Pemeriksaan perhatian: silakan pilih angka 4 pada pertanyaan ini.";
const ATTENTION_ABILITIES =
  "Ini pemeriksaan kualitas jawaban — pilih angka 1 pada pertanyaan ini.";
const ATTENTION_PERSONALITY =
  "Agar hasil akurat, pilih angka 3 (Netral) pada pertanyaan ini.";

// ==========================================
// SPIRITUAL GIFTS — karunia = dampak rohani / pola pelayanan
// (dibedakan dari ability teknis & preferensi kepribadian)
// ==========================================
const SPIRITUAL_GIFTS: Record<string, RawItem[]> = {
  TEACHING: [
    {
      text: "Ketika saya menjelaskan Firman, orang sering berkata pemahaman mereka menjadi lebih jelas.",
    },
    {
      text: "Saya terdorong menyiapkan pengajaran agar orang lain bertumbuh rohani, bukan hanya menambah pengetahuan.",
    },
    {
      text: "Saya jarang merasa tergerak untuk menjelaskan kebenaran Alkitab kepada orang lain.",
      reverseKeyed: true,
    },
    {
      text: "Saya melihat buah nyata ketika orang menerapkan apa yang saya ajarkan dari Firman.",
    },
  ],
  SERVING: [
    {
      text: "Saya secara alami melihat kebutuhan praktis di sekitar saya dan ingin memenuhinya.",
    },
    {
      text: "Melayani di belakang layar memberi saya sukacita yang tulus.",
    },
    {
      text: "Saya cenderung menghindari tugas praktis yang tidak terlihat orang lain.",
      reverseKeyed: true,
    },
    {
      text: "Orang sering mengandalkan saya untuk menyelesaikan kebutuhan operasional pelayanan.",
    },
  ],
  LEADERSHIP: [
    {
      text: "Saya dapat menggerakkan orang menuju visi rohani yang jelas.",
    },
    {
      text: "Dalam kelompok, orang naturally menoleh kepada saya untuk arah dan keputusan.",
    },
    {
      text: "Saya merasa tidak nyaman ketika diminta memimpin arah sebuah kelompok.",
      reverseKeyed: true,
    },
    {
      text: "Saya membantu orang lain menemukan peran mereka dalam sebuah visi bersama.",
    },
  ],
  GIVING: [
    {
      text: "Saya merasa sukacita besar ketika dapat memberi secara murah hati untuk pekerjaan Tuhan.",
    },
    {
      text: "Saya rela menyesuaikan gaya hidup agar bisa memberi lebih untuk kebutuhan orang lain.",
    },
    {
      text: "Saya jarang tergerak untuk memberi secara finansial bagi pelayanan.",
      reverseKeyed: true,
    },
    {
      text: "Saya aktif mencari kesempatan untuk mendukung orang atau misi yang membutuhkan.",
    },
  ],
  MERCY: [
    {
      text: "Hati saya cepat tergerak melihat orang yang menderita atau tersisih.",
    },
    {
      text: "Saya mudah hadir bagi orang yang kesepian atau terluka emosional.",
    },
    {
      text: "Saya cenderung menjauh ketika berhadapan dengan penderitaan orang lain.",
      reverseKeyed: true,
    },
    {
      text: "Orang yang sedang sakit atau berduka sering merasa terbantu oleh kehadiran saya.",
    },
  ],
  FAITH: [
    {
      text: "Saya percaya Tuhan mampu melakukan hal besar bahkan ketika situasi tampak mustahil.",
    },
    {
      text: "Di tengah ketidakpastian, saya cenderung menguatkan orang lain untuk tetap berharap pada Tuhan.",
    },
    {
      text: "Saya cepat goyah dan kehilangan pengharapan ketika rencana tidak berjalan.",
      reverseKeyed: true,
    },
    {
      text: "Doa dan keyakinan saya sering menular dan menguatkan iman orang di sekitar saya.",
    },
  ],
  WISDOM: [
    {
      text: "Orang sering meminta nasihat saya untuk keputusan hidup yang rumit.",
    },
    {
      text: "Saya dapat melihat situasi dari banyak sisi sebelum memberi saran yang bijak.",
    },
    {
      text: "Saya jarang dimintai pertimbangan untuk keputusan penting orang lain.",
      reverseKeyed: true,
    },
    {
      text: "Nasihat yang saya berikan biasanya membantu orang mengambil langkah yang lebih sehat.",
    },
  ],
  KNOWLEDGE: [
    {
      text: "Saya menikmati mendalami Alkitab secara mendalam dan sistematis.",
    },
    {
      text: "Saya suka menggali konteks historis dan teologis agar Firman dipahami dengan tepat.",
    },
    {
      text: "Saya jarang tertarik mempelajari detail teologis atau latar belakang Alkitab.",
      reverseKeyed: true,
    },
    {
      text: "Saya dapat menghubungkan ayat-ayat Alkitab untuk menjelaskan suatu kebenaran secara utuh.",
    },
  ],
  EXHORTATION: [
    {
      text: "Saya terdorong menguatkan orang yang putus asa agar mereka bangkit kembali.",
    },
    {
      text: "Saya senang mendampingi seseorang melewati masa sulit dengan kata-kata yang membangun.",
    },
    {
      text: "Saya merasa canggung atau enggan menasihati orang yang sedang down.",
      reverseKeyed: true,
    },
    {
      text: "Setelah berbicara dengan saya, orang sering merasa lebih termotivasi untuk maju.",
    },
  ],
  EVANGELISM: [
    {
      text: "Saya merasa nyaman berbicara tentang iman kepada orang yang belum percaya.",
    },
    {
      text: "Saya aktif mencari kesempatan untuk berbagi Injil dalam percakapan sehari-hari.",
    },
    {
      text: "Saya cenderung menghindari percakapan tentang iman dengan orang di luar gereja.",
      reverseKeyed: true,
    },
    {
      text: "Saya melihat buah ketika orang mulai terbuka atau bertanya lebih jauh tentang Kristus karena perjumpaan dengan saya.",
    },
  ],
};

// ==========================================
// HEART — passion / beban hati (bukan skill)
// ==========================================
const HEART: Record<string, RawItem[]> = {
  EDUCATION: [
    {
      text: "Saya punya beban kuat agar orang mendapat akses belajar dan bertumbuh dalam pengetahuan.",
    },
    {
      text: "Ketimpangan pendidikan membuat saya ingin bertindak.",
    },
    {
      text: "Isu pendidikan jarang menggerakkan hati saya.",
      reverseKeyed: true,
    },
    {
      text: "Saya bermimpi melihat komunitas yang melek pengetahuan dan bijak mengambil keputusan.",
    },
  ],
  SOCIAL_JUSTICE: [
    {
      text: "Ketidakadilan sosial membuat hati saya tergerak untuk bertindak.",
    },
    {
      text: "Saya tidak bisa diam melihat orang tertindas atau diperlakukan tidak adil.",
    },
    {
      text: "Isu keadilan sosial jarang menjadi perhatian utama saya.",
      reverseKeyed: true,
    },
    {
      text: "Saya ingin menjadi bagian dari solusi bagi mereka yang terpinggirkan.",
    },
  ],
  ARTS: [
    {
      text: "Saya merasa hidup ketika ekspresi seni atau kreativitas dipakai untuk menggerakkan hati orang.",
    },
    {
      text: "Musik, tulisan, atau seni visual sangat menggerakkan jiwa saya.",
    },
    {
      text: "Seni dan kreativitas jarang menjadi beban atau passion saya.",
      reverseKeyed: true,
    },
    {
      text: "Saya ingin melihat seni dipakai untuk membangun iman dan harapan.",
    },
  ],
  HEALTH: [
    {
      text: "Saya terdorong menolong orang yang sakit atau menghadapi tantangan kesehatan fisik.",
    },
    {
      text: "Isu kesehatan komunitas (gizi, perawatan, akses layanan) penting bagi saya.",
    },
    {
      text: "Kebutuhan kesehatan orang lain jarang menjadi beban hati saya.",
      reverseKeyed: true,
    },
    {
      text: "Saya ingin membawa pemulihan fisik yang nyata bagi orang yang menderita.",
    },
  ],
  FAMILY: [
    {
      text: "Penguatan keluarga dan hubungan rumah tangga adalah prioritas hati saya.",
    },
    {
      text: "Saya percaya keluarga yang sehat adalah fondasi masyarakat yang sehat.",
    },
    {
      text: "Isu keluarga jarang menjadi fokus kepedulian saya.",
      reverseKeyed: true,
    },
    {
      text: "Saya ingin melihat lebih banyak keluarga dipulihkan dan dikuatkan.",
    },
  ],
  YOUTH: [
    {
      text: "Saya memiliki beban khusus bagi generasi muda.",
    },
    {
      text: "Saya ingin menjadi mentor yang menolong anak muda menemukan arah hidup.",
    },
    {
      text: "Pelayanan kepada pemuda jarang menarik minat saya.",
      reverseKeyed: true,
    },
    {
      text: "Masa depan generasi muda sering menjadi isi doa dan kepedulian saya.",
    },
  ],
  MISSIONS: [
    {
      text: "Saya bermimpi menjangkau orang dari budaya atau bangsa lain dengan Injil.",
    },
    {
      text: "Saya terdorong mendukung atau terlibat dalam misi lintas budaya.",
    },
    {
      text: "Menjangkau orang di luar konteks budaya saya jarang menjadi beban saya.",
      reverseKeyed: true,
    },
    {
      text: "Saya rela belajar budaya/bahasa lain jika itu membuka pintu untuk menjangkau jiwa.",
    },
  ],
  COMMUNITY: [
    {
      text: "Saya ingin membangun komunitas yang saling mendukung dan peduli.",
    },
    {
      text: "Saya senang menjadi jembatan antara orang-orang yang berbeda.",
    },
    {
      text: "Membangun kebersamaan komunitas jarang menjadi prioritas saya.",
      reverseKeyed: true,
    },
    {
      text: "Saya merasa terpanggil menciptakan ruang di mana orang merasa diterima.",
    },
  ],
  TECHNOLOGY: [
    {
      text: "Saya melihat teknologi sebagai alat penting untuk memajukan pelayanan dan Kerajaan Allah.",
    },
    {
      text: "Inovasi digital untuk menjangkau orang menggerakkan imajinasi saya.",
    },
    {
      text: "Teknologi dalam pelayanan jarang menarik perhatian saya.",
      reverseKeyed: true,
    },
    {
      text: "Saya ingin melihat gereja memakai teknologi secara bijak untuk dampak yang lebih luas.",
    },
  ],
  ENVIRONMENT: [
    {
      text: "Saya peduli tentang penatalayanan bumi dan lingkungan sebagai tanggung jawab iman.",
    },
    {
      text: "Saya merasa bertanggung jawab terhadap ciptaan Tuhan.",
    },
    {
      text: "Isu lingkungan jarang menjadi beban hati rohani saya.",
      reverseKeyed: true,
    },
    {
      text: "Saya ingin komunitas iman lebih aktif menjaga dan memelihara ciptaan.",
    },
  ],
};

// ==========================================
// ABILITIES — kompetensi / skill yang dapat diamati
// ==========================================
const ABILITIES: Record<string, RawItem[]> = {
  COMMUNICATION: [
    {
      text: "Saya dapat menyampaikan ide dengan jelas secara lisan.",
    },
    {
      text: "Saya cukup percaya diri berbicara di depan orang banyak.",
    },
    {
      text: "Saya kesulitan menyampaikan pikiran agar mudah dipahami orang lain.",
      reverseKeyed: true,
    },
    {
      text: "Orang sering bilang penjelasan saya mudah diikuti.",
    },
  ],
  ORGANIZATION: [
    {
      text: "Saya mampu mengatur jadwal, proyek, dan sumber daya dengan baik.",
    },
    {
      text: "Saya detail-oriented dan menjaga ketertiban dalam pekerjaan.",
    },
    {
      text: "Saya sering kesulitan mengorganisir tugas dan prioritas.",
      reverseKeyed: true,
    },
    {
      text: "Orang mempercayakan saya untuk merapikan proses atau sistem yang kacau.",
    },
  ],
  ANALYTICAL: [
    {
      text: "Saya suka memecahkan masalah kompleks secara logis.",
    },
    {
      text: "Saya dapat menganalisis informasi dan menemukan pola.",
    },
    {
      text: "Saya cenderung menghindari soal yang butuh analisis mendalam.",
      reverseKeyed: true,
    },
    {
      text: "Saya cepat melihat celah atau inkonsistensi dalam sebuah rencana.",
    },
  ],
  CREATIVE: [
    {
      text: "Saya dapat menghasilkan ide-ide kreatif dan inovatif.",
    },
    {
      text: "Saya suka mendesain atau membuat sesuatu yang baru dan bermakna.",
    },
    {
      text: "Saya jarang punya ide kreatif ketika diminta berpikir out of the box.",
      reverseKeyed: true,
    },
    {
      text: "Orang sering meminta masukan kreatif saya untuk sebuah proyek.",
    },
  ],
  TECHNICAL: [
    {
      text: "Saya nyaman bekerja dengan teknologi dan alat digital.",
    },
    {
      text: "Saya dapat memperbaiki, membangun, atau mengoperasikan sesuatu secara teknis.",
    },
    {
      text: "Saya merasa canggung menghadapi perangkat atau sistem teknis.",
      reverseKeyed: true,
    },
    {
      text: "Orang sering meminta bantuan teknis kepada saya.",
    },
  ],
  INTERPERSONAL: [
    {
      text: "Saya mudah membangun hubungan dengan orang baru.",
    },
    {
      text: "Saya peka terhadap perasaan dan kebutuhan orang lain dalam interaksi.",
    },
    {
      text: "Saya kesulitan membaca situasi sosial atau membangun rapport.",
      reverseKeyed: true,
    },
    {
      text: "Orang merasa nyaman membuka diri kepada saya.",
    },
  ],
  WRITING: [
    {
      text: "Saya dapat mengekspresikan pikiran dengan baik melalui tulisan.",
    },
    {
      text: "Saya menikmati proses menulis dan menyempurnakan teks.",
    },
    {
      text: "Menulis adalah hal yang saya hindari atau anggap sulit.",
      reverseKeyed: true,
    },
    {
      text: "Tulisan saya sering membantu orang memahami suatu gagasan.",
    },
  ],
  MUSICAL: [
    {
      text: "Saya memiliki kemampuan musikal (menyanyi atau bermain instrumen).",
    },
    {
      text: "Saya dapat memimpin pujian atau berkontribusi musikal dalam ibadah.",
    },
    {
      text: "Saya tidak memiliki kemampuan atau kenyamanan di bidang musik.",
      reverseKeyed: true,
    },
    {
      text: "Musik adalah area di mana saya dapat berkontribusi secara nyata.",
    },
  ],
  LEADERSHIP_ABILITY: [
    {
      text: "Saya dapat mendelegasikan tugas dan mengarahkan tim secara efektif.",
    },
    {
      text: "Saya mampu membuat keputusan operasional yang menolong tim maju.",
    },
    {
      text: "Saya kesulitan mengarahkan orang atau membagi tanggung jawab.",
      reverseKeyed: true,
    },
    {
      text: "Dalam proyek, orang mengikuti arahan saya karena hasilnya terasa jelas.",
    },
  ],
  TEACHING_ABILITY: [
    {
      text: "Saya dapat menjelaskan konsep sulit dengan cara yang mudah dipahami.",
    },
    {
      text: "Saya sabar membimbing orang yang baru belajar suatu keterampilan.",
    },
    {
      text: "Saya kesulitan menyesuaikan penjelasan dengan tingkat pemahaman orang lain.",
      reverseKeyed: true,
    },
    {
      text: "Orang sering meminta saya mengajarkan atau melatih mereka.",
    },
  ],
};

// ==========================================
// PERSONALITY — preferensi bipolar (4 item / kutub)
// ==========================================
const PERSONALITY: Record<string, RawItem[]> = {
  EXTROVERT: [
    {
      text: "Saya merasa berenergi setelah menghabiskan waktu dengan banyak orang.",
    },
    {
      text: "Saya suka berbicara dan berdiskusi dalam kelompok.",
    },
    {
      text: "Interaksi sosial yang lama biasanya membuat saya cepat kehabisan energi.",
      reverseKeyed: true,
    },
    {
      text: "Saya cenderung memulai percakapan dengan orang yang baru saya kenal.",
    },
  ],
  INTROVERT: [
    {
      text: "Saya lebih suka bekerja sendiri daripada dalam kelompok besar.",
    },
    {
      text: "Saya perlu waktu sendiri untuk mengisi ulang energi.",
    },
    {
      text: "Saya jarang membutuhkan waktu sendiri setelah berkumpul dengan orang.",
      reverseKeyed: true,
    },
    {
      text: "Saya berpikir lebih jernih dalam suasana yang tenang dan minim distraksi sosial.",
    },
  ],
  TASK: [
    {
      text: "Saya fokus menyelesaikan tugas terlebih dahulu sebelum urusan relasi.",
    },
    {
      text: "Saya merasa puas ketika checklist saya selesai.",
    },
    {
      text: "Saya sering menunda tugas demi menjaga suasana hubungan.",
      reverseKeyed: true,
    },
    {
      text: "Hasil dan pencapaian lebih menggerakkan saya daripada proses sosialisasi.",
    },
  ],
  PEOPLE: [
    {
      text: "Hubungan dengan orang lebih penting bagi saya daripada menyelesaikan tugas tepat waktu.",
    },
    {
      text: "Saya memprioritaskan kesejahteraan emosional tim.",
    },
    {
      text: "Saya jarang menyesuaikan rencana hanya karena perasaan orang lain.",
      reverseKeyed: true,
    },
    {
      text: "Saya lebih nyaman memastikan orang merasa didengar daripada mengejar target semata.",
    },
  ],
  STRUCTURED: [
    {
      text: "Saya suka membuat rencana dan mengikutinya.",
    },
    {
      text: "Saya mengikuti jadwal harian yang teratur.",
    },
    {
      text: "Rencana detail justru membuat saya merasa terkekang.",
      reverseKeyed: true,
    },
    {
      text: "Saya merasa lebih aman ketika ada struktur dan prosedur yang jelas.",
    },
  ],
  FLEXIBLE: [
    {
      text: "Saya lebih suka fleksibilitas dan spontanitas daripada rencana kaku.",
    },
    {
      text: "Saya mudah beradaptasi ketika rencana berubah mendadak.",
    },
    {
      text: "Perubahan rencana mendadak biasanya membuat saya stres.",
      reverseKeyed: true,
    },
    {
      text: "Saya nyaman memutuskan di saat terakhir jika situasi menuntut.",
    },
  ],
  THINKER: [
    {
      text: "Saya membuat keputusan terutama berdasarkan logika dan fakta.",
    },
    {
      text: "Saya menganalisis dulu sebelum merespons secara emosional.",
    },
    {
      text: "Saya jarang mengandalkan analisis logis saat mengambil keputusan.",
      reverseKeyed: true,
    },
    {
      text: "Dalam konflik, saya fokus pada prinsip dan objektivitas.",
    },
  ],
  FEELER: [
    {
      text: "Saya membuat keputusan dengan mempertimbangkan dampaknya pada perasaan orang.",
    },
    {
      text: "Nilai dan keharmonisan hubungan sangat memengaruhi keputusan saya.",
    },
    {
      text: "Saya jarang membiarkan perasaan orang memengaruhi keputusan saya.",
      reverseKeyed: true,
    },
    {
      text: "Dalam konflik, saya lebih dulu menjaga perasaan orang yang terlibat.",
    },
  ],
  LEADER: [
    {
      text: "Saya nyaman mengambil inisiatif dan memimpin arah.",
    },
    {
      text: "Saya secara alami mengambil tanggung jawab dalam situasi baru.",
    },
    {
      text: "Saya lebih suka menunggu orang lain yang memulai.",
      reverseKeyed: true,
    },
    {
      text: "Ketika ada kekosongan kepemimpinan, saya cenderung melangkah maju.",
    },
  ],
  SUPPORTER: [
    {
      text: "Saya lebih suka mendukung orang lain dalam peran mereka.",
    },
    {
      text: "Saya merasa nyaman dan efektif dalam peran pendukung.",
    },
    {
      text: "Berada di peran pendukung membuat saya cepat merasa tidak berguna.",
      reverseKeyed: true,
    },
    {
      text: "Saya lebih senang memperkuat pemimpin lain daripada menjadi sorotan utama.",
    },
  ],
};

// ==========================================
// EXPERIENCE — frekuensi / seberapa membentuk (bukan attitude murni)
// ==========================================
const EXPERIENCE: Record<string, RawItem[]> = {
  SPIRITUAL_EXP: [
    {
      text: "Saya mengalami momen spiritual yang secara nyata mengubah arah hidup saya.",
    },
    {
      text: "Saya melihat Tuhan bekerja melalui pelayanan yang saya lakukan.",
    },
    {
      text: "Saya jarang mengalami perjumpaan rohani yang terasa membentuk hidup.",
      reverseKeyed: true,
    },
    {
      text: "Pengalaman rohani masa lalu masih menjadi fondasi keputusan saya hari ini.",
    },
  ],
  PAINFUL_EXP: [
    {
      text: "Pengalaman menyakitkan telah membentuk empati saya terhadap orang lain.",
    },
    {
      text: "Tuhan memakai kegagalan atau luka saya untuk pertumbuhan yang nyata.",
    },
    {
      text: "Saya jarang melihat rasa sakit masa lalu sebagai sesuatu yang membentuk pelayanan saya.",
      reverseKeyed: true,
    },
    {
      text: "Saya pernah mengalami pemulihan dari situasi sulit yang memperkuat iman saya.",
    },
  ],
  EDUCATIONAL_EXP: [
    {
      text: "Pendidikan formal memperlengkapi saya dengan bekal yang berguna untuk melayani.",
    },
    {
      text: "Pelatihan atau kursus tertentu secara jelas membentuk kemampuan saya.",
    },
    {
      text: "Latar belakang pendidikan saya jarang terasa relevan bagi pelayanan.",
      reverseKeyed: true,
    },
    {
      text: "Saya memakai pengetahuan dari jalur pendidikan dalam konteks pelayanan.",
    },
  ],
  WORK_EXP: [
    {
      text: "Pengalaman kerja mengajarkan keterampilan yang berguna untuk pelayanan.",
    },
    {
      text: "Pengalaman profesional memberi perspektif unik bagi cara saya melayani.",
    },
    {
      text: "Pekerjaan saya jarang memberi bekal yang terasa relevan bagi pelayanan.",
      reverseKeyed: true,
    },
    {
      text: "Keterampilan dari dunia kerja sering saya pakai untuk menolong gereja/komunitas.",
    },
  ],
  MINISTRY_EXP: [
    {
      text: "Saya pernah terlibat secara aktif dalam pelayanan yang bermakna.",
    },
    {
      text: "Saya memiliki pengalaman melayani dalam peran yang jelas di gereja atau komunitas iman.",
    },
    {
      text: "Saya jarang terlibat dalam pelayanan yang berkelanjutan.",
      reverseKeyed: true,
    },
    {
      text: "Pengalaman pelayanan sebelumnya menolong saya tahu di mana saya efektif.",
    },
  ],
};

export const QUESTIONS: QuestionDefinition[] = [
  ...interleaveSection("SPIRITUAL_GIFTS", SPIRITUAL_GIFTS, {
    text: ATTENTION_SG,
  }),
  ...interleaveSection("HEART", HEART, { text: ATTENTION_HEART }),
  ...interleaveSection("ABILITIES", ABILITIES, { text: ATTENTION_ABILITIES }),
  ...interleaveSection("PERSONALITY", PERSONALITY, {
    text: ATTENTION_PERSONALITY,
  }),
  ...interleaveSection("EXPERIENCE", EXPERIENCE),
];

/** Expected Likert value for attention items (parsed from instructional text). */
export const ATTENTION_EXPECTED: Record<string, number> = {
  [ATTENTION_SG]: 2,
  [ATTENTION_HEART]: 4,
  [ATTENTION_ABILITIES]: 1,
  [ATTENTION_PERSONALITY]: 3,
};

export function countQuestionsBySection(): Record<ShapeSectionKey, number> {
  const counts: Record<ShapeSectionKey, number> = {
    SPIRITUAL_GIFTS: 0,
    HEART: 0,
    ABILITIES: 0,
    PERSONALITY: 0,
    EXPERIENCE: 0,
  };
  for (const q of QUESTIONS) counts[q.section]++;
  return counts;
}
