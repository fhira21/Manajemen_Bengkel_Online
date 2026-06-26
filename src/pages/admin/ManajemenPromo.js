import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarAdmin from "../../components/SidebarAdmin";
import { supabase } from "../../lib/supabaseClient";

const ManajemenPromo = () => {
  const [promos, setPromos] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [form, setForm] = useState({
    kode_promo: "",
    nama: "",
    deskripsi: "",
    tipe_promo: "discount_item",
    nilai_diskon: "",
    aktif: true,
    tgl_mulai: "",
    tgl_selesai: "",
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPromos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("promo").select();
    if (!error) {
      setPromos(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const promoData = {
      kode_promo: form.kode_promo,
      nama: form.nama,
      deskripsi: form.deskripsi,
      tipe_promo: form.tipe_promo,
      nilai_diskon: parseInt(form.nilai_diskon) || 0,
      aktif: form.aktif,
      tgl_mulai: form.tgl_mulai,
      tgl_selesai: form.tgl_selesai,
    };

    try {
      let result;
      if (selectedPromo) {
        result = await supabase
          .from("promo")
          .update(promoData)
          .eq("id", selectedPromo.id);
      } else {
        result = await supabase.from("promo").insert([promoData]);
      }

      if (result.error) throw result.error;

      alert(
        selectedPromo
          ? "Promo berhasil diperbarui!"
          : "Promo berhasil ditambahkan!"
      );

      fetchPromos();
      setIsFormOpen(false);
      setSelectedPromo(null);
      setForm({
        kode_promo: "",
        nama: "",
        deskripsi: "",
        tipe_promo: "discount_item",
        nilai_diskon: "",
        aktif: true,
        tgl_mulai: "",
        tgl_selesai: "",
      });
    } catch (error) {
      alert("Gagal menyimpan data: " + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openEditForm = (promo) => {
    setSelectedPromo(promo);
    setForm({
      kode_promo: promo.kode_promo || "",
      nama: promo.nama || "",
      deskripsi: promo.deskripsi || "",
      tipe_promo: promo.tipe_promo || "discount_item",
      nilai_diskon: promo.nilai_diskon || "",
      aktif: promo.aktif ?? true,
      tgl_mulai: promo.tgl_mulai ? promo.tgl_mulai.split("T")[0] : "",
      tgl_selesai: promo.tgl_selesai ? promo.tgl_selesai.split("T")[0] : "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    const konfirmasi = window.confirm(
      "Apakah kamu yakin ingin menghapus promo ini?"
    );
    if (!konfirmasi) return;

    try {
      const { error } = await supabase.from("promo").delete().eq("id", id);
      if (error) throw error;

      alert("Promo berhasil dihapus!");
      fetchPromos();
    } catch (err) {
      alert("Gagal menghapus promo: " + err.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col md:flex-row bg-gray-50 min-h-screen"
    >
      <SidebarAdmin />

      <motion.main
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 md:pt-0 md:ml-64 p-4 md:p-6 lg:p-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <motion.h1
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight"
            >
              Manajemen Promo
            </motion.h1>
            <p className="text-gray-500 mt-1 text-sm">Kelola diskon dan penawaran bundling untuk pelanggan.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setIsFormOpen(true);
              setSelectedPromo(null);
              setForm({
                kode_promo: "",
                nama: "",
                deskripsi: "",
                tipe_promo: "discount_item",
                nilai_diskon: "",
                aktif: true,
                tgl_mulai: "",
                tgl_selesai: "",
              });
            }}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Promo
          </motion.button>
        </div>

        {/* Modal Form */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto py-10"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
              >
                {/* Header Form */}
                <div className="flex justify-between items-center border-b border-gray-100 p-5 bg-gray-50">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </span>
                    {selectedPromo ? "Edit Promo" : "Tambah Promo Baru"}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Grid Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Kode Promo
                      </label>
                      <input
                        type="text"
                        name="kode_promo"
                        placeholder="Contoh: VW-SUMMER"
                        value={form.kode_promo}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Nama Promo
                      </label>
                      <input
                        type="text"
                        name="nama"
                        placeholder="Nama Kampanye"
                        value={form.nama}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Deskripsi
                    </label>
                    <textarea
                      name="deskripsi"
                      placeholder="Jelaskan detail promo..."
                      value={form.deskripsi}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                      rows="3"
                    ></textarea>
                  </div>

                  {/* Tipe Promo & Nilai */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Tipe Promo
                      </label>
                      <select
                        name="tipe_promo"
                        value={form.tipe_promo}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                      >
                        <option value="discount_item">Diskon Harga (Rp)</option>
                        <option value="bundling">Bundling Layanan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Nilai Diskon (Rp)
                      </label>
                      <input
                        type="number"
                        name="nilai_diskon"
                        placeholder="Misal: 50000"
                        value={form.nilai_diskon}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Periode & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Berlaku Mulai
                      </label>
                      <input
                        type="date"
                        name="tgl_mulai"
                        value={form.tgl_mulai}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Berlaku Sampai
                      </label>
                      <input
                        type="date"
                        name="tgl_selesai"
                        value={form.tgl_selesai}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col justify-center pt-6">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            name="aktif" 
                            className="sr-only" 
                            checked={form.aktif}
                            onChange={handleChange}
                          />
                          <div className={`block w-14 h-8 rounded-full transition-colors ${form.aktif ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${form.aktif ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                        <div className="ml-3 font-semibold text-gray-700">
                          {form.aktif ? 'Promo Aktif' : 'Non-Aktif'}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Tombol */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-2.5 rounded-xl font-semibold text-white transition-all shadow-md ${
                        form.nama &&
                        form.kode_promo &&
                        form.nilai_diskon !== "" &&
                        form.tgl_mulai &&
                        form.tgl_selesai
                          ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                          : "bg-blue-300 cursor-not-allowed"
                      }`}
                      disabled={
                        !(
                          form.nama &&
                          form.kode_promo &&
                          form.nilai_diskon !== "" &&
                          form.tgl_mulai &&
                          form.tgl_selesai
                        )
                      }
                    >
                      {selectedPromo ? "Simpan Perubahan" : "Tambah Promo"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-4 font-medium text-gray-600">Memuat data promo...</p>
            </div>
          ) : promos.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Belum ada promo</h3>
              <p className="text-gray-500 mt-1 max-w-sm">Anda belum menambahkan data promo satupun. Silakan klik tombol Tambah Promo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50/50">
                  <tr>
                    {[
                      "Kode",
                      "Nama & Deskripsi",
                      "Nilai Diskon",
                      "Periode",
                      "Status",
                      "Aksi",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {promos.map((promo) => (
                    <motion.tr 
                      key={promo.id} 
                      className="hover:bg-blue-50/30 transition-colors group"
                      whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.4)" }}
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-md text-sm border border-gray-200">
                          {promo.kode_promo}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-900">{promo.nama}</div>
                        <div className="text-sm text-gray-500 mt-0.5 line-clamp-1 max-w-xs" title={promo.deskripsi}>
                          {promo.deskripsi || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 self-start">
                            {promo.tipe_promo === 'discount_item' ? 'Diskon' : 'Bundling'}
                          </span>
                          <span className="font-bold text-green-600">
                            {formatPrice(promo.nilai_diskon)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {formatDate(promo.tgl_mulai)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          s/d {formatDate(promo.tgl_selesai)}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          promo.aktif 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${promo.aktif ? "bg-green-600" : "bg-gray-400"}`}></span>
                          {promo.aktif ? "Aktif" : "Non-Aktif"}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditForm(promo)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors tooltip"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(promo.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors tooltip"
                            title="Hapus"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
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

export default ManajemenPromo;
