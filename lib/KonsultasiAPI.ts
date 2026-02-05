/**
 * Helper functions untuk menampilkan nama author dalam konsultasi
 * dengan logika anonymization berdasarkan role user
 */

interface UserRole {
  id?: number
  role?: string
}

/**
 * Get display name untuk author pertanyaan/jawaban
 * Logic:
 * - User sendiri: tampilkan nama mereka
 * - Author adalah BK/Konselor: tampilkan nama + (Konselor)
 * - Viewer adalah BK, author adalah siswa: tampilkan nama
 * - Viewer adalah siswa, author adalah siswa lain: "Siswa Lain" (anonymous)
 */
export const getDisplayAuthorName = (
  authorName: string,
  authorId?: string | number,
  authorRole?: string,
  currentUser?: UserRole,
  isCurrentUser?: boolean
): string => {
  const isBKUser = currentUser?.role && String(currentUser.role).toLowerCase().includes('bk')
  const authorIsBK = authorRole && (
    String(authorRole).toLowerCase().includes('bk') ||
    String(authorRole).toLowerCase().includes('konselor')
  )

  // Jika user sendiri
  if (isCurrentUser) {
    return authorName
  }

  // Jika author adalah konselor/BK
  if (authorIsBK) {
    return `${authorName} (Konselor)`
  }

  // Jika viewer adalah BK
  if (isBKUser) {
    return authorName
  }

  // Jika author adalah siswa lain dan viewer adalah siswa
  return 'Siswa Lain'
}

/**
 * Get display name untuk siswa (khusus untuk BK mendapatkan nama siswa)
 * Digunakan untuk menampilkan nama siswa pembuat pertanyaan di dashboard BK
 */
export const getDisplayStudentName = (
  studentName: string,
  studentRole?: string,
  currentUserRole?: string
): string => {
  const isBKUser = currentUserRole && String(currentUserRole).toLowerCase().includes('bk')
  const studentIsBK = studentRole && (
    String(studentRole).toLowerCase().includes('bk') ||
    String(studentRole).toLowerCase().includes('konselor')
  )

  // Jika student adalah BK/Konselor
  if (studentIsBK) {
    return `${studentName} (Konselor)`
  }

  // Jika viewer adalah BK, tampilkan nama siswa
  if (isBKUser) {
    return studentName
  }

  // Default tampilkan nama siswa
  return studentName
}
