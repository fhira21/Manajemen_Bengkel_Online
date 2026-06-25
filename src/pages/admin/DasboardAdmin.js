import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import SidebarAdmin from "../../components/SidebarAdmin";
import Skeleton from "../../components/ui/skeleton";
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiClock, FiX, FiPhone, FiCalendar, FiUser, FiTool } from "react-icons/fi";
import { FaCar } from "react-icons/fa";

export default function DashboardAdmin() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [montirs, setMontirs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "tgl_booking",
    direction: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);

    let query = supabase
      .from("booking_dashboard_view")
      .select("*");

    if (dateFilter) {
      query = query.eq("tgl_booking", dateFilter);
    }

    query = query.order("tgl_booking", {
      ascending: true,
    });

    const { data, error } = await query;

    if (error) {
      console.error(error);
    } else {
      setBookings(data || []);
    }

    setLoading(false);
  };

  const fetchMontirs = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, nama_lengkap")
      .eq("role", "montir");

    if (error) console.error("Error fetching montirs:", error);
    else setMontirs(data || []);
  };

  const handleAssignMontir = async (
    bookingId,
    montirId
  ) => {
    const { error } = await supabase
      .from("bookings")
      .update({
        montir_id: montirId,
        status: montirId ? "assigned" : "pending",
      })
      .eq("id", bookingId);

    if (error) {
      console.error(error);
      return;
    }

    fetchBookings();
  };

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (
    bookingId,
    status
  ) => {
    const { error } = await supabase
      .from("bookings")
      .update({
        status,
      })
      .eq("id", bookingId);

    if (error) {
      console.error(error);
      return;
    }

    await fetchBookings();

    setSelectedBooking((prev) => ({
      ...prev,
      status,
    }));
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

  const filteredBookings =
    bookings.filter((booking) => {
      const term =
        searchTerm.toLowerCase();

      const matchesSearch =
        booking.customer_nama
          ?.toLowerCase()
          .includes(term) ||
        booking.no_telepon
          ?.toLowerCase()
          .includes(term) ||
        booking.plat_nomor
          ?.toLowerCase()
          .includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        booking.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  const getTotalBooking = () => bookings.length;
  const getStatusCount = (status) =>
    bookings.filter((b) => b.status === status).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending</span>;
      case "in_progress":
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">In Progress</span>;
      case "done":
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Selesai</span>;
      case "cancelled":
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Batal</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const hasActiveFilters = dateFilter || statusFilter !== "all" || searchTerm;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SidebarAdmin />

      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 w-full">
        <div className="max-w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Dashboard Admin
            </h1>
            <p className="text-gray-500 mt-1">
              Monitoring booking pelanggan dan penugasan montir.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col"
            >
              <h2 className="text-gray-500 text-sm font-medium">Total Booking</h2>
              <p className="text-3xl font-bold text-gray-800 mt-2">{getTotalBooking()}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col border-l-4 border-l-yellow-400"
            >
              <h2 className="text-gray-500 text-sm font-medium">Pending</h2>
              <p className="text-3xl font-bold text-gray-800 mt-2">{getStatusCount("pending")}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col border-l-4 border-l-blue-400"
            >
              <h2 className="text-gray-500 text-sm font-medium">In Progress</h2>
              <p className="text-3xl font-bold text-gray-800 mt-2">{getStatusCount("in_progress")}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col border-l-4 border-l-green-400"
            >
              <h2 className="text-gray-500 text-sm font-medium">Selesai</h2>
              <p className="text-3xl font-bold text-gray-800 mt-2">{getStatusCount("done")}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col border-l-4 border-l-red-400"
            >
              <h2 className="text-gray-500 text-sm font-medium">Batal</h2>
              <p className="text-3xl font-bold text-gray-800 mt-2">{getStatusCount("cancelled")}</p>
            </motion.div>
          </div>

          {/* Table / List View */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Header Controls */}
            <div className="p-5 border-b border-gray-100 bg-white">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari nama, plat no, telepon..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl transition-colors text-sm font-medium"
                    >
                      <FiX />
                      <span>Clear Filter</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl transition-colors text-sm font-medium text-gray-700"
                  >
                    <FiFilter />
                    <span>Filter</span>
                    {showFilters ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="all">Semua Status</option>
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Selesai</option>
                          <option value="cancelled">Batal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Filter Tanggal</label>
                        <input
                          type="date"
                          value={dateFilter || ""}
                          onChange={(e) => handleDateFilter(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {[
                      { key: "nama", label: "Pelanggan", sortable: true },
                      { key: "kendaraan", label: "Kendaraan", sortable: false },
                      { key: "tgl_booking", label: "Tanggal", sortable: true },
                      { key: "status", label: "Status", sortable: true },
                      { key: "montir", label: "Montir", sortable: false },
                      { key: "aksi", label: "Aksi", sortable: false },
                    ].map((header) => (
                      <th
                        key={header.key}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
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
                              <FiChevronDown className="text-gray-300" />
                            )
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-6 py-4"><Skeleton className="h-6 w-full" /></td>
                      </tr>
                    ))
                  ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                              {booking.customer_nama?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{booking.customer_nama}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><FiPhone /> {booking.no_telepon}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900 font-mono bg-gray-100 px-2 py-0.5 rounded inline-block text-xs border border-gray-200">
                              {booking.plat_nomor}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><FaCar /> {booking.merk} {booking.model}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-medium text-gray-800 flex items-center gap-1.5">
                            <FiCalendar className="text-gray-400" />
                            {new Date(booking.tgl_booking).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 ml-5">
                            {new Date(booking.tgl_booking).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FiTool className="text-gray-400" />
                            <select
                              value={booking.montir_id || ""}
                              onChange={(e) => handleAssignMontir(booking.id, e.target.value)}
                              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                            >
                              <option value="">Belum Ditugaskan</option>
                              {montirs.map((montir) => (
                                <option key={montir.id} value={montir.id}>
                                  {montir.nama_lengkap}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetail(booking)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <div className="bg-gray-100 p-3 rounded-full mb-3">
                            <FiSearch className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="font-medium">Tidak ada booking ditemukan</p>
                          <p className="text-sm text-gray-400 mt-1">Coba sesuaikan filter atau pencarian Anda.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                ))
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{booking.customer_nama}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><FiPhone className="text-xs" /> {booking.no_telepon}</p>
                      </div>
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          handleUpdateStatus(
                            booking.id,
                            e.target.value
                          )
                        }
                        className="border border-gray-200 rounded-lg px-2 py-1"
                      >
                        <option value="pending">
                          Pending
                        </option>

                        <option value="assigned">
                          Assigned
                        </option>

                        <option value="in_progress">
                          In Progress
                        </option>

                        <option value="done">
                          Selesai
                        </option>

                        <option value="cancelled">
                          Batal
                        </option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Kendaraan</p>
                        <p className="font-bold text-sm text-gray-800">{booking.merk} {booking.model}</p>
                        <p className="font-mono text-xs text-gray-600 mt-0.5 bg-gray-200 px-1.5 py-0.5 rounded inline-block">{booking.plat_nomor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Jadwal</p>
                        <p className="font-semibold text-sm text-gray-800">
                          {new Date(booking.tgl_booking).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {new Date(booking.tgl_booking).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Montir Bertugas</label>
                        <select
                          value={booking.montir_id || ""}
                          onChange={(e) => handleAssignMontir(booking.id, e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Pilih Montir...</option>
                          {montirs.map((montir) => (
                            <option key={montir.id} value={montir.id}>
                              {montir.nama_lengkap}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* <a
                        href={`/ admin / nota / ${booking.id}`}
                        className="w-full text-center text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 py-2.5 rounded-lg transition-colors border border-blue-100"
                      >
                        Lihat Nota Booking
                      </a> */}

                      <button
                        onClick={() => handleViewDetail(booking)}
                        className="w-full text-center text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 py-2.5 rounded-lg transition-colors border border-blue-100"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Tidak ada booking ditemukan
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showDetailModal &&
            selectedBooking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              >
                <motion.div
                  initial={{
                    scale: 0.95,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0.95,
                    opacity: 0,
                  }}
                  className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl"
                >
                  <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                      Detail Booking
                    </h2>

                    <button
                      onClick={() =>
                        setShowDetailModal(
                          false
                        )
                      }
                      className="text-gray-500 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-6 space-y-6">

                    {/* Pelanggan */}
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">
                        Pelanggan
                      </h3>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p>
                          <strong>Nama:</strong>{" "}
                          {
                            selectedBooking.customer_nama
                          }
                        </p>

                        <p>
                          <strong>Telepon:</strong>{" "}
                          {
                            selectedBooking.no_telepon
                          }
                        </p>
                      </div>
                    </div>

                    {/* Kendaraan */}
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">
                        Kendaraan
                      </h3>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p>
                          <strong>Plat:</strong>{" "}
                          {
                            selectedBooking.plat_nomor
                          }
                        </p>

                        <p>
                          <strong>Merk:</strong>{" "}
                          {selectedBooking.merk}
                        </p>

                        <p>
                          <strong>Model:</strong>{" "}
                          {selectedBooking.model}
                        </p>

                        <p>
                          <strong>Tipe:</strong>{" "}
                          {
                            selectedBooking.tipe_kendaraan
                          }
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">
                        Service Dipilih
                      </h3>

                      <div className="bg-gray-50 rounded-xl p-4">
                        {selectedBooking.service_list
                          ?.split(", ")
                          .map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                      </div>
                    </div>

                    {/* Booking */}
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">
                        Booking
                      </h3>

                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">

                        <p>
                          <strong>
                            Tanggal:
                          </strong>{" "}
                          {
                            selectedBooking.tgl_booking
                          }
                        </p>

                        <p>
                          <strong>
                            Catatan:
                          </strong>{" "}
                          {selectedBooking.catatan ||
                            "-"}
                        </p>

                        {/* Status */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Status
                          </label>

                          <select
                            value={
                              selectedBooking.status
                            }
                            onChange={(e) =>
                              handleUpdateStatus(
                                selectedBooking.id,
                                e.target.value
                              )
                            }
                            className="w-full border rounded-lg px-3 py-2"
                          >
                            <option value="pending">
                              Pending
                            </option>

                            <option value="assigned">
                              Assigned
                            </option>

                            <option value="in_progress">
                              In Progress
                            </option>

                            <option value="done">
                              Selesai
                            </option>

                            <option value="cancelled">
                              Batal
                            </option>
                          </select>
                        </div>

                        {/* Montir */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Montir
                          </label>

                          <select
                            value={
                              selectedBooking.montir_id ||
                              ""
                            }
                            onChange={async (
                              e
                            ) => {
                              await handleAssignMontir(
                                selectedBooking.id,
                                e.target.value
                              );

                              const montir =
                                montirs.find(
                                  (m) =>
                                    m.id ===
                                    e.target.value
                                );

                              setSelectedBooking(
                                (
                                  prev
                                ) => ({
                                  ...prev,
                                  montir_id:
                                    e.target.value,
                                  montir_nama:
                                    montir?.nama_lengkap,
                                })
                              );
                            }}
                            className="w-full border rounded-lg px-3 py-2"
                          >
                            <option value="">
                              Belum Ditugaskan
                            </option>

                            {montirs.map(
                              (montir) => (
                                <option
                                  key={
                                    montir.id
                                  }
                                  value={
                                    montir.id
                                  }
                                >
                                  {
                                    montir.nama_lengkap
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                      </div>
                    </div>

                  </div>

                  <div className="border-t p-6 flex justify-end gap-3">

                    <button
                      onClick={() =>
                        setShowDetailModal(
                          false
                        )
                      }
                      className="px-4 py-2 border rounded-lg"
                    >
                      Tutup
                    </button>

                    <a
                      href={`/admin/create-invoice/${selectedBooking.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Buat Nota
                    </a>

                  </div>
                </motion.div>
              </motion.div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}