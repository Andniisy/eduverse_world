/**
 * EDUVERSE — Auth Module (V1: local, hashed passwords)
 * Menyimpan akun guru di localStorage dengan password SHA-256 hash.
 * 
 * CATATAN KEAMANAN:
 * Ini proteksi dasar untuk prototipe sekolah, BUKAN pengganti backend.
 * Untuk produksi, migrasi ke Firebase/Supabase.
 */

import { storage } from './storage.js';

const AUTH_KEY = 'teacherAuth';

/**
 * Akun guru default (password akan di-hash otomatis saat pertama kali login).
 * Password plaintext di sini HANYA untuk seed awal, tidak pernah disimpan.
 * 
 * Untuk menambah guru baru: tambahkan baris baru di sini.
 * Format: { email, password (plaintext seed), name }
 */
const SEED_TEACHERS = [
  { email: 'guru@eduverse.id',    password: 'eduverse2025',  name: 'Bu Guru Demo' },
  { email: 'kepsek@eduverse.id',  password: 'kepsek2025',    name: 'Pak Kepala Sekolah' },
  { email: 'admin@eduverse.id',   password: 'admin2025',     name: 'Admin Sekolah' }
];

class Auth {
  constructor() {
    this._ensureSeeded();
  }

  /** Bangun daftar guru dengan password ter-hash (hanya sekali). */
  _ensureSeeded() {
    const existing = storage.load(AUTH_KEY, null);
    if (existing) return;
    const teachers = SEED_TEACHERS.map(t => ({
      email: t.email,
      name: t.name,
      passwordHash: this._hashPassword(t.password)
    }));
    storage.save(AUTH_KEY, { teachers, session: null });
  }

  /**
   * Login guru.
   * @param {string} email
   * @param {string} password
   * @returns {{ success: boolean, teacher?: object, reason?: string }}
   */
  login(email, password) {
    if (!email || !password) {
      return { success: false, reason: 'Email dan password wajib diisi.' };
    }

    const data = storage.load(AUTH_KEY, { teachers: [], session: null });
    const teacher = data.teachers.find(
      t => t.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!teacher) {
      return { success: false, reason: 'Email tidak terdaftar.' };
    }

    const hash = this._hashPassword(password);
    if (hash !== teacher.passwordHash) {
      return { success: false, reason: 'Password salah.' };
    }

    // Simpan session (tanpa hash, hanya identitas)
    const session = {
      email: teacher.email,
      name: teacher.name,
      loginAt: new Date().toISOString()
    };
    storage.save(AUTH_KEY, { teachers: data.teachers, session });

    return { success: true, teacher: session };
  }

  /** Logout guru. */
  logout() {
    const data = storage.load(AUTH_KEY, { teachers: [], session: null });
    storage.save(AUTH_KEY, { teachers: data.teachers, session: null });
  }

  /** Guru saat ini (null jika belum login). */
  current() {
    const data = storage.load(AUTH_KEY, { teachers: [], session: null });
    return data.session || null;
  }

  /** Cek apakah sudah login. */
  isLoggedIn() {
    return !!this.current();
  }

  /** Ganti password guru yang sedang login. */
  changePassword(oldPw, newPw) {
    const session = this.current();
    if (!session) return { success: false, reason: 'Tidak ada sesi login.' };
    if (!newPw || newPw.length < 6) {
      return { success: false, reason: 'Password baru minimal 6 karakter.' };
    }

    const data = storage.load(AUTH_KEY, { teachers: [], session: null });
    const teacher = data.teachers.find(
      t => t.email.toLowerCase() === session.email.toLowerCase()
    );
    if (!teacher) return { success: false, reason: 'Guru tidak ditemukan.' };

    if (this._hashPassword(oldPw) !== teacher.passwordHash) {
      return { success: false, reason: 'Password lama salah.' };
    }

    teacher.passwordHash = this._hashPassword(newPw);
    storage.save(AUTH_KEY, { teachers: data.teachers, session });
    return { success: true };
  }

  /** SHA-256 hash sederhana (bukan untuk keamanan produksi). */
  _hashPassword(plain) {
    // Implementasi SHA-256 sinkron sederhana.
    // Untuk V1 sekolah ini cukup. Bisa ditingkatkan nanti.
    return this._sha256(plain + '::eduverse::salt');
  }

  /**
   * SHA-256 murni JS (tanpa library).
   * Referensi publik: algoritma SHA-256 standar FIPS 180-4.
   */
  _sha256(str) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = 'length';
    let i, j;
    let result = '';

    const words = [];
    const asciiBitLength = str[lengthProperty] * 8;

    let hash = this._sha256.h = this._sha256.h || [];
    let k = this._sha256.k = this._sha256.k || [];
    let primeCounter = k[lengthProperty];

    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    str += '\x80';
    while (str[lengthProperty] % 64 - 56) str += '\x00';
    for (i = 0; i < str[lengthProperty]; i++) {
      j = str.charCodeAt(i);
      if (j >> 8) return;
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;

    for (j = 0; j < words[lengthProperty];) {
      const w = words.slice(j, (j += 16));
      const oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2];
        const a = hash[0], e = hash[4];
        const temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ (~e & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0);
        const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        const b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : '') + b.toString(16);
      }
    }
    return result;
  }

  /** Daftar email guru (untuk info/dokumentasi, tanpa password). */
  listTeacherEmails() {
    const data = storage.load(AUTH_KEY, { teachers: [], session: null });
    return data.teachers.map(t => ({ email: t.email, name: t.name }));
  }
}

export const auth = new Auth();
export default auth;