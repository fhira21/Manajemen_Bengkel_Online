import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarAdmin from "../../components/SidebarAdmin";
import { supabase } from "../../lib/supabaseClient";

const ManajemenSparepart = () => {
  const [spareparts, setSpareparts] = useState([]);
  const [sortFilter, setSortFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    nama: "",
    harga: "",
    stok: "",
    deskripsi: "",
  });

  const fetchSpareparts = async () => {
    setIsLoading(true);
    let query = supabase.from("spareparts").select("*");

    if (sortFilter === "termurah") {
      query = query.order("harga", { ascending: true });
    } else if (sortFilter === "termahal") {
      query = query.order("harga", { ascending: false });
    }

    const { data, error } = await query;
    if (!error) {
      setSpareparts(data);
    } else {
      console.error("Gagal mengambil data:", error.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSpareparts();
  }, [sortFilter]);

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData({
        nama: item.nama,
        harga: item.harga,
        stok: item.stok,
        deskripsi: item.deskripsi || "",
      });
    } else {
      setEditing(null);
      setFormData({ nama: "", harga: "", stok: "", deskripsi: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({ nama: "", harga: "", stok: "", deskripsi: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase
        .from("spareparts")
        .update({
          nama: formData.nama,
          harga: Number(formData.harga),
          stok: Number(formData.stok),
          deskripsi: formData.deskripsi,
        })
        .eq("id", editing.id);
      if (!error) {
        fetchSpareparts();
        closeModal();
      } else alert("Gagal memperbarui: " + error.message);
    } else {
      const { error } = await supabase.from("spareparts").insert([
        {
          nama: formData.nama,
          harga: Number(formData.harga),
          stok: Number(formData.stok),
          deskripsi: formData.deskripsi,
        },
      ]);
      if (!error) {
        fetchSpareparts();
        closeModal();
      } else alert("Gagal menambah: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const konfirmasi = window.confirm("Yakin ingin menghapus sparepart ini?");
    if (!konfirmasi) return;

    const { error } = await supabase.from("spareparts").delete().eq("id", id);
    if (!error) setSpareparts((prev) => prev.filter((s) => s.id !== id));
    else alert("Gagal menghapus: " + error.message);
  };

  const filteredData = spareparts.filter(
    (item) =>
      item.nama?.toLowerCase().includes(search.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockColor = (stok) => {
    if (stok <= 0) return "bg-red-100 text-red-800";
    if (stok <= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="flex">
      <SidebarAdmin />
      <main className="flex-1 md:ml-64 p-4">
        <div className="max-w-full mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manajemen Sparepart</h1>
            <button
              onClick={() => openModal()}
              className="px-5 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-l flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tambah Sparepart
            </button>
          </div>

          {/* Filter Section */}
          <div className="bg-white p-3 rounded-md shadow-xs border border-gray-200 mb-4">
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
                    placeholder="Cari sparepart..."
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
          </div>

          {/* Table Section */}
          <div className="bg-white border border-gray-200 rounded-md shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Memuat data sparepart...
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Tidak ada data sparepart ditemukan
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-4 text-left font-medium text-gray-700">No</th>
                      <th className="px-4 py-4 text-left font-medium text-gray-700">Nama Sparepart</th>
                      <th className="px-4 py-4 text-left font-medium text-gray-700">Deskripsi</th>
                      <th className="px-4 py-4 text-left font-medium text-gray-700">Harga</th>
                      <th className="px-4 py-4 text-left font-medium text-gray-700">Stok</th>
                      <th className="px-4 py-4 text-left font-medium text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{item.nama}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{item.deskripsi || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatPrice(item.harga)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStockColor(item.stok)}`}>
                            {item.stok} pcs
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(item)}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
          </div>
        </div>

        {/* Modal Form */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center p-4">
              <div className="bg-white rounded-md shadow-lg w-full max-w-md">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {editing ? "Edit Sparepart" : "Tambah Sparepart"}
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                    <input
                      type="text"
                      placeholder="Nama sparepart"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                    <input
                      type="number"
                      placeholder="Jumlah stok"
                      value={formData.stok}
                      onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea
                      placeholder="Deskripsi sparepart"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      {editing ? "Simpan" : "Tambah"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ManajemenSparepart;