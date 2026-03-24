export interface QuestionDefinition {
  section:
    | "SPIRITUAL_GIFTS"
    | "HEART"
    | "ABILITIES"
    | "PERSONALITY"
    | "EXPERIENCE";
  category: string;
  text: string;
  orderIndex: number;
}

export const QUESTIONS: QuestionDefinition[] = [
  // ==========================================
  // SPIRITUAL GIFTS (20 questions, 10 categories, 2 each)
  // ==========================================
  {
    section: "SPIRITUAL_GIFTS",
    category: "TEACHING",
    text: "Saya merasa terdorong untuk menjelaskan kebenaran Firman Tuhan kepada orang lain.",
    orderIndex: 1,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "TEACHING",
    text: "Saya suka mempersiapkan materi pembelajaran rohani.",
    orderIndex: 2,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "SERVING",
    text: "Saya secara alami melihat kebutuhan praktis dan ingin memenuhinya.",
    orderIndex: 3,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "SERVING",
    text: "Saya lebih suka bekerja di belakang layar untuk mendukung pelayanan.",
    orderIndex: 4,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "LEADERSHIP",
    text: "Orang sering meminta saya untuk mengambil keputusan dalam kelompok.",
    orderIndex: 5,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "LEADERSHIP",
    text: "Saya mampu mengorganisir orang dan sumber daya secara efektif.",
    orderIndex: 6,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "GIVING",
    text: "Saya merasa sukacita besar saat memberi kepada orang yang membutuhkan.",
    orderIndex: 7,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "GIVING",
    text: "Saya rela berkorban secara finansial untuk pekerjaan Tuhan.",
    orderIndex: 8,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "MERCY",
    text: "Hati saya tergerak melihat penderitaan orang lain.",
    orderIndex: 9,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "MERCY",
    text: "Saya cepat menyadari ketika seseorang merasa kesepian atau terluka.",
    orderIndex: 10,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "FAITH",
    text: "Saya percaya Tuhan mampu melakukan hal-hal besar bahkan saat situasi sulit.",
    orderIndex: 11,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "FAITH",
    text: "Saya tetap berharap pada Tuhan di tengah ketidakpastian.",
    orderIndex: 12,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "WISDOM",
    text: "Saya sering dimintai nasihat tentang keputusan hidup.",
    orderIndex: 13,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "WISDOM",
    text: "Saya dapat melihat situasi dari berbagai perspektif sebelum memberikan saran.",
    orderIndex: 14,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "KNOWLEDGE",
    text: "Saya menikmati mempelajari dan mendalami Alkitab.",
    orderIndex: 15,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "KNOWLEDGE",
    text: "Saya suka menggali konteks historis dan teologis dalam Alkitab.",
    orderIndex: 16,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "EXHORTATION",
    text: "Saya merasa terdorong untuk menguatkan orang yang putus asa.",
    orderIndex: 17,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "EXHORTATION",
    text: "Saya merasa terpanggil untuk mendampingi orang melalui masa sulit.",
    orderIndex: 18,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "EVANGELISM",
    text: "Saya merasa nyaman berbicara tentang iman saya kepada orang yang belum percaya.",
    orderIndex: 19,
  },
  {
    section: "SPIRITUAL_GIFTS",
    category: "EVANGELISM",
    text: "Saya secara aktif mencari kesempatan untuk berbagi Injil.",
    orderIndex: 20,
  },

  // ==========================================
  // HEART (20 questions, 10 categories, 2 each)
  // ==========================================
  {
    section: "HEART",
    category: "EDUCATION",
    text: "Saya sangat peduli tentang pendidikan dan pengembangan pengetahuan.",
    orderIndex: 1,
  },
  {
    section: "HEART",
    category: "EDUCATION",
    text: "Saya senang mengajar atau melatih orang lain.",
    orderIndex: 2,
  },
  {
    section: "HEART",
    category: "SOCIAL_JUSTICE",
    text: "Ketidakadilan sosial membuat hati saya tergerak untuk bertindak.",
    orderIndex: 3,
  },
  {
    section: "HEART",
    category: "SOCIAL_JUSTICE",
    text: "Saya tidak bisa diam melihat orang tertindas.",
    orderIndex: 4,
  },
  {
    section: "HEART",
    category: "ARTS",
    text: "Saya merasa hidup saat mengekspresikan diri melalui seni atau kreativitas.",
    orderIndex: 5,
  },
  {
    section: "HEART",
    category: "ARTS",
    text: "Musik, tulisan, atau seni visual menggerakkan jiwa saya.",
    orderIndex: 6,
  },
  {
    section: "HEART",
    category: "HEALTH",
    text: "Saya terdorong untuk membantu orang yang sakit atau menderita secara fisik.",
    orderIndex: 7,
  },
  {
    section: "HEART",
    category: "HEALTH",
    text: "Saya ingin membawa pemulihan bagi orang yang terluka.",
    orderIndex: 8,
  },
  {
    section: "HEART",
    category: "FAMILY",
    text: "Keluarga dan penguatan hubungan adalah prioritas utama saya.",
    orderIndex: 9,
  },
  {
    section: "HEART",
    category: "FAMILY",
    text: "Saya percaya keluarga kuat adalah fondasi masyarakat.",
    orderIndex: 10,
  },
  {
    section: "HEART",
    category: "YOUTH",
    text: "Saya memiliki beban khusus untuk generasi muda.",
    orderIndex: 11,
  },
  {
    section: "HEART",
    category: "YOUTH",
    text: "Saya ingin menjadi mentor bagi anak muda.",
    orderIndex: 12,
  },
  {
    section: "HEART",
    category: "MISSIONS",
    text: "Saya bermimpi tentang menjangkau budaya dan bangsa lain.",
    orderIndex: 13,
  },
  {
    section: "HEART",
    category: "MISSIONS",
    text: "Saya tertarik dengan budaya dan bahasa lain.",
    orderIndex: 14,
  },
  {
    section: "HEART",
    category: "COMMUNITY",
    text: "Saya ingin membangun komunitas yang saling mendukung.",
    orderIndex: 15,
  },
  {
    section: "HEART",
    category: "COMMUNITY",
    text: "Saya suka membangun jembatan antara orang-orang yang berbeda.",
    orderIndex: 16,
  },
  {
    section: "HEART",
    category: "TECHNOLOGY",
    text: "Saya melihat teknologi sebagai alat untuk memajukan Kerajaan Allah.",
    orderIndex: 17,
  },
  {
    section: "HEART",
    category: "TECHNOLOGY",
    text: "Saya melihat potensi inovasi digital untuk pelayanan.",
    orderIndex: 18,
  },
  {
    section: "HEART",
    category: "ENVIRONMENT",
    text: "Saya peduli tentang penatalayanan bumi dan lingkungan.",
    orderIndex: 19,
  },
  {
    section: "HEART",
    category: "ENVIRONMENT",
    text: "Saya merasa bertanggung jawab terhadap ciptaan Tuhan.",
    orderIndex: 20,
  },

  // ==========================================
  // ABILITIES (20 questions, 10 categories, 2 each)
  // ==========================================
  {
    section: "ABILITIES",
    category: "COMMUNICATION",
    text: "Saya dapat menyampaikan ide dengan jelas secara lisan.",
    orderIndex: 1,
  },
  {
    section: "ABILITIES",
    category: "COMMUNICATION",
    text: "Saya seorang pembicara publik yang percaya diri.",
    orderIndex: 2,
  },
  {
    section: "ABILITIES",
    category: "ORGANIZATION",
    text: "Saya mampu mengatur jadwal, proyek, dan sumber daya dengan baik.",
    orderIndex: 3,
  },
  {
    section: "ABILITIES",
    category: "ORGANIZATION",
    text: "Saya detail-oriented dan terorganisir.",
    orderIndex: 4,
  },
  {
    section: "ABILITIES",
    category: "ANALYTICAL",
    text: "Saya suka memecahkan masalah kompleks secara logis.",
    orderIndex: 5,
  },
  {
    section: "ABILITIES",
    category: "ANALYTICAL",
    text: "Saya dapat menganalisis data dan menemukan pola.",
    orderIndex: 6,
  },
  {
    section: "ABILITIES",
    category: "CREATIVE",
    text: "Saya dapat menghasilkan ide-ide kreatif dan inovatif.",
    orderIndex: 7,
  },
  {
    section: "ABILITIES",
    category: "CREATIVE",
    text: "Saya suka mendesain atau membuat sesuatu yang indah.",
    orderIndex: 8,
  },
  {
    section: "ABILITIES",
    category: "TECHNICAL",
    text: "Saya nyaman bekerja dengan teknologi dan alat digital.",
    orderIndex: 9,
  },
  {
    section: "ABILITIES",
    category: "TECHNICAL",
    text: "Saya dapat memperbaiki atau membangun sesuatu secara teknis.",
    orderIndex: 10,
  },
  {
    section: "ABILITIES",
    category: "INTERPERSONAL",
    text: "Saya mudah membangun hubungan dengan orang baru.",
    orderIndex: 11,
  },
  {
    section: "ABILITIES",
    category: "INTERPERSONAL",
    text: "Saya peka terhadap perasaan dan kebutuhan orang lain.",
    orderIndex: 12,
  },
  {
    section: "ABILITIES",
    category: "WRITING",
    text: "Saya dapat mengekspresikan pikiran dengan baik melalui tulisan.",
    orderIndex: 13,
  },
  {
    section: "ABILITIES",
    category: "WRITING",
    text: "Saya menikmati proses menulis dan editing.",
    orderIndex: 14,
  },
  {
    section: "ABILITIES",
    category: "MUSICAL",
    text: "Saya memiliki kemampuan musikal (menyanyi atau bermain instrumen).",
    orderIndex: 15,
  },
  {
    section: "ABILITIES",
    category: "MUSICAL",
    text: "Saya dapat memimpin pujian atau bermain musik.",
    orderIndex: 16,
  },
  {
    section: "ABILITIES",
    category: "LEADERSHIP_ABILITY",
    text: "Orang secara alami mengikuti arahan saya.",
    orderIndex: 17,
  },
  {
    section: "ABILITIES",
    category: "LEADERSHIP_ABILITY",
    text: "Saya dapat mendelegasikan tugas dengan efektif.",
    orderIndex: 18,
  },
  {
    section: "ABILITIES",
    category: "TEACHING_ABILITY",
    text: "Saya dapat menjelaskan konsep sulit dengan cara yang mudah dipahami.",
    orderIndex: 19,
  },
  {
    section: "ABILITIES",
    category: "TEACHING_ABILITY",
    text: "Saya sabar dalam mengajar orang yang baru belajar.",
    orderIndex: 20,
  },

  // ==========================================
  // PERSONALITY (20 questions, 10 categories, 2 each)
  // ==========================================
  {
    section: "PERSONALITY",
    category: "EXTROVERT",
    text: "Saya merasa berenergi setelah menghabiskan waktu dengan banyak orang.",
    orderIndex: 1,
  },
  {
    section: "PERSONALITY",
    category: "INTROVERT",
    text: "Saya lebih suka bekerja sendiri daripada dalam kelompok besar.",
    orderIndex: 2,
  },
  {
    section: "PERSONALITY",
    category: "TASK",
    text: "Saya fokus pada menyelesaikan tugas terlebih dahulu.",
    orderIndex: 3,
  },
  {
    section: "PERSONALITY",
    category: "PEOPLE",
    text: "Hubungan dengan orang lebih penting bagi saya daripada menyelesaikan tugas.",
    orderIndex: 4,
  },
  {
    section: "PERSONALITY",
    category: "STRUCTURED",
    text: "Saya suka membuat rencana dan mengikutinya.",
    orderIndex: 5,
  },
  {
    section: "PERSONALITY",
    category: "FLEXIBLE",
    text: "Saya lebih suka fleksibilitas dan spontanitas.",
    orderIndex: 6,
  },
  {
    section: "PERSONALITY",
    category: "THINKER",
    text: "Saya membuat keputusan berdasarkan logika dan fakta.",
    orderIndex: 7,
  },
  {
    section: "PERSONALITY",
    category: "FEELER",
    text: "Saya membuat keputusan berdasarkan nilai dan perasaan.",
    orderIndex: 8,
  },
  {
    section: "PERSONALITY",
    category: "LEADER",
    text: "Saya nyaman mengambil inisiatif dan memimpin.",
    orderIndex: 9,
  },
  {
    section: "PERSONALITY",
    category: "SUPPORTER",
    text: "Saya lebih suka mendukung orang lain dalam peran mereka.",
    orderIndex: 10,
  },
  {
    section: "PERSONALITY",
    category: "EXTROVERT",
    text: "Saya suka berbicara dan berdiskusi dalam kelompok.",
    orderIndex: 11,
  },
  {
    section: "PERSONALITY",
    category: "INTROVERT",
    text: "Saya perlu waktu sendiri untuk mengisi ulang energi.",
    orderIndex: 12,
  },
  {
    section: "PERSONALITY",
    category: "TASK",
    text: "Saya merasa puas saat checklist saya selesai.",
    orderIndex: 13,
  },
  {
    section: "PERSONALITY",
    category: "PEOPLE",
    text: "Saya memprioritaskan kesejahteraan emosional tim.",
    orderIndex: 14,
  },
  {
    section: "PERSONALITY",
    category: "STRUCTURED",
    text: "Saya mengikuti jadwal harian yang teratur.",
    orderIndex: 15,
  },
  {
    section: "PERSONALITY",
    category: "FLEXIBLE",
    text: "Saya mudah beradaptasi dengan perubahan rencana.",
    orderIndex: 16,
  },
  {
    section: "PERSONALITY",
    category: "THINKER",
    text: "Saya menganalisis sebelum merespons secara emosional.",
    orderIndex: 17,
  },
  {
    section: "PERSONALITY",
    category: "FEELER",
    text: "Empati adalah kekuatan utama saya.",
    orderIndex: 18,
  },
  {
    section: "PERSONALITY",
    category: "LEADER",
    text: "Saya secara alami mengambil tanggung jawab dalam situasi baru.",
    orderIndex: 19,
  },
  {
    section: "PERSONALITY",
    category: "SUPPORTER",
    text: "Saya merasa nyaman dalam peran pendukung.",
    orderIndex: 20,
  },

  // ==========================================
  // EXPERIENCE (10 questions, 5 categories, 2 each)
  // ==========================================
  {
    section: "EXPERIENCE",
    category: "SPIRITUAL_EXP",
    text: "Saya pernah mengalami momen spiritual yang mengubah hidup saya.",
    orderIndex: 1,
  },
  {
    section: "EXPERIENCE",
    category: "SPIRITUAL_EXP",
    text: "Saya pernah melihat Tuhan bekerja melalui pelayanan yang saya lakukan.",
    orderIndex: 2,
  },
  {
    section: "EXPERIENCE",
    category: "PAINFUL_EXP",
    text: "Pengalaman menyakitkan dalam hidup saya telah membentuk empati saya.",
    orderIndex: 3,
  },
  {
    section: "EXPERIENCE",
    category: "PAINFUL_EXP",
    text: "Tuhan telah menggunakan kegagalan saya untuk pertumbuhan.",
    orderIndex: 4,
  },
  {
    section: "EXPERIENCE",
    category: "EDUCATIONAL_EXP",
    text: "Pendidikan formal saya telah memperlengkapi saya untuk melayani.",
    orderIndex: 5,
  },
  {
    section: "EXPERIENCE",
    category: "EDUCATIONAL_EXP",
    text: "Pelatihan atau kursus tertentu telah membentuk kemampuan saya.",
    orderIndex: 6,
  },
  {
    section: "EXPERIENCE",
    category: "WORK_EXP",
    text: "Pengalaman kerja saya telah mengajarkan keterampilan yang berguna untuk pelayanan.",
    orderIndex: 7,
  },
  {
    section: "EXPERIENCE",
    category: "WORK_EXP",
    text: "Pengalaman profesional memberikan perspektif unik bagi pelayanan saya.",
    orderIndex: 8,
  },
  {
    section: "EXPERIENCE",
    category: "MINISTRY_EXP",
    text: "Saya pernah terlibat dalam pelayanan yang bermakna.",
    orderIndex: 9,
  },
  {
    section: "EXPERIENCE",
    category: "MINISTRY_EXP",
    text: "Saya pernah mengalami pemulihan dari situasi sulit yang memperkuat iman saya.",
    orderIndex: 10,
  },
];
