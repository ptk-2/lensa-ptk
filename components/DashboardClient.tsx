// File: components/DashboardClient.tsx

"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, CartesianGrid, XAxis, YAxis 
} from 'recharts';
import { 
  useReactTable, getCoreRowModel, flexRender, ColumnDef 
} from '@tanstack/react-table';
import { 
  Users, UserCheck, UserPlus, GraduationCap, MapPin, Search, ChevronLeft, ChevronRight 
} from 'lucide-react';

// Tipe data untuk statistik
type StatsData = {
  status_kepegawaian: string | null;
  pendidikan: string | null;
};

// Tipe data untuk tabel (semua kolom)
type TableData = {
  [key: string]: unknown; // Menggunakan 'unknown' untuk keamanan tipe
};

const PIE_CHART_COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#ec4899", "#f59e0b", "#3b82f6"];

// Mendefinisikan tipe untuk props Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-lg border border-white/10 bg-gray-900/50 backdrop-blur-xl">
        <p className="label text-cyan-400">{`${label}`}</p>
        <p className="intro text-white">{`Jumlah : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

interface DashboardClientProps {
  statsData: StatsData[];
  tableData: TableData[];
  kecamatanOptions: string[];
  totalPages: number;
}


export default function DashboardClient({ statsData, tableData, kecamatanOptions, totalPages }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedKecamatan, setSelectedKecamatan] = useState(searchParams.get('kecamatan') || 'semua');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const currentPage = useMemo(() => parseInt(searchParams.get('page') || '1'), [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('kecamatan', selectedKecamatan);
    params.set('search', searchTerm);
    params.set('page', '1'); 
    router.push(`/dashboard?${params.toString()}`);
  }, [selectedKecamatan, searchTerm, router, searchParams]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard?${params.toString()}`);
  }

  // --- Proses Data untuk Grafik ---
  const statusCounts = statsData.reduce((acc, ptk) => {
    const status = ptk.status_kepegawaian || 'Lainnya';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const barChartData = Object.keys(statusCounts).map(name => ({ name, Jumlah: statusCounts[name] })).sort((a, b) => b.Jumlah - a.Jumlah);
  
  const pendidikanCounts = statsData.reduce((acc, ptk) => {
    const edu = ptk.pendidikan || 'Tidak Terdefinisi';
    acc[edu] = (acc[edu] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieChartData = Object.keys(pendidikanCounts).map(name => ({ name, value: pendidikanCounts[name] })).sort((a,b) => b.value - a.value);

  const totalPtk = statsData.length;
  const totalPns = statusCounts['PNS'] || 0;
  const totalPppk = statusCounts['PPPK'] || 0;
  
  // --- Konfigurasi Tabel ---
  const columns = useMemo<ColumnDef<TableData>[]>(
    () => [
      { accessorKey: 'nama', header: 'Nama' },
      { accessorKey: 'nip', header: 'NIP' },
      { accessorKey: 'status_kepegawaian', header: 'Status' },
      { accessorKey: 'tempat_tugas', header: 'Unit Kerja' },
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4 md:p-8">
      {/* Header dan Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          Dashboard PTK
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select 
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              className="pl-10 pr-4 py-2 text-white rounded-lg border border-white/20 bg-white/5 backdrop-blur-xl appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="semua">Semua Kecamatan</option>
              {kecamatanOptions.map(kec => (
                <option key={kec} value={kec}>{kec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kartu Metrik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <MetricCard icon={<Users size={48} />} title="Total PTK (Filter)" value={totalPtk} color="text-fuchsia-400" />
         <MetricCard icon={<UserCheck size={48} />} title="Total PNS" value={totalPns} color="text-cyan-400" />
         <MetricCard icon={<UserPlus size={48} />} title="Total PPPK" value={totalPppk} color="text-green-400" />
         <MetricCard icon={<GraduationCap size={48} />} title="Pendidikan S1" value={pendidikanCounts['S1'] || 0} color="text-amber-400" />
      </div>

      {/* Area Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3 p-6 rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-white mb-4">Distribusi Status Kepegawaian</h3>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs><linearGradient id="colorJumlah" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff10'}}/>
                <Legend wrapperStyle={{fontSize: "14px"}}/>
                <Bar dataKey="Jumlah" fill="url(#colorJumlah)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-2 p-6 rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-white mb-4">Distribusi Pendidikan</h3>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false}>
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabel Data PTK */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Data Detail PTK</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Cari Nama/NIP..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-white rounded-lg border border-white/20 bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm text-gray-300 uppercase border-b border-white/20">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4">{flexRender(header.column.columnDef.header, header.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-white/10 hover:bg-white/5">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-4 text-gray-200">{flexRender(cell.column.columnDef.cell, cell.getContext()) as React.ReactNode}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginasi */}
        <div className="flex items-center justify-end gap-4 mt-4 text-sm">
          <span>Halaman {currentPage} dari {totalPages}</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage <= 1}
              className="p-2 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage >= totalPages}
              className="p-2 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: number, color: string }) {
  return (
    <div className={`relative flex items-center gap-6 p-6 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl`}>
      <div className={color}>{icon}</div>
      <div>
        <h3 className="text-lg font-medium text-gray-300">{title}</h3>
        <p className="text-4xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  )
}