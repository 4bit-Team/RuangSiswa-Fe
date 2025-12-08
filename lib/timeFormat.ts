/**
 * Format timestamp menjadi relative time (1 detik lalu, 5 menit lalu, dll)
 * Jika lebih dari 1 minggu, tampilkan format tanggal bulan tahun
 */
export const formatTimeRelative = (date: Date | string): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  // Jika tanggal invalid, return format default
  if (isNaN(targetDate.getTime())) {
    return 'Waktu tidak valid';
  }

  const secondsAgo = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  // Jika lebih dari 1 minggu, tampilkan format tanggal lengkap
  if (secondsAgo >= 7 * 24 * 60 * 60) {
    return formatDateFull(targetDate);
  }

  // Detik
  if (secondsAgo < 60) {
    return secondsAgo <= 1 ? '1 detik lalu' : `${secondsAgo} detik lalu`;
  }

  // Menit
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return minutesAgo === 1 ? '1 menit lalu' : `${minutesAgo} menit lalu`;
  }

  // Jam
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return hoursAgo === 1 ? '1 jam lalu' : `${hoursAgo} jam lalu`;
  }

  // Hari
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) {
    return daysAgo === 1 ? '1 hari lalu' : `${daysAgo} hari lalu`;
  }

  return formatDateFull(targetDate);
};

/**
 * Format date menjadi: tanggal bulan tahun (contoh: 25 Nov 2025)
 */
export const formatDateFull = (date: Date | string): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(targetDate.getTime())) {
    return 'Tanggal tidak valid';
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const day = targetDate.getDate();
  const month = months[targetDate.getMonth()];
  const year = targetDate.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Format datetime lengkap dengan jam (contoh: 25 Nov 2025 14:30)
 */
export const formatDateTime = (date: Date | string): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(targetDate.getTime())) {
    return 'Waktu tidak valid';
  }

  const dateStr = formatDateFull(targetDate);
  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');

  return `${dateStr} ${hours}:${minutes}`;
};
