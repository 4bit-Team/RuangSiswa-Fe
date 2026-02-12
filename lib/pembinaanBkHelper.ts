// Helper functions for BK Pembinaan Ringan approval with auto-create Laporan BK
import { approvePembinaanRingan } from '@/lib/api';
import { createLaporanBk } from '@/lib/laporanBkAPI';

interface PembinaanRingan {
  id: number;
  pembinaan_id: number;
  student_id: number;
  student_name: string;
  counselor_id: number;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  hasil_pembinaan: string;
  catatan_bk: string;
  sp_level?: 'SP1' | 'SP2' | null;
  pembinaan?: {
    id: number;
    siswas_name: string;
    siswas_id: number;
    kasus: string;
    class_name: string;
    class_id: number;
    point_pelanggaran?: {
      id: number;
      nama_pelanggaran: string;
    };
    walas_id?: number;
  };
}

/**
 * Approve pembinaan ringan dan auto-create laporan BK sebagai draft
 */
export async function approvePembinaanRinganAndCreateLaporan(
  pembinaanRingan: PembinaanRingan,
  bkUser: any, // Current BK user
  token: string | null
): Promise<any> {
  try {
    // 1. Approve pembinaan ringan
    console.log('🔄 Approving pembinaan ringan...');
    const approveResult = await approvePembinaanRingan(
      pembinaanRingan.id,
      {
        status: 'approved',
        bk_notes: pembinaanRingan.sp_level ? `Diberikan: ${pembinaanRingan.sp_level}` : undefined,
      },
      token
    );

    console.log('✅ Pembinaan ringan approved:', approveResult);

    // 2. Auto-create laporan BK as draft
    console.log('🔄 Creating laporan BK draft...');
    const laporanData = {
      reservasi_id: pembinaanRingan.id, // Link to pembinaan ringan
      pembinaan_id: pembinaanRingan.pembinaan_id,
      student_id: pembinaanRingan.student_id,
      student_name: pembinaanRingan.student_name,
      student_class: pembinaanRingan.pembinaan?.class_name || '',
      bk_id: bkUser?.id || pembinaanRingan.counselor_id,
      // Pre-fill with data from pembinaan
      namaKonseling: pembinaanRingan.student_name,
      tanggalDiprosesAiBk: new Date().toISOString().split('T')[0],
      deskripsiKasusMasalah: pembinaanRingan.pembinaan?.kasus || pembinaanRingan.hasil_pembinaan,
      guruBkYangMenanganiId: bkUser?.id || pembinaanRingan.counselor_id,
      // Initialize with empty fields that need to be filled
      bentukPenanganganSebelumnya: '',
      riwayatSpDanKasus: pembinaanRingan.sp_level ? `Diberikan: ${pembinaanRingan.sp_level}` : '',
      layananBk: '',
      followUpTindakanBk: '',
      penahanganGuruBkKonselingProsesPembinaan: '',
      pertemuanKe1: '',
      pertemuanKe2: '',
      pertemuanKe3: '',
      hasilPemantauanKeterangan: '',
      statusPerkembanganPesertaDidik: 'ongoing',
      keteranganKetersedianDokumen: '',
    };

    const laporanResult = await createLaporanBk(laporanData, token);
    console.log('✅ Laporan BK draft created:', laporanResult);

    return {
      success: true,
      pembinaanRingan: approveResult,
      laporan: laporanResult,
    };
  } catch (error) {
    console.error('❌ Error in approvePembinaanRinganAndCreateLaporan:', error);
    throw error;
  }
}
