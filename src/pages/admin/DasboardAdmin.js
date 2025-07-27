import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../../components/SidebarAdmin";
import Skeleton from "../../components/ui/skeleton";
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiClock, FiX } from "react-icons/fi";

export default function DashboardAdmin() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [montirs, setMontirs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "tgl_booking",
    direction: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    let query = supabase
      .from("bookings")
      .select(`
        id, nama, plat_no, no_telepon, tgl_booking, status, montir_id, tipe_kendaraan,
        booking_services (
          id,
          services (
            nama
          )
        ),
        users (
          nama_lengkap
        )
      `);

    // Apply date filter if set
    if (dateFilter) {
      const startOfDay = new Date(dateFilter);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateFilter);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('tgl_booking', startOfDay.toISOString())
        .lte('tgl_booking', endOfDay.toISOString());
    }

    // Apply sorting
    query = query.order(sortConfig.key, { ascending: sortConfig.direction === "asc" });

    const { data, error } = await query;

    if (error) console.error("Error fetching bookings:", error);
    else setBookings(data);
    setLoading(false);
  };

  const fetchMontirs = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, nama_lengkap")
      .eq("role", "montir");

    if (error) console.error("Error fetching montirs:", error);
    else setMontirs(data);
  };

  const handleAssignMontir = async (bookingId, montirId) => {
    const { error } = await supabase
      .from("bookings")
      .update({ montir_id: montirId })
      .eq("id", bookingId);

    if (error) {
      console.error("Gagal assign montir:", error);
    } else {
      fetchBookings();
    }
  };

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const handleDateFilter = (date) => {
    setDateFilter(date);
  };

  const clearFilters = () => {
    setDateFilter(null);
    setStatusFilter("all");
    setSearchTerm("");
  };

  useEffect(() => {
    fetchBookings();
    fetchMontirs();
  }, [sortConfig, dateFilter]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = booking.plat_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTotalBooking = () => bookings.length;
  const getStatusCount = (status) =>
    bookings.filter((b) => b.status === status).length;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const hasActiveFilters = dateFilter || statusFilter !== "all" || searchTerm;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6 text-gray-800"
        >
          Dashboard Admin
        </motion.h1>

        {/* Kartu ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-500"
          >
            <h2 className="text-gray-500 text-sm">Total Booking</h2>
            <p className="text-2xl font-semibold">{getTotalBooking()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-500"
          >
            <h2 className="text-gray-500 text-sm">Pending</h2>
            <p className="text-2xl font-semibold">{getStatusCount("pending")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-500"
          >
            <h2 className="text-gray-500 text-sm">Progress</h2>
            <p className="text-2xl font-semibold">{getStatusCount("in_progress")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-500"
          >
            <h2 className="text-gray-500 text-sm">Selesai</h2>
            <p className="text-2xl font-semibold">{getStatusCount("done")}</p>
          </motion.div>
        </div>

        {/* Tabel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan plat no atau nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              {hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg transition-colors"
                >
                  <FiX />
                  <span>Clear Filter</span>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                <FiFilter />
                <span>Filter</span>
                {showFilters ? <FiChevronUp /> : <FiChevronDown />}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Semua Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Selesai</option>
                      <option value="canceled">Batal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter Tanggal</label>
                    <input
                      type="date"
                      value={dateFilter || ""}
                      onChange={(e) => handleDateFilter(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {dateFilter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg"
            >
              <FiClock />
              <span>Menampilkan booking pada tanggal: {new Date(dateFilter).toLocaleDateString('id-ID')}</span>
              <button 
                onClick={() => setDateFilter(null)}
                className="ml-auto text-blue-600 hover:text-blue-800"
              >
                <FiX />
              </button>
            </motion.div>
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: "no", label: "No", sortable: false },
                    { key: "nama", label: "Nama", sortable: true },
                    { key: "plat_no", label: "Plat No", sortable: true },
                    { key: "tgl_booking", label: "Tgl Booking", sortable: true },
                    { key: "montir", label: "Montir", sortable: false },
                    { key: "status", label: "Status", sortable: true },
                    { key: "nota", label: "Nota", sortable: false }
                  ].map((header) => (
                    <th 
                      key={header.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => header.sortable && handleSort(header.key)}
                    >
                      <div className="flex items-center gap-1">
                        {header.label}
                        {header.sortable && (
                          sortConfig.key === header.key ? (
                            sortConfig.direction === "asc" ? (
                              <FiChevronUp className="text-blue-500" />
                            ) : (
                              <FiChevronDown className="text-blue-500" />
                            )
                          ) : (
                            <FiChevronDown className="text-gray-400" />
                          )
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.plat_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.tgl_booking).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={booking.montir_id || ""}
                          onChange={(e) => handleAssignMontir(booking.id, e.target.value)}
                          className="border rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Pilih montir</option>
                          {montirs.map((montir) => (
                            <option key={montir.id} value={montir.id}>
                              {montir.nama_lengkap}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status.split("_").join(" ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          href={`/admin/nota/${booking.id}`}
                          className="text-green-600 hover:text-green-800"
                        >
                          Buat Nota
                        </motion.a>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data yang sesuai dengan filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}