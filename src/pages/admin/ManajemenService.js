import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarAdmin from "../../components/SidebarAdmin";
import { supabase } from "../../lib/supabaseClient";

const ManajemenService = () => {
  const [services, setServices] = useState([]);
  const [sortFilter, setSortFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    harga: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    setIsLoading(true);
    let query = supabase.from("services").select("*");

    if (sortFilter === "termurah") {
      query = query.order("harga", { ascending: true });
    } else if (sortFilter === "termahal") {
      query = query.order("harga", { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.error("Gagal mengambil data:", error.message);
    } else {
      setServices(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, [sortFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingService) {
      const { error } = await supabase
        .from("services")
        .update({
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          harga: Number(formData.harga),
        })
        .eq("id", editingService.id);

      if (error) {
        alert("Gagal mengedit data: " + error.message);
      } else {
        resetForm();
        fetchServices();
      }
    } else {
      const { error } = await supabase.from("services").insert([
        {
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          harga: Number(formData.harga),
        },
      ]);
      if (error) {
        alert("Gagal menambahkan data: " + error.message);
      } else {
        resetForm();
        fetchServices();
      }
    }
  };

  const resetForm = () => {
    setFormData({ nama: "", deskripsi: "", harga: "" });
    setEditingService(null);
    setShowModal(false);
  };

  const handleEdit = (service) => {
    setFormData({
      nama: service.nama,
      deskripsi: service.deskripsi,
      harga: service.harga,
    });
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert("ID tidak ditemukan!");
      return;
    }

    const konfirmasi = window.confirm("Apakah Anda yakin ingin menghapus layanan ini?");
    if (!konfirmasi) return;

    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;

      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Gagal menghapus data: " + err.message);
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.nama?.toLowerCase().includes(search.toLowerCase()) ||
      service.deskripsi?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex"
    >
      <SidebarAdmin />
      <main className="flex-1 md:ml-64 p-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-full mx-auto"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <motion.h1
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-3xl font-bold text-gray-800"
            >
              Manajemen Layanan Service
            </motion.h1>
            
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 5px 15px rgba(37, 99, 235, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-l flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tambah Service
            </motion.button>
          </div>

          {/* Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="bg-white p-3 rounded-md shadow-xs border border-gray-200 mb-4"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari layanan..."
                    className="w-full border border-gray-300 rounded pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-40">
                <select
                  value={sortFilter}
                  onChange={(e) => setSortFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Semua</option>
                  <option value="termurah">Termurah</option>
                  <option value="termahal">Termahal</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Table Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="bg-white border border-gray-200 rounded-md shadow-xs overflow-hidden"
          >
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 text-center"
              >
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    ease: "easeInOut"
                  }}
                  className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"
                ></motion.div>
                <motion.p 
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                  }}
                  className="mt-4 text-gray-600 text-sm"
                >
                  Memuat data layanan...
                </motion.p>
              </motion.div>
            ) : filteredServices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 text-center"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-700">Tidak ada layanan ditemukan</h3>
                  <p className="text-gray-500 mt-1 text-sm">Coba ubah kata kunci pencarian atau filter</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSearch("");
                      setSortFilter("");
                    }}
                    className="mt-4 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all text-sm"
                  >
                    Reset Pencarian
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["No", "Nama", "Deskripsi", "Harga", "Aksi"].map(
                        (header, index) => (
                          <motion.th
                            key={header}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              delay: 0.1 * index,
                              type: "spring",
                              stiffness: 200
                            }}
                            className="px-4 py-2 text-left font-medium text-gray-700"
                          >
                            {header}
                          </motion.th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredServices.map((service, index) => (
                      <motion.tr
                        key={service.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { 
                            delay: index * 0.03,
                            type: "spring",
                            stiffness: 200
                          }
                        }}
                        whileHover={{ 
                          backgroundColor: "rgba(249, 250, 251, 1)",
                          scale: 1.005,
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 whitespace-nowrap">{index + 1}</td>
                        <td className="px-4 py-2 whitespace-nowrap font-medium">{service.nama}</td>
                        <td className="px-4 py-2 max-w-xs truncate">{service.deskripsi || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-blue-600">
                          {formatPrice(service.harga)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ 
                                scale: 1.1,
                                color: "#2563eb"
                              }}
                              whileTap={{ scale: 0.9 }}
                              className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"
                              onClick={() => handleEdit(service)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ 
                                scale: 1.1,
                                color: "#dc2626"
                              }}
                              whileTap={{ scale: 0.9 }}
                              className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                              onClick={() => handleDelete(service.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Hapus
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Modal Form */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: 1,
                  transition: {
                    type: "spring",
                    damping: 25,
                    stiffness: 300
                  }
                }}
                exit={{ 
                  scale: 0.9,
                  opacity: 0,
                  transition: { duration: 0.2 }
                }}
                className="bg-white rounded-md shadow-lg w-full max-w-md"
              >
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {editingService ? "Edit Layanan" : "Tambah Layanan"}
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Layanan</label>
                    <input
                      type="text"
                      placeholder="Nama layanan"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
                    <input
                      type="number"
                      placeholder="Harga"
                      value={formData.harga}
                      onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea
                      placeholder="Deskripsi layanan"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <motion.button
                      type="button"
                      onClick={resetForm}
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: "#dc2626"
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 bg-red-500 text-white rounded transition-all text-sm"
                    >
                      Batal
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 5px 15px rgba(16, 185, 129, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 bg-green-500 text-white rounded shadow-md hover:shadow-lg transition-all flex items-center gap-1 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {editingService ? "Simpan" : "Tambah"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

export default ManajemenService;