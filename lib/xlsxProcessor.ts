// File: lib/xlsxProcessor.ts

import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient'; // Menggunakan klien Supabase dari file sebelumnya

// Mendefinisikan tipe data untuk baris PTK agar kode lebih aman
type PtkRow = {
  nama: string | null;
  nik: string | null;
  nuptk: string | null;
  nip: string | null;
  status_kepegawaian: string | null;
  pangkat_gol: string | null;
  jenis_ptk: string | null;
  jabatan_ptk: string | null;
  pendidikan: string | null;
  bidang_studi_sertifikasi: string | null;
  tempat_tugas: string | null;
  npsn: string | null;
  kecamatan: string | null;
  jabatan_kepsek: boolean;
};

/**
 * Fungsi untuk menangani unggahan file, memproses data, dan menyimpannya ke Supabase.
 * @param {File} file - File XLSX yang diunggah oleh pengguna.
 * @param {'replace' | 'append'} uploadOption - Opsi untuk mengganti data lama atau menambahkan data baru.
 */
export async function processAndUploadXLSX(file: File, uploadOption: 'replace' | 'append'): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = event?.target?.result;
        if (!data) {
          return reject(new Error("Gagal membaca file."));
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonRawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headers: string[] = jsonRawData[0];
        const rows = jsonRawData.slice(1);

        const cleanData: PtkRow[] = rows.map(row => {
          const mappedRow: PtkRow = {
            nama: row[headers.indexOf('Nama')] || null,
            nik: row[headers.indexOf('NIK')] || null,
            nuptk: row[headers.indexOf('NUPTK')] || null,
            nip: row[headers.indexOf('NIP')] || null,
            status_kepegawaian: row[headers.indexOf('Status Kepegawaian')] || null,
            pangkat_gol: row[headers.indexOf('Pangkat/Gol')] || null,
            jenis_ptk: row[headers.indexOf('Jenis PTK')] || null,
            jabatan_ptk: row[headers.indexOf('Jabatan PTK')] || null,
            pendidikan: row[headers.indexOf('Pendidikan')] || null,
            bidang_studi_sertifikasi: row[headers.indexOf('Bidang Studi Sertifikasi')] || null,
            tempat_tugas: row[headers.indexOf('Tempat Tugas')] || null,
            npsn: row[headers.indexOf('NPSN')] || null,
            kecamatan: row[headers.indexOf('Kecamatan')] || null,
            jabatan_kepsek: (row[headers.indexOf('Jabatan Kepsek')] === 'Ya')
          };
          return mappedRow;
        }).filter(row => row.nama && row.nama.trim() !== "");

        if (cleanData.length === 0) {
          return reject(new Error("Tidak ada data valid yang ditemukan di dalam file."));
        }
        
        if (uploadOption === 'replace') {
          console.log("Menghapus data lama...");
          const { error: deleteError } = await supabase.from('ptk_data').delete().neq('id', 0);
          if (deleteError) throw deleteError;
        }

        console.log(`Mengirim ${cleanData.length} baris data ke Supabase...`);
        const { error: insertError } = await supabase.from('ptk_data').insert(cleanData);
        if (insertError) throw insertError;

        resolve();

      } catch (error: any) {
        console.error('Terjadi kesalahan saat memproses file:', error);
        reject(new Error(error.message || "Terjadi kesalahan yang tidak diketahui."));
      }
    };

    reader.onerror = (error) => {
      console.error('Gagal membaca file:', error);
      reject(new Error('Gagal membaca file.'));
    };

    reader.readAsBinaryString(file);
  });
}