import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarAdmin from "../../components/SidebarAdmin";
import { supabase } from "../../lib/supabaseClient";
import Skeleton from "../../components/ui/skeleton";
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiAlertTriangle, FiCheckCircle, FiXCircle, FiBox } from "react-icons/fi";

const ManajemenSparepart = () => {
  const [spareparts, setSpareparts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    kode_part: "",
    nama: "",
    harga_beli: "",
    harga_jual: "",
    stok_minimum: "",
    deskripsi: "",
  });

  const fetchSpareparts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("spareparts_with_stock")
      .select("*")
      .order("kode_part");

    if (!error) {
      const normalized = (data || []).map((item) => ({
        ...item,
        stok: item.stok,
      }));

      setSpareparts(normalized);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSpareparts();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData({
        kode_part: item.kode_part || "",
        nama: item.nama || "",
        harga_beli: item.harga_beli || "",
        harga_jual: item.harga_jual || "",
        stok_minimum: item.stok_minimum || "",
        deskripsi: item.deskripsi || "",
      });
    } else {
      setEditing(null);
      setFormData({ kode_part: "", nama: "", harga_beli: "", harga_jual: "", stok_minimum: "", deskripsi: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({ kode_part: "", nama: "", harga_beli: "", harga_jual: "", stok_minimum: "", deskripsi: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      kode_part: formData.kode_part,
      nama: formData.nama,
      harga_beli: Number(formData.harga_beli),
      harga_jual: Number(formData.harga_jual),
      stok_minimum: Number(formData.stok_minimum),
      deskripsi: formData.deskripsi,
    };

    try {
      if (editing) {
        const { error } = await supabase
          .from("spareparts")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("spareparts").insert([payload]);
        if (error) throw error;
      }
      fetchSpareparts();
      closeModal();
    } catch (err) {
      alert("Gagal menyimpan data: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const konfirmasi = window.confirm("Yakin ingin menghapus sparepart ini?");
    if (!konfirmasi) return;

    try {
      const { error } = await supabase.from("spareparts").delete().eq("id", id);
      if (error) throw error;
      setSpareparts((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  const getStatus = (stok, stok_minimum) => {
    if (stok === 0) return "habis";
    if (stok <= stok_minimum) return "menipis";
    return "aman";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "habis":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><FiXCircle /> Habis</span>;
      case "menipis":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FiAlertTriangle /> Menipis</span>;
      case "aman":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><FiCheckCircle /> Aman</span>;
      default:
        return null;
    }
  };

  const filteredData = spareparts.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      item.nama?.toLowerCase().includes(term) ||
      item.kode_part?.toLowerCase().includes(term);

    const status = getStatus(item.stok || 0, item.stok_minimum || 0);
    const matchesStatus = statusFilter === "semua" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  // KPI Calculations
  const totalSpareparts = spareparts.length;
  const totalStock = spareparts.reduce((sum, item) => sum + (item.stok || 0), 0);
  const lowStockCount = spareparts.filter(i => (i.stok || 0) > 0 && (i.stok || 0) <= (i.stok_minimum || 0)).length;
  const outOfStockCount = spareparts.filter(i => (i.stok || 0) === 0).length;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SidebarAdmin />
      <main className="flex-1 md:ml-64 p-4 md:p-6 lg:p-8 w-full">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Manajemen Sparepart</h1>
              <p className="text-gray-500 mt-1 text-sm">Kelola master data dan pantau ketersediaan suku cadang.</p>
            </div>
            <button
              onClick={() => openModal()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md font-semibold flex items-center justify-center gap-2"
            >
              <FiPlus className="text-lg" />
              Tambah Sparepart
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><FiBox className="text-xl" /></div>
                <h2 className="text-gray-600 text-sm font-semibold">Total Item</h2>
              </div>
              <p className="text-3xl font-black text-gray-900">{totalSpareparts}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-green-50 text-green-600 rounded-lg"><FiCheckCircle className="text-xl" /></div>
                <h2 className="text-gray-600 text-sm font-semibold">Total Stok (pcs)</h2>
              </div>
              <p className="text-3xl font-black text-gray-900">{totalStock}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-lg"><FiAlertTriangle className="text-xl" /></div>
                <h2 className="text-gray-600 text-sm font-semibold">Stok Menipis</h2>
              </div>
              <p className="text-3xl font-black text-yellow-600">{lowStockCount}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-lg"><FiXCircle className="text-xl" /></div>
                <h2 className="text-gray-600 text-sm font-semibold">Stok Habis</h2>
              </div>
              <p className="text-3xl font-black text-red-600">{outOfStockCount}</p>
            </motion.div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Controls */}
            <div className="p-5 border-b border-gray-100 bg-white">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari kode atau nama sparepart..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-64">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  >
                    <option value="semua">Semua Status Stok</option>
                    <option value="aman">Stok Aman</option>
                    <option value="menipis">Stok Menipis</option>
                    <option value="habis">Stok Habis</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Kode</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Nama Sparepart</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Harga Beli</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Harga Satuan</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stok Saat Ini</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Batas Min</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {isLoading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={7} className="px-6 py-4"><Skeleton className="h-6 w-full" /></td>
                      </tr>
                    ))
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Tidak ada sparepart yang sesuai pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => {
                      const current = item.stok || 0;
                      const min = item.stok_minimum || 0;
                      const status = getStatus(current, min);

                      return (
                        <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-200">
                              {item.kode_part}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">{item.nama}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">{formatPrice(item.harga_jual)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">{formatPrice(item.harga_beli)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-black text-gray-900">{current}</span>
                            <span className="text-xs text-gray-500 ml-1">pcs</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{min}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors tooltip" title="Edit">
                                <FiEdit2 />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors tooltip" title="Hapus">
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-4"><Skeleton className="h-20 w-full" /></div>
                ))
              ) : filteredData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Tidak ada sparepart.</div>
              ) : (
                filteredData.map((item) => {
                  const current = item.stok || 0;
                  const min = item.stok_minimum || 0;
                  const status = getStatus(current, min);

                  return (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-mono text-xs font-bold bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200 block w-max mb-1">
                            {item.kode_part}
                          </span>
                          <h3 className="font-bold text-gray-900">{item.nama}</h3>
                        </div>
                        {getStatusBadge(status)}
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3 mt-2">
                        <div>
                          <p className="text-xs text-gray-500">Harga Satuan</p>
                          <p className="font-bold text-gray-800 text-sm">{formatPrice(item.harga_jual)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Sisa Stok</p>
                          <p className="font-black text-gray-900 text-lg">{current} <span className="text-xs font-normal">pcs</span></p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => openModal(item)} className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg">
                          <FiEdit2 /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="flex items-center justify-center px-4 text-sm font-semibold text-red-600 bg-red-50 rounded-lg">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 py-10 overflow-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><FiBox /></span>
                    {editing ? "Edit Sparepart" : "Tambah Sparepart Baru"}
                  </h2>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2"><FiXCircle className="text-xl" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kode Part</label>
                      <input
                        type="text"
                        placeholder="Cth: SP-001"
                        value={formData.kode_part}
                        onChange={(e) => setFormData({ ...formData, kode_part: e.target.value })}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Batas Minimal Stok</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stok_minimum}
                        onChange={(e) => setFormData({ ...formData, stok_minimum: e.target.value })}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Sparepart</label>
                    <input
                      type="text"
                      placeholder="Cth: Filter Oli"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Harga Beli (Rp)
                    </label>

                    <input
                      type="number"
                      placeholder="Contoh: 120000"
                      value={formData.harga_beli}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          harga_beli: e.target.value,
                        })
                      }
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Harga Jual (Rp)
                    </label>

                    <input
                      type="number"
                      placeholder="Contoh: 150000"
                      value={formData.harga_jual}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          harga_jual: e.target.value,
                        })
                      }
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Deskripsi
                    </label>

                    <textarea
                      rows={4}
                      placeholder="Keterangan sparepart..."
                      value={formData.deskripsi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deskripsi: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                    <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">Batal</button>
                    <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-md transition-colors">
                      {editing ? "Simpan Perubahan" : "Simpan Sparepart"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ManajemenSparepart;