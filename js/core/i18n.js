/**
 * EDUVERSE — i18n (Bahasa Indonesia)
 * Semua teks terpusat di sini.
 */

const currentLang = 'id';

const translations = {
  id: {
    // ── Landing ──────────────────────────────
    'landing.motto': 'Jelajahi • Mainkan • Pelajari • Naik Level',
    'landing.welcome': 'Selamat datang, Penjelajah Pengetahuan! Inti Pengetahuan telah terganggu. Energinya tersebar di lima dunia edukasi. Selesaikan misi belajar, kumpulkan kristal, dan pulihkan Inti Pengetahuan!',
    'landing.begin': '🚀 Mulai Petualangan',
    'landing.continue': '▶ Lanjutkan Perjalanan',
    'landing.createAvatar': '🎨 Buat Avatar',
    'landing.teacherLogin': '👩‍🏫 Login Guru',
    'landing.worldsTitle': 'Lima Dunia Pengetahuan',
    'landing.worldsSubtitle': 'Setiap dunia menyimpan satu kristal pengetahuan.',
    'landing.teacherHint': 'Guru?',
    'landing.welcomeBack': 'Halo kembali,',
    'landing.changeExplorer': '🚪 Ganti Penjelajah',

    // ── Worlds ──────────────────────────────
    'world.SCI': 'Dunia Sains',
    'world.MAT': 'Dunia Matematika',
    'world.LIT': 'Dunia Literasi',
    'world.CUL': 'Dunia Budaya',
    'world.DIG': 'Dunia Digital',

    // ── Login ────────────────────────────────
    'login.welcome': 'Selamat Datang, Penjelajah',
    'login.intro': 'Aku <b>EDO</b>, pemandumu. Siapa namamu?',
    'login.nameLabel': 'Nama Penjelajah',
    'login.namePlaceholder': 'contoh: Alya',
    'login.continue': 'Lanjutkan →',
    'login.back': '← Kembali',

    // ── Avatar ──────────────────────────────
    'avatar.title': 'Buat Penjelajahmu',
    'avatar.subtitle': 'Sesuaikan tampilanmu — bisa diubah nanti di Profil.',
    'avatar.gender': 'Jenis Kelamin',
    'avatar.male': 'Laki-laki',
    'avatar.female': 'Perempuan',
    'avatar.hair': 'Rambut',
    'avatar.outfit': 'Pakaian',
    'avatar.accessories': 'Aksesori',
    'avatar.start': '✓ Mulai Petualangan',
    'avatar.randomize': '🎲 Acak',
    'avatar.preview': 'Pratinjau',
    'avatar.stepGender': '1. Pilih Jenis Kelamin',
    'avatar.stepHair': '2. Pilih Gaya Rambut',
    'avatar.stepOutfit': '3. Pilih Pakaian',
    'avatar.stepAccessories': '4. Pilih Aksesori (bisa lebih dari satu)',

    // ── City ────────────────────────────────
    'city.title': '🏙️ Kota Edu',
    'city.subtitle': 'Pusat petualangan belajarmu.',
    'city.knowledgeExplorer': 'Penjelajah Pengetahuan',
    'city.explore': 'Jelajahi',
    'city.locAcademy': 'Akademi Pengetahuan',
    'city.locAcademyDesc': 'Ulas kembali yang sudah kamu pelajari',
    'city.locShop': 'Toko Edu',
    'city.locShopDesc': 'Hanya barang kosmetik',
    'city.locArcade': 'Arkade Edu',
    'city.locArcadeDesc': 'Mini-game & latihan',
    'city.locRoom': 'Kamarku',
    'city.locRoomDesc': 'Peliharaan & dekorasi',
    'city.locPortal': 'Portal Dunia',
    'city.locPortalDesc': 'Masuk ke dunia belajar',
    'city.locFame': 'Balai Kehormatan',
    'city.locFameDesc': 'Pencapaian & lencana',
    'city.statXP': 'XP',
    'city.statCoins': 'Koin',
    'city.statCards': 'Kartu',
    'city.statWorlds': 'Dunia',
    'city.toNextLevel': 'XP lagi untuk level berikutnya',
    'city.comingSoonShop': 'Toko kosmetik segera hadir — hanya menjual barang kosmetik.',
    'city.comingSoonArcade': 'Mini-game segera hadir. Sementara itu, jelajahi dunia belajar!',
    'city.comingSoonRoom': 'Kustomisasi kamar segera hadir. Peliharaanmu akan tinggal di sini!',
    'city.comingSoonFame': 'Balai Kehormatan segera hadir — merayakan pencapaian, bukan peringkat.',

    // ── World Map ────────────────────────────
    'worldMap.title': '🗺️ Peta Dunia',
    'worldMap.subtitle': 'Lima dunia. Satu Inti Pengetahuan untuk dipulihkan.',
    'worldMap.progress': 'Progres',

    // ── Zone ────────────────────────────────
    'zone.learningQuests': '📘 Misi Belajar',
    'zone.challenge': '⚡ Tantangan',
    'zone.boss': '👾 Bos Zona',
    'zone.quests': 'Misi',
    'zone.mastery': 'Penguasaan',
    'zone.lockedTitle': '🔒 Terkunci',
    'zone.lockedChallengeMsg': 'Selesaikan ketiga Misi Belajar di zona ini untuk membuka Tantangan.',
    'zone.lockedBossMsg': 'Selesaikan Tantangan dulu untuk menghadapi Bos Zona.',
    'zone.lockedDefaultMsg': 'Misi ini belum tersedia.',
    'zone.interactions': 'interaksi',

    // ── Quest Briefing ──────────────────────
    'quest.typeLearning': '📘 Misi Belajar',
    'quest.typeChallenge': '⚡ Tantangan',
    'quest.typeBoss': '👾 Bos Zona',
    'quest.interactions': 'Interaksi',
    'quest.xpReward': 'Hadiah XP',
    'quest.coins': 'Koin',
    'quest.passThreshold': '🎯 Ambang Kelulusan',
    'quest.passThresholdMsg': 'Kamu perlu {score}% untuk menyelesaikan {type} ini.',
    'quest.previousAttempt': '🔁 Percobaan Sebelumnya',
    'quest.previousAttemptMsg': 'Skor: {score}% — mengulang tetap memperbarui penguasaanmu.',
    'quest.begin': '🚀 Mulai',
    'quest.back': '← Kembali',

    // ── Gameplay ────────────────────────────
    'gameplay.exit': '← Keluar',
    'gameplay.hint': '💡 Petunjuk',
    'gameplay.hintLevel': '💡 Petunjuk (Level {level})',
    'gameplay.hintDefault': 'Pikirkan baik-baik pertanyaannya.',
    'gameplay.submit': 'Kirim',
    'gameplay.submitOrder': 'Kirim Urutan',
    'gameplay.tryAgain': '↻ Coba Lagi',
    'gameplay.continue': 'Lanjutkan →',
    'gameplay.score': 'Skor',
    'gameplay.quitTitle': 'Keluar dari Misi?',
    'gameplay.quitMsg': 'Progres percobaan ini akan hilang. Penyelesaian sebelumnya tetap aman.',
    'gameplay.quitConfirm': 'Keluar',
    'gameplay.quitCancel': 'Tetap di Sini',
    'gameplay.questComplete': 'Misi Selesai!',
    'gameplay.replayInfo': 'Hadiah ulangan — XP berkurang, penguasaan tetap diperbarui.',
    'gameplay.youScored': 'Kamu mendapat {score}%',
    'gameplay.needToPass': '{type} ini membutuhkan {required}% untuk lulus. Kamu bisa!',
    'gameplay.retry': '↻ Ulangi',
    'gameplay.backToZone': '← Kembali ke Zona',
    'gameplay.unlocked': 'Terbuka',
    'gameplay.question': 'Soal',
    'gameplay.selectSubmit': 'Kirim Jawaban',
    'gameplay.tapCycle': 'Tap item untuk memilih kategori: {cats}',

    // ── Profile ─────────────────────────────
    'profile.title': '👤 Profil',
    'profile.subtitle': 'Perjalanan belajarmu sekilas.',
    'profile.editAvatar': '✏️ Ubah Avatar',
    'profile.cards': 'Kartu',
    'profile.badges': 'Lencana',
    'profile.crystals': 'Kristal',
    'profile.pets': 'Peliharaan',
    'profile.streak': '🔥 Runtutan Belajar',
    'profile.streakDays': '{n} hari',
    'profile.longestStreak': 'Terpanjang: {n} hari',
    'profile.worldsDiscovered': '🌍 Dunia Ditemukan',
    'profile.conceptMastery': '📈 Penguasaan Konsep',
    'profile.noBadges': 'Selesaikan misi untuk mendapatkan lencana.',
    'profile.noMastery': 'Mulai bermain untuk membangun penguasaan.',
    'profile.levelTitle': 'Level {level} — {title}',

    // ── Library ─────────────────────────────
    'library.title': '📚 Perpustakaan Pengetahuan',
    'library.subtitle': 'Jelajahi kartu pengetahuanmu.',
    'library.collected': 'Terkumpul',
    'library.rare': 'Langka',
    'library.epic': 'Epik',
    'library.legendary': 'Legendaris',
    'library.world': 'Dunia',
    'library.owned': 'Kepemilikan',
    'library.rarity': 'Kelangkaan',
    'library.all': 'Semua',
    'library.filterCollected': 'Terkumpul',
    'library.filterLocked': 'Terkunci',
    'library.empty': 'Tidak ada kartu yang cocok dengan filter ini.',
    'library.close': 'Tutup',
    'library.rarityCommon': 'Umum',
    'library.rarityUncommon': 'Jarang',
    'library.rarityRare': 'Langka',
    'library.rarityEpic': 'Epik',
    'library.rarityLegendary': 'Legendaris',

    // ── Nav ─────────────────────────────────
    'nav.city': '🏙️ Kota',
    'nav.worlds': '🗺️ Dunia',
    'nav.library': '📚 Perpustakaan',
    'nav.profile': '👤 Profil',
    'nav.home': '🏠 Beranda',
    'nav.back': 'Kembali',

    // ── Modal ───────────────────────────────
    'modal.ok': 'OK',
    'modal.cancel': 'Batal',

    // ── Teacher Login ───────────────────────
    'teacherLogin.title': '👩‍🏫 Login Guru',
    'teacherLogin.subtitle': 'Akses dashboard analitik siswa.',
    'teacherLogin.email': 'Email',
    'teacherLogin.emailPlaceholder': 'guru@sekolah.id',
    'teacherLogin.password': 'Password',
    'teacherLogin.passwordPlaceholder': '••••••••',
    'teacherLogin.submit': '🔓 Masuk',
    'teacherLogin.back': '← Kembali ke Beranda',
    'teacherLogin.hint': 'Demo: guru@eduverse.id / eduverse2025',

    // ── Teacher Dashboard ───────────────────
    'teacher.title': '👩‍🏫 Dashboard Guru',
    'teacher.navOverview': '📊 Ikhtisar',
    'teacher.navStudents': '👥 Siswa',
    'teacher.navMastery': '📈 Penguasaan',
    'teacher.navMisconceptions': '💡 Miskonsepsi',
    'teacher.navTrends': '📉 Tren',
    'teacher.navHints': '💬 Penggunaan Petunjuk',
    'teacher.navQuestions': '❓ Analitik Soal',
    'teacher.navCards': '🃏 Kartu Pengetahuan',
    'teacher.navReports': '📄 Laporan',
    'teacher.logout': '🚪 Keluar',
    'teacher.backToApp': '← Aplikasi Siswa',
    'teacher.welcome': 'Selamat datang, {name}',
    'teacher.overviewTitle': '📊 Ikhtisar Kelas',
    'teacher.activeStudents': 'Siswa Aktif',
    'teacher.questionsAnswered': 'Soal Dijawab',
    'teacher.questsCompleted': 'Misi Selesai',
    'teacher.hintsUsed': 'Petunjuk Digunakan',
    'teacher.classMastery': 'Ringkasan Penguasaan Kelas',
    'teacher.avgMastery': 'Rata-rata penguasaan pada {count} konsep',
    'teacher.cardsUnlocked': '🃏 {n} Kartu Pengetahuan terbuka sesi ini.',
    'teacher.studentsTitle': '👥 Siswa',
    'teacher.noStudent': 'Belum ada profil siswa aktif.',
    'teacher.colStudent': 'Siswa',
    'teacher.colLevel': 'Level',
    'teacher.colQuests': 'Misi',
    'teacher.colMastery': 'Penguasaan',
    'teacher.colLastActivity': 'Aktivitas Terakhir',
    'teacher.noRanking': 'ℹ️ EDUVERSE tidak membuat peringkat publik.',
    'teacher.masteryTitle': '📈 Penguasaan Konsep',
    'teacher.noMastery': 'Belum ada data penguasaan.',
    'teacher.colConcept': 'Konsep',
    'teacher.colStatus': 'Status',
    'teacher.colInteractions': 'Interaksi',
    'teacher.colCorrect': 'Benar',
    'teacher.colWrong': 'Salah',
    'teacher.misconceptionsTitle': '💡 Miskonsepsi Terdeteksi',
    'teacher.noMisconceptions': 'Belum ada miskonsepsi terdeteksi.',
    'teacher.colMisconception': 'Miskonsepsi',
    'teacher.colDescription': 'Deskripsi',
    'teacher.colFrequency': 'Frekuensi',
    'teacher.colStudents': 'Siswa',
    'teacher.colSuggestion': 'Saran Pendampingan',
    'teacher.trendsTitle': '📉 Tren Belajar Mingguan',
    'teacher.answersCount': '{n} jawaban',
    'teacher.hintsTitle': '💬 Penggunaan Petunjuk per Konsep',
    'teacher.noHints': 'Belum ada petunjuk yang digunakan.',
    'teacher.colHintCount': 'Jumlah Petunjuk',
    'teacher.questionsTitle': '❓ Analitik Soal',
    'teacher.noQuestions': 'Belum ada soal yang dijawab.',
    'teacher.colQuestion': 'Soal',
    'teacher.colCorrectCount': 'Benar',
    'teacher.colIncorrectCount': 'Salah',
    'teacher.colHintsCount': 'Petunjuk',
    'teacher.colTotal': 'Total',
    'teacher.cardsTitle': '🃏 Kartu Pengetahuan',
    'teacher.colCard': 'Kartu',
    'teacher.colOwned': 'Dimiliki',
    'teacher.colViews': 'Dilihat',
    'teacher.reportsTitle': '📄 Laporan',
    'teacher.reportStudent': 'Laporan Siswa',
    'teacher.reportStudentDesc': 'Level, XP, penguasaan, lencana, kartu.',
    'teacher.reportClass': 'Laporan Kelas',
    'teacher.reportClassDesc': 'Penguasaan & aktivitas agregat.',
    'teacher.reportQuest': 'Laporan Misi',
    'teacher.reportQuestDesc': 'Tingkat penyelesaian & kesulitan.',
    'teacher.exportCSV': 'Unduh CSV',
    'teacher.exportJSON': 'Unduh JSON',
    'teacher.exportBackup': '📦 Unduh Backup Semua Data',
    'teacher.importBackup': '📥 Impor Data Siswa',
    'teacher.importHint': 'Kumpulkan file JSON dari siswa, lalu impor di sini untuk menggabungkan data.',
    'teacher.privacyNote': '📌 Semua ekspor menghormati privasi siswa — tidak ada peringkat publik.',
    'teacher.importSuccess': '✅ Berhasil mengimpor {n} file siswa.',
    'teacher.importFailed': '❌ Gagal mengimpor: {reason}',

    // ── Feedback ────────────────────────────
    'feedback.correct': 'Benar',
    'feedback.incorrect': 'Belum Tepat',
    'feedback.misconception': 'Miskonsepsi',
    'feedback.mastery': 'Penguasaan',

    // ── Feedback Panel ──────────────────────
    'feedback.continue': 'Lanjutkan →',
    'feedback.tryAgain': '↻ Coba Lagi',
    'feedback.misconceptionDetected': 'Miskonsepsi terdeteksi: {id}',

    // ── Reward Panel ────────────────────────
    'reward.title': '🎉 Misi Selesai!',
    'reward.replayInfo': 'Hadiah ulangan — XP berkurang, penguasaan tetap diperbarui.',
    'reward.unlocked': 'Terbuka',
    'reward.continue': 'Lanjutkan →',

    // ── Gameplay Extra ──────────────────────
    'gameplay.q': 'Soal',
    'gameplay.of': 'dari',
    'gameplay.scoreLabel': 'Skor',

    // ── Knowledge Card detail ───────────────
    'card.keyConcept': '🧠 Konsep Kunci',
    'card.quickFact': '⚡ Fakta Singkat',
    'card.explanation': '📖 Penjelasan',
    'card.example': '🔎 Contoh',
    'card.remember': '💡 Ingat',
    'card.source': 'Sumber',
    'card.masteryDiscovered': 'Ditemukan',
    'card.masteryUnderstood': 'Dipahami',
    'card.masteryPracticed': 'Terlatih',
    'card.masteryMastered': 'Dikuasai'
  }
};

export function t(key, vars) {
  const dict = translations[currentLang] || {};
  let text = dict[key];

  if (text === undefined) {
    console.warn(`[i18n] Missing translation: "${key}"`);
    return key;
  }

  if (vars && typeof vars === 'object') {
    Object.keys(vars).forEach(k => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
    });
  }

  return text;
}

export function setLang(lang) {
  if (!translations[lang]) {
    console.warn(`[i18n] Unknown language: ${lang}`);
  }
}

export function getLang() {
  return currentLang;
}

export default { t, setLang, getLang };