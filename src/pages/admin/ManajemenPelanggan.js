import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarAdmin from "../../components/SidebarAdmin";
import { supabase } from "../../lib/supabaseClient";
import { FiSearch, FiMessageSquare, FiCalendar, FiUser, FiPhone } from "react-icons/fi";
import { FaCar } from "react-icons/fa";

const ManajemenPelanggan = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*")
        .order("tgl_booking", { ascending: false });

      if (!error) {
        const pelangganMap = new Map();
        bookings.forEach((item) => {
          if (!pelangganMap.has(item.plat_no)) {
            pelangganMap.set(item.plat_no, {
              ...item,
              total_booking: 1,
            });
          } else {
            const existing = pelangganMap.get(item.plat_no);
            existing.total_booking += 1;
          }
        });
        const pelangganUnik = Array.from(pelangganMap.values());
        setData(pelangganUnik);
        setFilteredData(pelangganUnik);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const hasil = data.filter((item) =>
      item.nama?.toLowerCase().includes(search.toLowerCase()) ||
      item.plat_no?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(hasil);
  }, [search, data]);

  const formatTanggal = (dateStr) => {
    const tgl = new Date(dateStr);
    return tgl.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const kirimPesanWA = (nama, no_telepon, plat_no, tipe_kendaraan, tgl_booking) => {
    const nomor = no_telepon.replace(/\D/g, "").replace(/^0/, "62");
    const pesan = `Halo ${nama}, kami dari Bengkel Volkswagen ingin mengingatkan bahwa kendaraan Anda dengan plat nomor ${plat_no} (${tipe_kendaraan}) terakhir diservis pada ${formatTanggal(
      tgl_booking
    )}. Sudah waktunya servis kembali, silakan booking melalui website kami atau hubungi kami untuk bantuan. Terima kasih!`;
    const url = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
    window.open(url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex"
    >
      <SidebarAdmin />

      <motion.main
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 md:ml-64 p-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <motion.h1
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-2xl md:text-3xl font-bold text-gray-800"
          >
            Manajemen Pelanggan
          </motion.h1>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau plat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Pelanggan Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"
              ></motion.div>
              <p className="mt-4 text-gray-600">Memuat data pelanggan...</p>
            </motion.div>
          ) : filteredData.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-gray-500"
            >
              {search ? "Tidak ada pelanggan yang sesuai" : "Tidak ada data pelanggan"}
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["No", "Nama", "Plat Nomor", "No Telepon", "Tipe Kendaraan", "Terakhir Servis", "Total Booking", "Aksi"].map(
                      (header, index) => (
                        <motion.th
                          key={header}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </motion.th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.nama}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.plat_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.no_telepon}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.tipe_kendaraan || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTanggal(item.tgl_booking)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.total_booking}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            kirimPesanWA(
                              item.nama,
                              item.no_telepon,
                              item.plat_no,
                              item.tipe_kendaraan,
                              item.tgl_booking
                            )
                          }
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <FiMessageSquare size={14} /> Kirim WA
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.main>
    </motion.div>
  );
};

export default ManajemenPelanggan;