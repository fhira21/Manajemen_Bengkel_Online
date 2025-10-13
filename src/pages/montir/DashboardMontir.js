import React, { useEffect, useState } from "react";
import SidebarMontir from "../../components/SidebarMontir";
import { supabase } from "../../lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardMontir = () => {
  const [summary, setSummary] = useState({
    total_selesai_bulan_ini: 0,
    total_service_hari_ini: 0,
    total_akan_datang: 0,
  });
  const [todayBookings, setTodayBookings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCatatanPengerjaan, setSelectedCatatanPengerjaan] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const montirId = currentUser?.id;

  useEffect(() => {
    if (!montirId) return;
    fetchDashboardData();
  }, [montirId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: summaryData } = await supabase
        .from("view_dashboard_montir_summary")
        .select("*")
        .eq("montir_id", montirId)
        .single();

      setSummary({
        total_selesai_bulan_ini: summaryData?.total_selesai_bulan_ini || 0,
        total_service_hari_ini: summaryData?.total_service_hari_ini || 0,
        total_akan_datang: summaryData?.total_akan_datang || 0,
      });

      const { data: allServices } = await supabase.from("services").select("id, nama");

      const today = new Date().toISOString().split("T")[0];
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(
          "id, nama, no_telepon, plat_no, jenis_service, catatan, catatan_pengerjaan, tgl_booking, status"
        )
        .eq("montir_id", montirId)
        .eq("tgl_booking", today);

      const bookingsWithServiceNames = bookingsData?.map((booking) => {
        if (Array.isArray(booking.jenis_service)) {
          const namaService = booking.jenis_service
            .map((id) => {
              const found = allServices?.find((s) => s.id === id);
              return found ? found.nama : id;
            })
            .filter(Boolean);
          return { ...booking, jenis_service_nama: namaService };
        } else {
          return { ...booking, jenis_service_nama: [booking.jenis_service] };
        }
      });

      setTodayBookings(bookingsWithServiceNames || []);

      const { data: monthlyData } = await supabase.rpc("get_montir_service_chart", {
        montir_uuid: montirId,
      });

      setChartData(monthlyData || []);
    } catch (err) {
      console.error("Error fetching montir dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (booking) => {
    setSelectedBooking(booking);
    setSelectedStatus(booking.status || "pending");
    setSelectedCatatanPengerjaan(booking.catatan_pengerjaan || "");
  };

  const handleSaveUpdate = async () => {
    const { error } = await supabase
      .from("bookings")
      .update({
        status: selectedStatus,
        catatan_pengerjaan: selectedCatatanPengerjaan,
      })
      .eq("id", selectedBooking.id);

    if (!error) {
      alert("Data berhasil diperbarui!");
      setSelectedBooking(null);
      fetchDashboardData();
    } else {
      console.error(error);
      alert("Gagal menyimpan perubahan!");
    }
  };

  const handleWhatsApp = (no_telepon, nama, plat_no) => {
    if (!no_telepon) {
      alert("Nomor WhatsApp pelanggan tidak tersedia!");
      return;
    }
    let formattedNumber = no_telepon.replace(/[^0-9]/g, "");
    if (formattedNumber.startsWith("0")) formattedNumber = "62" + formattedNumber.slice(1);
    else if (formattedNumber.startsWith("+62")) formattedNumber = formattedNumber.replace("+", "");
    else if (!formattedNumber.startsWith("62")) formattedNumber = "62" + formattedNumber;

    const pesan = `Halo ${nama}, ini dari bengkel kami.\n\nTerkait kendaraan dengan plat ${plat_no}, kami ingin mengonfirmasi pengerjaan/service yang sedang dilakukan.`;
    window.open(`https://wa.me/${formattedNumber}?text=${encodeURIComponent(pesan)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SidebarMontir />
      <div className="flex-1 md:ml-64 p-4 md:p-6 transition-all duration-300">
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">
          Dashboard Montir
        </h1>

        {/* Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Sudah Diservis Bulan Ini</p>
            <h2 className="text-3xl font-bold text-green-600">
              {summary.total_selesai_bulan_ini}
            </h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Total Service Bulan Ini</p>
            <h2 className="text-3xl font-bold text-blue-600">{summary.total_akan_datang}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Service Hari Ini</p>
            <h2 className="text-3xl font-bold text-orange-600">{summary.total_service_hari_ini}</h2>
          </div>
        </div>

        {/* Grafik Bulanan */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Grafik Service Bulanan</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week_label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_service" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                {loading ? "Memuat grafik..." : "Tidak ada data grafik"}
              </div>
            )}
          </div>
        </div>

        {/* Tabel Service Hari Ini */}
        <div className="bg-white shadow rounded-lg p-4 md:p-6 mt-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Service yang Dikerjakan Hari Ini</h2>
          {todayBookings.length === 0 ? (
            <p className="text-gray-500">Belum ada service untuk hari ini.</p>
          ) : (
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Plat No
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Nama
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Jenis Service
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Catatan (Dari Pelanggan)
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {todayBookings.map((booking) => (
                  <tr key={booking.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{booking.plat_no}</td>
                    <td className="px-4 py-2">{booking.nama}</td>
                    <td className="px-4 py-2">
                      {Array.isArray(booking.jenis_service_nama)
                        ? booking.jenis_service_nama.join(", ")
                        : booking.jenis_service_nama}
                    </td>
                    <td className="px-4 py-2">
                      {booking.catatan
                        ? booking.catatan.length > 40
                          ? booking.catatan.slice(0, 40) + "..."
                          : booking.catatan
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button onClick={() => handleUpdate(booking)} className="text-blue-600 hover:underline">
                        Update
                      </button>
                      <button
                        onClick={() => handleWhatsApp(booking.no_telepon, booking.nama, booking.plat_no)}
                        className="text-green-600 hover:underline"
                      >
                        WA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Update */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
              <h3 className="text-lg font-semibold mb-4">Update Pengerjaan</h3>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>Plat No:</strong> {selectedBooking.plat_no}
                </p>
                <p>
                  <strong>Nama:</strong> {selectedBooking.nama}
                </p>
                <p>
                  <strong>Jenis Service:</strong>{" "}
                  {Array.isArray(selectedBooking.jenis_service_nama)
                    ? selectedBooking.jenis_service_nama.join(", ")
                    : selectedBooking.jenis_service_nama}
                </p>
                <p>
                  <strong>Catatan Pelanggan:</strong> {selectedBooking.catatan || "-"}
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Catatan Pengerjaan (Dari Montir)</label>
                <textarea
                  className="w-full border rounded px-3 py-2 h-24"
                  value={selectedCatatanPengerjaan || ""}
                  onChange={(e) => setSelectedCatatanPengerjaan(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => setSelectedBooking(null)} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
                  Batal
                </button>
                <button onClick={handleSaveUpdate} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMontir;
