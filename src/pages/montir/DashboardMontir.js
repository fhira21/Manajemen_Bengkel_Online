import React from 'react';
import SidebarMontir from '../../components/SidebarMontir';

const DashboardMontir = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarMontir />

      {/* Konten */}
      <div className="ml-64 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Montir</h1>

        {/* Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Sudah Diservis Bulan Ini', color: 'text-green-600' },
            { title: 'Total Service Bulan Ini', color: 'text-blue-600' },
            { title: 'Service Hari Ini', color: 'text-orange-600' },
          ].map((box, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow text-center">
              <p className="text-sm text-gray-500">{box.title}</p>
              <h2 className={`text-3xl font-bold ${box.color}`}>0</h2>
            </div>
          ))}
        </div>

        {/* Grafik */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Grafik Service Bulanan</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">
            Grafik akan ditampilkan di sini
          </div>
        </div>

        {/* Tabel Booking Hari Ini */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Service yang Dikerjakan Hari Ini</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="p-2 border-b">Plat No</th>
                  <th className="p-2 border-b">Nama</th>
                  <th className="p-2 border-b">Service</th>
                  <th className="p-2 border-b">Catatan Pengerjaan</th>
                  <th className="p-2 border-b">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="p-2 border-b">B 1234 ABC</td>
                  <td className="p-2 border-b">Joko</td>
                  <td className="p-2 border-b">Ganti Oli, Tune Up</td>
                  <td className="p-2 border-b">-</td>
                  <td className="p-2 border-b">
                    <button className="text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
                {/* Data lain diisi dari Supabase */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMontir;
