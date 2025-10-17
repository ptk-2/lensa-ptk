// File: lib/xlsxProcessor.ts

import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';

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
        
        // PERUBAHAN 1: Mengganti `any[][]` menjadi `unknown[][]` yang lebih aman
        const jsonRawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        // Kita harus memastikan tipe data header adalah string
        const headers: string[] = jsonRawData[0] as string[];
        const rows = jsonRawData.slice(1);

        const cleanData: PtkRow[] = rows.map((row: unknown[]) => { // Menambahkan tipe pada parameter `row`
          const mappedRow: PtkRow = {
            nama: (row[headers.indexOf('Nama')] as string) || null,
            nik: (row[headers.indexOf('NIK')] as string) || null,
            nuptk: (row[headers.indexOf('NUPTK')] as string) || null,
            nip: (row[headers.indexOf('NIP')] as string) || null,
            status_kepegawaian: (row[headers.indexOf('Status Kepegawaian')] as string) || null,
            pangkat_gol: (row[headers.indexOf('Pangkat/Gol')] as string) || null,
            jenis_ptk: (row[headers.indexOf('Jenis PTK')] as string) || null,
            jabatan_ptk: (row[headers.indexOf('Jabatan PTK')] as string) || null,
            pendidikan: (row[headers.indexOf('Pendidikan')] as string) || null,
            bidang_studi_sertifikasi: (row[headers.indexOf('Bidang Studi Sertifikasi')] as string) || null,
            tempat_tugas: (row[headers.indexOf('Tempat Tugas')] as string) || null,
            npsn: (row[headers.indexOf('NPSN')] as string) || null,
            kecamatan: (row[headers.indexOf('Kecamatan')] as string) || null,
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

      } catch (error: unknown) { // PERUBAHAN 2: Mengganti `error: any` menjadi `error: unknown`
        console.error('Terjadi kesalahan saat memproses file:', error);
        // Menangani error dengan aman
        let message = "Terjadi kesalahan yang tidak diketahui.";
        if (error instanceof Error) {
            message = error.message;
        }
        reject(new Error(message));
      }
    };

    reader.onerror = (error) => {
      console.error('Gagal membaca file:', error);
      reject(new Error('Gagal membaca file.'));
    };

    reader.readAsBinaryString(file);
  });
}