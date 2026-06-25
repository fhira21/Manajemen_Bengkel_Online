import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SidebarMontir from "../../components/SidebarMontir";
import { FiSearch, FiFilter, FiCalendar } from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../../components/ui/skeleton";

export default function RiwayatMontir() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const montirId = currentUser?.id;

  const fetchRiwayat = async () => {
    if (!montirId) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("montir_service_history")
        .select("*")
        .eq("montir_id", montirId)
        .order("booking_date", { ascending: false });

      if (error) {
        console.error("Error fetching montir_service_history:", error.message);
        setRiwayat([]);
      } else {
        setRiwayat(data || []);
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat:", err);
      setRiwayat([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, [montirId]);

  // Apply Client-Side Filters
  const filteredData = riwayat.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.plate_number?.toLowerCase().includes(term) ||
      item.customer_name?.toLowerCase().includes(term) ||
      item.vehicle_name?.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    const itemDate = item.booking_date ? item.booking_date.split("T")[0] : null;
    const matchesStart = startDate ? itemDate >= startDate : true;
    const matchesEnd = endDate ? itemDate <= endDate : true;

    return matchesSearch && matchesStatus && matchesStart && matchesEnd;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "done": return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold shadow-sm">Selesai</span>;
      case "canceled": return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold shadow-sm">Batal</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold shadow-sm">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <SidebarMontir />

      <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300 w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Riwayat Service
          </h1>
          <p className="text-gray-500 mt-1">
            Daftar lengkap pekerjaan yang telah diselesaikan atau dibatalkan.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Controls Header */}
          <div className="p-5 border-b border-gray-100 bg-white">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari pelanggan, kendaraan, atau plat nomor..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-5 py-2.5 rounded-xl transition-colors text-sm font-medium text-gray-700 w-full md:w-auto"
              >
                <FiFilter /> {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dari Tanggal</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sampai Tanggal</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status Pekerjaan</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="all">Semua Status</option>
                        <option value="done">Selesai</option>
                        <option value="canceled">Batal</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pelanggan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kendaraan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Layanan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4"><Skeleton className="h-6 w-full" /></td>
                    </tr>
                  ))
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Tidak ada riwayat pekerjaan yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.booking_id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                          <FiCalendar className="text-blue-600" />
                          {new Date(item.booking_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {item.customer_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900">{item.customer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2 text-gray-800 font-medium"><FaCar className="text-gray-400" /> {item.vehicle_name}</span>
                          <span className="font-mono text-xs font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200 mt-1 inline-block w-max">
                            {item.plate_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 line-clamp-2 max-w-xs">{item.service_list || "-"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-4"><Skeleton className="h-24 w-full rounded-xl" /></div>
              ))
            ) : filteredData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Tidak ada riwayat pekerjaan.
              </div>
            ) : (
              filteredData.map((item) => (
                <div key={item.booking_id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {item.customer_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{item.customer_name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <FiCalendar /> {new Date(item.booking_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-800 flex items-center gap-1.5"><FaCar className="text-gray-400" /> {item.vehicle_name}</p>
                      <span className="font-mono text-xs font-bold bg-white px-2 py-1 rounded border border-gray-200">
                        {item.plate_number}
                      </span>
                    </div>
                    {item.service_list && (
                      <p className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                        <strong>Layanan:</strong> {item.service_list}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
