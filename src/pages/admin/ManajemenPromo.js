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
    description: "",
    harga_asli: "",
    harga_promo: "",
    berlaku_mulai: "",
    berlaku_sampai: "",
    image: null,
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
      description: form.description,
      harga_asli: parseInt(form.harga_asli),
      harga_promo: parseInt(form.harga_promo),
      berlaku_mulai: form.berlaku_mulai,
      berlaku_sampai: form.berlaku_sampai,
    };

    if (form.image && form.image.startsWith("data:image")) {
      promoData.image = form.image;
    }

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
        description: "",
        harga_asli: "",
        harga_promo: "",
        berlaku_mulai: "",
        berlaku_sampai: "",
        image: null,
      });
    } catch (error) {
      alert("Gagal menyimpan data: " + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const openEditForm = (promo) => {
    setSelectedPromo(promo);
    setForm({
      kode_promo: promo.kode_promo || "",
      nama: promo.nama || "",
      description: promo.description || "",
      harga_asli: promo.harga_asli || "",
      harga_promo: promo.harga_promo || "",
      berlaku_mulai: promo.berlaku_mulai || "",
      berlaku_sampai: promo.berlaku_sampai || "",
      image: promo.image || null,
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
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col md:flex-row"
    >
      <SidebarAdmin />

      <motion.main
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 md:ml-64 p-4 sm:p-6"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <motion.h1
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800"
          >
            Manajemen Promo
          </motion.h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsFormOpen(true);
              setSelectedPromo(null);
              setForm({
                kode_promo: "",
                nama: "",
                description: "",
                harga_asli: "",
                harga_promo: "",
                berlaku_mulai: "",
                berlaku_sampai: "",
                image: null,
              });
            }}
            className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base transition-all shadow-md"
          >
            + Tambah Promo
          </motion.button>
        </div>

        {/* Modal Form */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 overflow-auto"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-full md:max-w-2xl mx-2 sm:mx-4"
              >
                {/* Header Form */}
                <div className="flex justify-between items-center border-b p-3 sm:p-4 sticky top-0 bg-white">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    {selectedPromo ? "Edit Promo" : "Tambah Promo Baru"}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4">
                  {/* Grid Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kode Promo
                      </label>
                      <input
                        type="text"
                        name="kode_promo"
                        placeholder="Kode Promo"
                        value={form.kode_promo}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Promo
                      </label>
                      <input
                        type="text"
                        name="nama"
                        placeholder="Nama Promo"
                        value={form.nama}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      placeholder="Deskripsi Promo"
                      value={form.description}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      rows="3"
                    ></textarea>
                  </div>

                  {/* Harga */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga Asli
                      </label>
                      <input
                        type="number"
                        name="harga_asli"
                        placeholder="Harga Asli"
                        value={form.harga_asli}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga Promo
                      </label>
                      <input
                        type="number"
                        name="harga_promo"
                        placeholder="Harga Promo"
                        value={form.harga_promo}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Periode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Berlaku Mulai
                      </label>
                      <input
                        type="date"
                        name="berlaku_mulai"
                        value={form.berlaku_mulai}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Berlaku Sampai
                      </label>
                      <input
                        type="date"
                        name="berlaku_sampai"
                        value={form.berlaku_sampai}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Gambar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gambar Promo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      name="image"
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {form.image && (
                    <div className="flex justify-center">
                      <img
                        src={form.image}
                        alt="Preview"
                        className="max-h-40 rounded-lg border border-gray-200 object-cover"
                      />
                    </div>
                  )}

                  {/* Tombol */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-lg text-white transition-colors shadow-md hover:shadow-lg ${
                        form.nama &&
                        form.kode_promo &&
                        form.harga_asli &&
                        form.harga_promo &&
                        form.berlaku_mulai &&
                        form.berlaku_sampai
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                      disabled={
                        !(
                          form.nama &&
                          form.kode_promo &&
                          form.harga_asli &&
                          form.harga_promo &&
                          form.berlaku_mulai &&
                          form.berlaku_sampai
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
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-3 text-gray-600 text-sm sm:text-base">
                Memuat data promo...
              </p>
            </div>
          ) : promos.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm sm:text-base">
              Tidak ada data promo
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Kode",
                      "Nama",
                      "Deskripsi",
                      "Harga",
                      "Periode",
                      "Aksi",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promos.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                        {promo.kode_promo}
                      </td>
                      <td className="px-4 sm:px-6 py-3">{promo.nama}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-500 max-w-[200px] truncate">
                        {promo.description}
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                        <div className="line-through text-gray-500 text-xs sm:text-sm">
                          {formatPrice(promo.harga_asli)}
                        </div>
                        <div className="text-red-600 font-semibold text-xs sm:text-sm">
                          {formatPrice(promo.harga_promo)}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-500">
                        {formatDate(promo.berlaku_mulai)} -{" "}
                        {formatDate(promo.berlaku_sampai)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                        <div className="flex gap-2 sm:gap-4">
                          <button
                            onClick={() => openEditForm(promo)}
                            className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(promo.id)}
                            className="text-red-600 hover:text-red-900 text-xs sm:text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
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
