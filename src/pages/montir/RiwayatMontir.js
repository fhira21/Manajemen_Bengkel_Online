import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SidebarMontir from "../../components/SidebarMontir";

export default function RiwayatMontir() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRiwayat = async () => {
    const montirId = localStorage.getItem("user_id");

    if (!montirId) {
      console.error("Montir belum login.");
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        tanggal_booking,
        plat_no,
        tipe_kendaraan,
        catatan_montir,
        status,
        jenis_service (nama)
      `)
      .eq("montir_id", montirId)
      .order("tanggal_booking", { ascending: false });

    if (error) {
      console.error("Gagal mengambil riwayat:", error.message);
    } else {
      setRiwayat(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarMontir />

      {/* Main content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Riwayat Service Saya</h1>

        {loading ? (
          <p>Memuat data...</p>
        ) : riwayat.length === 0 ? (
          <p className="text-gray-500">Belum ada riwayat service.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-blue-100 text-left text-sm font-semibold text-gray-700">
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Plat No</th>
                  <th className="px-4 py-2">Tipe</th>
                  <th className="px-4 py-2">Jenis Service</th>
                  <th className="px-4 py-2">Catatan</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((item) => (
                  <tr key={item.id} className="border-b text-sm">
                    <td className="px-4 py-2">{item.tanggal_booking}</td>
                    <td className="px-4 py-2">{item.plat_no}</td>
                    <td className="px-4 py-2">{item.tipe_kendaraan}</td>
                    <td className="px-4 py-2">
                      {item.jenis_service?.map((s) => s.nama).join(", ")}
                    </td>
                    <td className="px-4 py-2">{item.catatan_montir || "-"}</td>
                    <td className="px-4 py-2">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
