import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SidebarGudang from "../../components/SideBarGudang";
import {
  FiSearch, FiCalendar, FiPlus, FiPackage,
  FiUser, FiInfo, FiFilter, FiTrash2, FiEdit2
} from "react-icons/fi";
import { motion } from "framer-motion";

const SparepartMasuk = () => {
  const [dataMasuk, setDataMasuk] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    sparepart_id: "",
    jumlah_stok: 1,
    tgl: new Date().toISOString().split("T")[0],
    keterangan: "",
    dikelola_oleh: ""
  });

  const fetchData = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("sparepart_stok")
      .select(`
        id,
        jumlah_stok,
        keterangan,
        tgl,
        tipe,
        spareparts:sparepart_id ( id, nama ),
        users:dikelola_oleh ( id, nama_lengkap, role )
      `)
      .eq("tipe", "masuk")
      .order("tgl", { ascending: false });

    if (error) {
      console.error("Gagal fetch data:", error.message);
    } else {
      setDataMasuk(data);
    }
    setIsLoading(false);
  };

  const fetchDropdowns = async () => {
    const [sparepartsRes, userRes] = await Promise.all([
      supabase.from("spareparts").select("id, nama"),
      supabase.from("users").select("id, nama_lengkap, role"),
    ]);
    if (sparepartsRes.data) setSpareparts(sparepartsRes.data);
    if (userRes.data) setUsers(userRes.data);
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
    const newItem = {
      sparepart_id: parseInt(form.sparepart_id),
      jumlah_stok: parseInt(form.jumlah_stok),
      tgl: form.tgl,
      keterangan: form.keterangan,
      dikelola_oleh: parseInt(form.dikelola_oleh),
      tipe: "masuk",
    };

    const { error } = await supabase.from("sparepart_stok").insert([newItem]);
    if (!error) {
      setForm({
        sparepart_id: "",
        jumlah_stok: 1,
        tgl: new Date().toISOString().split("T")[0],
        keterangan: "",
        dikelola_oleh: ""
      });
      setShowModal(false);
      fetchData();
    } else {
      alert("Gagal menambahkan data.");
    }
  };

  const filtered = dataMasuk.filter(item => {
    const namaSparepart = item.spareparts?.nama?.toLowerCase() || "";
    const namaUser = item.users?.nama_lengkap?.toLowerCase() || "";
    const matchSearch = namaSparepart.includes(search.toLowerCase()) || namaUser.includes(search.toLowerCase());
    const matchTanggal = !filterTanggal || item.tgl === filterTanggal;
    return matchSearch && matchTanggal;
  });

  return (
    <div className="flex">
      <SidebarGudang/>
      <main className="flex-1 md:ml-64 p-4">
      {/* Modal Tambah */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Tambah Sparepart Masuk</h3>

            <form onSubmit={handleSubmit} className="grid gap-3">
              <div>
                <label className="text-sm">Sparepart</label>
                <select name="sparepart_id" value={form.sparepart_id} onChange={handleChange} className="w-full border px-2 py-1 rounded">
                  <option value="">Pilih Sparepart</option>
                  {spareparts.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm">Jumlah</label>
                <input name="jumlah_stok" type="number" value={form.jumlah_stok} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="text-sm">Keterangan</label>
                <input name="keterangan" value={form.keterangan} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="text-sm">Tanggal</label>
                <input type="date" name="tgl" value={form.tgl} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label className="text-sm">Dikelola Oleh</label>
                <select name="dikelola_oleh" value={form.dikelola_oleh} onChange={handleChange} className="w-full border px-2 py-1 rounded">
                  <option value="">Pilih Karyawan</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.nama_lengkap}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Judul dan Filter */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiPackage className="text-blue-500" />
          Manajemen Sparepart Masuk
        </h2>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Cari sparepart atau user..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-3 text-gray-400" />
            <input type="date" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowModal(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
              <FiPlus />
              Tambah Data
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabel */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sparepart</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      <FiPackage className="text-blue-400" />
                      {item.spareparts?.nama || "-"}
                    </td>
                    <td className="px-6 py-4">{item.jumlah_stok}</td>
                    <td className="px-6 py-4">{item.tgl}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-green-400" />
                        <div>
                          <p className="font-medium">{item.users?.nama_lengkap || "-"}</p>
                          <p className="text-xs text-gray-400">{item.users?.role || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.keterangan || (
                        <span className="text-gray-400 flex items-center gap-1">
                          <FiInfo className="text-yellow-400" />
                          Tidak ada
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500">
                      {search || filterTanggal
                        ? "Tidak ada data yang sesuai dengan filter"
                        : "Belum ada data sparepart masuk"}
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
