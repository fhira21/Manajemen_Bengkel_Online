import React, { useEffect, useState, useCallback } from "react";
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
import { FiClock, FiCheckCircle, FiTool, FiCalendar, FiUser, FiPhone, FiInfo, FiFileText, FiX } from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const DashboardMontir = () => {
  const [summary, setSummary] = useState({
    todays_jobs: 0,
    in_progress_jobs: 0,
    completed_this_month: 0,
    total_assigned_this_month: 0,
  });
  const [todayBookings, setTodayBookings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const montirId = currentUser?.id;

  console.log("Current User:", currentUser);
  console.log("Montir ID:", montirId);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Summary KPI
      const { data: summaryData, error: summaryError } = await supabase
        .from("dashboard_montir_summary")
        .select("*")
        .eq("montir_id", montirId)
        .single();

      console.log("SUMMARY DATA:", summaryData);
      console.log("SUMMARY ERROR:", summaryError);

      if (summaryData) {
        setSummary({
          todays_jobs: summaryData.service_hari_ini || 0,
          in_progress_jobs: summaryData.sedang_dikerjakan || 0,
          completed_this_month: summaryData.selesai_bulan_ini || 0,
          total_assigned_this_month:
            summaryData.total_pekerjaan_bulan_ini || 0,
        });
      }

      // Fetch Today's Bookings
      const { data: bookingsData, error: bookingError } = await supabase
        .from("dashboard_montir_today_jobs")
        .select("*")
        .eq("montir_id", montirId)
        .order("tgl_booking", { ascending: true });

      console.log("BOOKINGS:", bookingsData);
      console.log("BOOKING ERROR:", bookingError);

      setTodayBookings(bookingsData || []);

      // Fetch Chart Data
      const { data: monthlyData, error: chartError } = await supabase
        .from("dashboard_montir_chart")
        .select("*")
        .eq("montir_id", montirId);

      console.log("CHART DATA:", monthlyData);
      console.log("CHART ERROR:", chartError);

      setChartData(monthlyData || []);
    } catch (err) {
      console.error("Error fetching montir dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [montirId]);

  useEffect(() => {
    if (!montirId) return;
    fetchDashboardData();
  }, [montirId, fetchDashboardData]);

  const handleUpdate = (booking) => {
    setSelectedBooking(booking);
    setSelectedStatus(booking.status || "pending");
  };

  const handleSaveUpdate = async () => {
    if (!selectedBooking?.id) return;

    const { error } = await supabase
      .from("bookings")
      .update({
        status: selectedStatus,
      })
      .eq("id", selectedBooking.id);

    if (!error) {
      alert("Status berhasil diperbarui!");
      setSelectedBooking(null);
      fetchDashboardData();
    } else {
      console.error(error);
      alert("Gagal menyimpan perubahan!");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold shadow-sm">Pending</span>;
      case "in_progress": return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold shadow-sm">In Progress</span>;
      case "done": return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold shadow-sm">Selesai</span>;
      case "canceled": return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold shadow-sm">Batal</span>;
      case "assigned":
        return (
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold shadow-sm">
            Ditugaskan
          </span>
        );
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold shadow-sm">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <SidebarMontir />

      <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300 w-full max-w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Dashboard Montir
          </h1>
          <p className="text-gray-500 mt-1">
            Selamat bekerja. Berikut adalah ringkasan tugas Anda.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg"><FiCalendar className="text-xl" /></div>
              <p className="text-sm font-semibold text-gray-500">Tugas Hari Ini</p>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mt-2">{summary.todays_jobs}</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><FiTool className="text-xl" /></div>
              <p className="text-sm font-semibold text-gray-500">Sedang Dikerjakan</p>
            </div>
            <h2 className="text-3xl font-black text-blue-600 mt-2">{summary.in_progress_jobs}</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-lg"><FiCheckCircle className="text-xl" /></div>
              <p className="text-sm font-semibold text-gray-500">Selesai Bulan Ini</p>
            </div>
            <h2 className="text-3xl font-black text-green-600 mt-2">{summary.completed_this_month}</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg"><FiInfo className="text-xl" /></div>
              <p className="text-sm font-semibold text-gray-500">Total Ditugaskan</p>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mt-2">{summary.total_assigned_this_month}</h2>
          </motion.div>
        </div>

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Today's Jobs List */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiClock className="text-blue-600" /> Pekerjaan Hari Ini
            </h3>

            {loading ? (
              <div className="text-center p-8 text-gray-500">Memuat pekerjaan...</div>
            ) : todayBookings.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm text-center">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <FiCheckCircle className="text-3xl text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Semua Beres!</h3>
                <p className="text-gray-500">Tidak ada jadwal booking untuk hari ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayBookings.map((booking) => {
                  return (
                    <motion.div
                      key={booking.id}
                      whileHover={{ y: -4 }}
                      className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="font-mono text-xs font-bold bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-200 mb-2 inline-block">
                              {booking.plat_nomor}
                            </span>
                            <h4 className="font-bold text-gray-900 text-lg">
                              {booking.merk} {booking.model}
                            </h4>                          </div>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiUser className="text-gray-400" /> <span className="font-medium text-gray-800">{booking.customer_nama}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiPhone className="text-gray-400" /> <span>{booking.no_telepon}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-gray-600 mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                            <FiTool className="text-blue-500 mt-0.5" />
                            <span className="font-medium text-blue-900 line-clamp-2">{booking.catatan || "Servis Umum"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        {booking.status === "assigned" && (
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setSelectedStatus("in_progress");
                              handleSaveUpdate();
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl text-sm transition-colors"
                          >
                            Mulai Kerja
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdate(booking)}
                          className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold py-2 rounded-xl text-sm transition-colors"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Monthly Chart */}
          <div className="xl:col-span-1">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCalendar className="text-purple-600" /> Performa Bulanan
            </h3>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="bulan"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="selesai" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  {loading ? "Memuat grafik..." : "Data belum tersedia"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Detail Modal */}
        <AnimatePresence>
          {selectedBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Detail Pekerjaan
                  </h3>
                  <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">
                    <FiX className="text-xl" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Customer Info */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2"><FiUser /> Informasi Pelanggan</h4>
                      <p className="text-sm text-gray-600 mb-1">Nama: <span className="font-semibold text-gray-900">{selectedBooking.customer_nama}</span></p>
                      <p className="text-sm text-gray-600 mb-1">Telepon: <span className="font-semibold text-gray-900">{selectedBooking.no_telepon}</span></p>
                      <p className="text-sm text-gray-600">Tgl Booking: <span className="font-semibold text-gray-900">{new Date(selectedBooking.tgl_booking).toLocaleDateString("id-ID")}</span></p>
                    </div>

                    {/* Vehicle Info */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FaCar /> Informasi Kendaraan</h4>
                      <p className="text-sm text-gray-600 mb-1">Plat Nomor: <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-900">{selectedBooking.plat_nomor}</span></p>
                      <p className="text-sm text-gray-600 mb-1">Kendaraan: <span className="font-semibold text-gray-900">{selectedBooking.tipe_kendaraan}</span></p>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">Status: {getStatusBadge(selectedStatus)}</p>
                    </div>
                  </div>

                  {/* Requested Services */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FiTool /> Layanan Diminta</h4>
                    <ul className="space-y-2">
                      {selectedBooking.catatan ? (
                        selectedBooking.catatan.split(",").map((service, idx) => (
                          <li key={idx} className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-medium text-gray-800 flex items-center gap-3">
                            <FiCheckCircle className="text-green-500" />
                            {service.trim()}
                          </li>
                        ))
                      ) : (
                        <li className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-medium text-gray-800">Servis Umum</li>
                      )}
                    </ul>
                  </div>

                  {/* Status Update Control */}
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Update Status Pengerjaan</label>
                    <select
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-semibold"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <a
                    href={`/montir/service-report/${selectedBooking.id}`}
                    className="w-full sm:w-auto px-5 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <FiFileText /> Buat/Lihat Service Report
                  </a>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => setSelectedBooking(null)} className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors">
                      Batal
                    </button>
                    <button onClick={handleSaveUpdate} className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all">
                      Simpan Status
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardMontir;
