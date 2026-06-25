import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SidebarGudang from "../../components/SideBarGudang";
import {
  FiSearch, FiCalendar, FiPlus, FiPackage, FiUser
} from "react-icons/fi";
import { motion } from "framer-motion";

const SparepartMasuk = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [dataMasuk, setDataMasuk] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    sparepart_id: "",
    qty: 1,
    created_at: new Date().toISOString().split("T")[0],
    keterangan: ""
  });

  const fetchData = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("inventory_transactions")
      .select(`
        id,
        qty,
        keterangan,
        created_at,
        tipe,
        spareparts:sparepart_id ( id, nama ),
        users:dikelola_oleh ( id, nama_lengkap, role )
      `)
      .eq("tipe", "masuk")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal fetch data:", error.message);
    } else {
      setDataMasuk(data);
    }
    setIsLoading(false);
  };

  const fetchDropdowns = async () => {
    const { data } = await supabase.from("spareparts").select("id, nama").order("nama");
    if (data) setSpareparts(data);
  };

  useEffect(() => {
    fetchData();
    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.sparepart_id || !form.qty || !form.created_at) {
      alert("Mohon lengkapi semua data mandatory!");
      return;
    }

    const newItem = {
      sparepart_id: form.sparepart_id,
      qty: Number(form.qty),
      tipe: "masuk",
      keterangan: form.keterangan,
      dikelola_oleh: currentUser?.id,
      // We can manually set created_at or let DB handle it. Since we allow date picking:
      created_at: new Date(form.created_at).toISOString()
    };

    const { error } = await supabase.from("inventory_transactions").insert([newItem]);
    if (error) {
      alert("Gagal menambahkan data: " + error.message);
    } else {
      setForm({
        sparepart_id: "",
        qty: 1,
        created_at: new Date().toISOString().split("T")[0],
        keterangan: ""
      });
      setShowModal(false);
      fetchData();
    }
  };

  const filtered = dataMasuk.filter(item => {
    const namaSparepart = item.spareparts?.nama?.toLowerCase() || "";
    const namaUser = item.users?.nama_lengkap?.toLowerCase() || "";
    const matchSearch = namaSparepart.includes(search.toLowerCase()) || namaUser.includes(search.toLowerCase());
    
    // Exact date matching from ISO string (DB usually returns 2024-xx-xxTxx)
    const itemDate = item.created_at ? item.created_at.split('T')[0] : '';
    const matchTanggal = !filterTanggal || itemDate === filterTanggal;
    
    return matchSearch && matchTanggal;
  });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SidebarGudang/>
      <main className="flex-1 md:ml-64 p-6 lg:p-8">
      {/* Modal Tambah */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiPlus className="text-blue-600" />
              Tambah Stok Masuk
            </h3>

            <form onSubmit={handleSubmit} className="grid gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sparepart</label>
                <select name="sparepart_id" value={form.sparepart_id} onChange={handleChange} className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="">Pilih Sparepart</option>
                  {spareparts.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jumlah (Qty)</label>
                  <input name="qty" type="number" min="1" value={form.qty} onChange={handleChange} className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal</label>
                  <input type="date" name="created_at" value={form.created_at} onChange={handleChange} className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keterangan / Referensi</label>
                <textarea name="keterangan" rows="3" value={form.keterangan} onChange={handleChange} placeholder="Contoh: Pembelian dari Supplier A..." className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>

              <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                  Simpan Data
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-600 mb-1 tracking-wider uppercase">Inventory Transactions</p>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FiPackage />
            </div>
            Sparepart Masuk
          </h1>
        </div>
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari nama sparepart atau staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
          </div>
          <div className="relative">
            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="date" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} className="pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowModal(true)} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow transition-all">
              <FiPlus />
              Tambah Masuk
            </button>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-gray-50/50">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sparepart</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Qty Masuk</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dikelola Oleh</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Keterangan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filtered.map((item, idx) => {
                  const displayDate = item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : "-";
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-500">
                            <FiPackage />
                          </div>
                          <span className="font-semibold text-gray-900">{item.spareparts?.nama || "-"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                          +{item.qty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {displayDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <FiUser className="w-3 h-3" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.users?.nama_lengkap || "-"}</p>
                            <p className="text-xs text-gray-500">{item.users?.role || "Staff"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.keterangan ? (
                          <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg inline-block border border-gray-100">
                            {item.keterangan}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Tidak ada catatan</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FiSearch className="w-12 h-12 mb-3 text-gray-300" />
                        <p className="text-lg font-medium text-gray-600">Tidak ada data</p>
                        <p className="text-sm">Silakan sesuaikan filter pencarian.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      </main>
    </div>
  );
};

export default SparepartMasuk;
