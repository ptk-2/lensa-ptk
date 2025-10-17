// File: src/app/page.tsx

"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { processAndUploadXLSX } from '../../lib/xlsxProcessor';
import Link from 'next/link';
import { UploadCloud, FileCheck, AlertTriangle, Loader } from 'lucide-react'; // We will install lucide-react

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [uploadOption, setUploadOption] = useState<'replace' | 'append'>('replace');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setStatusMessage('');
      setIsError(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage('Silakan pilih file terlebih dahulu.');
      setIsError(true);
      return;
    }

    setLoading(true);
    setStatusMessage('Memproses file...');
    setIsError(false);

    try {
      await processAndUploadXLSX(file, uploadOption);
      setStatusMessage(`Berhasil! ${file.name} telah diunggah.`);
      setFile(null);
    } catch (error: any) {
      setStatusMessage(`Gagal: ${error.message}`);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 transition-all duration-500">
      <div className="w-full max-w-2xl text-center">
        {/* Header */}
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          Lensa PTK
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          Visualisasikan Data Kepegawaian Anda dengan Tampilan Futuristik
        </p>
        
        <Link href="/dashboard" className="mt-4 inline-block text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
            Buka Dashboard →
        </Link>

        {/* Form Unggah with Glassmorphism Effect */}
        <form onSubmit={handleSubmit} className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <div className="relative mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-500/50 px-6 py-10 hover:border-cyan-400 transition-colors duration-300">
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex text-sm leading-6 text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-cyan-400 focus-within:outline-none hover:text-cyan-300">
                    <span>Unggah file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xlsx" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">atau seret dan letakkan</p>
                </div>
                {file && <p className="text-sm text-gray-300 mt-2 font-medium">{file.name}</p>}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
             <fieldset>
                <div className="flex items-center justify-center gap-x-6">
                    <label className="flex items-center gap-x-2 cursor-pointer">
                        <input type="radio" value="replace" checked={uploadOption === 'replace'} onChange={() => setUploadOption('replace')} className="radio radio-primary"/>
                        <span className="text-sm font-medium text-gray-300">Ganti Data</span>
                    </label>
                    <label className="flex items-center gap-x-2 cursor-pointer">
                        <input type="radio" value="append" checked={uploadOption === 'append'} onChange={() => setUploadOption('append')} className="radio radio-primary"/>
                        <span className="text-sm font-medium text-gray-300">Tambahkan Data</span>
                    </label>
                </div>
            </fieldset>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
          >
            {loading ? (
                <Loader className="animate-spin inline-block mr-2" />
            ) : (
                <UploadCloud className="inline-block mr-2 h-4 w-4" />
            )}
            {loading ? 'Memproses...' : 'Unggah dan Proses'}
          </button>

          {statusMessage && (
            <div className={`mt-4 flex items-center justify-center gap-2 text-sm ${isError ? 'text-red-400' : 'text-green-400'}`}>
              {isError ? <AlertTriangle size={16} /> : <FileCheck size={16} />}
              <span>{statusMessage}</span>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}