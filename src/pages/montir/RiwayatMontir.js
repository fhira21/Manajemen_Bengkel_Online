import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SidebarMontir from "../../components/SidebarMontir";

export default function RiwayatMontir() {
  const [riwayat, setRiwayat] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const montirId = currentUser?.id;

  const fetchRiwayat = async () => {
    if (!montirId) return;
    setLoading(true);

    try {
      // Ambil semua services dulu
      const { data: allServices, error: serviceError } = await supabase
        .from("services")
        .select("id, nama");
      if (serviceError) throw serviceError;

      // Ambil semua booking montir dengan status "done"
      const { data: bookingsData, error: bookingError } = await supabase
        .from("bookings")
        .select(
          "id, nama, no_telepon, plat_no, tipe_kendaraan, catatan, catatan_pengerjaan, tgl_booking, status, jenis_service"
        )
        .eq("montir_id", montirId)
        .in("status", ["done"])
        .order("tgl_booking", { ascending: false });
      if (bookingError) throw bookingError;

      // Mapping jenis_service (ID array) jadi nama
      const bookingsWithServiceNames = bookingsData?.map((booking) => {
        if (Array.isArray(booking.jenis_service)) {
          const namaService = booking.jenis_service
            .map((id) => {
              const found = allServices?.find((s) => s.id === id);
              return found ? found.nama : id;
            })
            .filter(Boolean);
          return { ...booking, jenis_service_nama: namaService };
        } else if (booking.jenis_service) {
          return { ...booking, jenis_service_nama: [booking.jenis_service] };
        } else {
          return { ...booking, jenis_service_nama: [] };
        }
      });

      setRiwayat(bookingsWithServiceNames || []);
      setFilteredData(bookingsWithServiceNames || []);
    } catch (err) {
      console.error("Gagal mengambil riwayat:", err);
      setRiwayat([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, [montirId]);

  // Filter search + tanggal
  useEffect(() => {
    let filtered = riwayat;

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.plat_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (Array.isArray(item.jenis_service_nama) &&
            item.jenis_service_nama.some((s) =>
              s.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    if (startDate) {
      filtered = filtered.filter((item) => item.tgl_booking >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((item) => item.tgl_booking <= endDate);
    }

    setFilteredData(filtered);
  }, [searchTerm, startDate, endDate, riwayat]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <SidebarMontir />

      {/* Konten utama */}
      <div className="flex-1 md:ml-64 p-4 md:p-6 transition-all duration-300">
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">
          Riwayat Service Saya
        </h1>

        {/* Filter & Search */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="flex flex-col">
              <label className="block text-sm text-gray-600 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm w-full md:w-48"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm text-gray-600 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm w-full md:w-48"
              />
            </div>
          </div>

          <div className="flex flex-col w-full md:w-64">
            <label className="block text-sm text-gray-600 mb-1">
              Cari (Nama / Plat No / Service)
            </label>
            <input
              type="text"
              placeholder="Contoh: Budi / AB1234CD / Tune Up"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
        </div>

        {/* Tabel Riwayat */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          {loading ? (
            <p className="p-4 text-gray-500">Memuat data...</p>
          ) : filteredData.length === 0 ? (
            <p className="p-4 text-gray-500">
              Tidak ada riwayat service ditemukan.
            </p>
          ) : (
            <table className="min-w-full text-sm table-auto">
              <thead className="bg-blue-100 text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Nama Pemilik</th>
                  <th className="px-4 py-3 text-left">Plat No</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    Tipe Kendaraan
                  </th>
                  <th className="px-4 py-3 text-left">Jenis Service</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    Catatan Pemilik
                  </th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    Catatan Pengerjaan
                  </th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2">{item.tgl_booking}</td>
                    <td className="px-4 py-2 font-medium text-gray-800">
                      {item.nama}
                    </td>
                    <td className="px-4 py-2">{item.plat_no}</td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      {item.tipe_kendaraan}
                    </td>
                    <td className="px-4 py-2">
                      {Array.isArray(item.jenis_service_nama) &&
                      item.jenis_service_nama.length > 0
                        ? item.jenis_service_nama.join(", ")
                        : "-"}
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      {item.catatan
                        ? item.catatan.length > 40
                          ? item.catatan.slice(0, 40) + "..."
                          : item.catatan
                        : "-"}
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      {item.catatan_pengerjaan || "-"}
                    </td>
                    <td className="px-4 py-2 text-green-600 font-semibold capitalize">
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
