/**
 * EDUVERSE — Avatar View Component
 * Render avatar PNG idle dari folder assets/avatars berdasarkan profesi.
 * Komponen ini digunakan bersama oleh layar avatar, kota, profil, dan navbar.
 */
const AVATAR_ASSETS = {
  scientist: {
    folder: 'student-girl-1', file: 'character_femaleAdventurer_idle.png', label: 'Ilmuwan'
  },
  'digital-ranger': {
    folder: 'Robot', file: 'character_robot_idle.png', label: 'Digital Ranger'
  },
  explorer: {
    folder: 'student-boy-1', file: 'character_maleAdventurer_idle.png', label: 'Penjelajah'
  },
  'culture-explorer': {
    folder: 'student-boy-2', file: 'character_malePerson_idle.png', label: 'Penjelajah Budaya'
  },
  student: {
    folder: 'student-girl-2', file: 'character_femalePerson_idle.png', label: 'Pelajar'
  }
};

function resolveRole(avatar = {}) {
  const role = avatar.role || avatar.outfit;
  if (AVATAR_ASSETS[role]) return role;
  // Data avatar lama dipetakan ke avatar yang paling mendekati.
  if (role === 'scientist') return 'scientist';
  if (role === 'digital') return 'digital-ranger';
  if (role === 'culture') return 'culture-explorer';
  if (role === 'scholar') return 'student';
  return 'explorer';
}

export function createAvatar(avatar = {}, opts = {}) {
  const role = resolveRole(avatar);
  const asset = AVATAR_ASSETS[role];
  const size = Number(opts.size) || 110;
  const img = document.createElement('img');
  img.src = `assets/avatars/${encodeURIComponent(asset.folder)}/Poses%20HD/${asset.file}`;
  img.alt = `Avatar ${asset.label}`;
  img.width = size;
  img.height = Math.round(size * 4 / 3);
  img.draggable = false;
  img.decoding = 'async';
  img.loading = 'eager';
  img.style.display = 'block';
  img.style.width = `${size}px`;
  img.style.height = 'auto';
  img.style.maxWidth = '100%';
  img.style.objectFit = 'contain';
  img.style.imageRendering = 'auto';
  img.style.marginInline = 'auto';
  img.style.pointerEvents = 'none';
  img.onerror = () => {
    img.onerror = null;
    img.alt = `Aset avatar tidak ditemukan: ${asset.file}`;
    img.style.minHeight = `${Math.round(size * 4 / 3)}px`;
    img.style.background = 'rgba(124,92,252,.12)';
  };
  return img;
}

export function avatarHTML(avatar, opts = {}) {
  return createAvatar(avatar, opts).outerHTML;
}

export default { createAvatar, avatarHTML };
