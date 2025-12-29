/**
 * Utility functions untuk Reservasi
 */

export const formatDate2 = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    in_counseling: 'Sedang Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    diterima: 'Diterima',
  };
  return labels[status] || status;
};

export const getStatusBadgeColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    in_counseling: 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-gray-100 text-gray-800',
    diterima: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const statusBadgeColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    in_counseling: 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

export const getTypeColor = (type: string) => {
    return type === 'chat' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
};

export  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_counseling':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
};

export const typeLabel = {
    chat: 'Sesi Chat',
    'tatap-muka': 'Tatap Muka',
};
