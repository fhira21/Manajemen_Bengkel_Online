import React, { useEffect, useState } from "react";
import { 
  FiSearch, 
  FiCalendar, 
  FiPlus, 
  FiPackage, 
  FiUser,
  FiInfo,
  FiFilter,
  FiTrash2,
  FiEdit2
} from "react-icons/fi";
import { motion } from "framer-motion";

const SparepartMasuk = () => {
  const [dataMasuk, setDataMasuk] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    id_sparepart: "",
    jumlah: 1,
    tanggal: new Date().toISOString().split("T")[0],
    keterangan: ""
  });

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch("/data/sparepart_masuk.json").then(res => res.json()),
      fetch("/data/spareparts.json").then(res => res.json()),
      fetch("/data/userData.json").then(res => res.json()),
    ])
      .then(([masuk, sparepartsData, usersData]) => {
        setDataMasuk(masuk);
        setSpareparts(sparepartsData);
        setUsers(usersData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const getNamaSparepart = (id) => spareparts.find(s => s.id_sparepart === id)?.nama || "-";
  const getNamaUser = (id) => users.find(u => u.id_user === id)?.nama || "-";
  const getRoleUser = (id) => users.find(u => u.id_user === id)?.role || "-";

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const newItem = {
      id_masuk: dataMasuk.length + 1,
      id_sparepart: parseInt(form.id_sparepart),
      jumlah: parseInt(form.jumlah),
      tanggal: form.tanggal,
      id_user: currentUser?.id_user || currentUser?.id,
      keterangan: form.keterangan
    };
    setDataMasuk(prev => [...prev, newItem]);
    setForm({ 
      id_sparepart: "", 
      jumlah: 1, 
      tanggal: new Date().toISOString().split("T")[0], 
      keterangan: "" 
    });
  };

  const filtered = dataMasuk.filter(item => {
    const namaSparepart = getNamaSparepart(item.id_sparepart).toLowerCase();
    const namaUser = getNamaUser(item.id_user).toLowerCase();
    const matchSearch = namaSparepart.includes(search.toLowerCase()) || 
                       namaUser.includes(search.toLowerCase());
    const matchTanggal = !filterTanggal || item.tanggal === filterTanggal;
    return matchSearch && matchTanggal;
  });

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiPackage className="text-blue-500" />
          Sparepart Masuk
        </h2>
      </motion.div>

      {/* Form Input */}
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sparepart</label>
            <select
              value={form.id_sparepart}
              onChange={e => setForm({ ...form, id_sparepart: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Pilih Sparepart</option>
              {spareparts.map(sp => (
                <option key={sp.id_sparepart} value={sp.id_sparepart}>
                  {sp.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
            <input
              type="number"
              min={1}
              value={form.jumlah}
              onChange={e => setForm({ ...form, jumlah: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={form.tanggal}
                onChange={e => setForm({ ...form, tanggal: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <FiPlus />
              Tambah
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
          <input
            type="text"
            value={form.keterangan}
            onChange={e => setForm({ ...form, keterangan: e.target.value })}
            placeholder="Masukkan keterangan (opsional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </motion.form>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari sparepart atau user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sparepart</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diterima Oleh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(item => (
                  <tr key={item.id_masuk} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id_masuk}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <FiPackage className="text-blue-400" />
                        {getNamaSparepart(item.id_sparepart)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {item.jumlah}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tanggal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-green-400" />
                        <div>
                          <p className="font-medium">{getNamaUser(item.id_user)}</p>
                          <p className="text-xs text-gray-400">{getRoleUser(item.id_user)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.keterangan || (
                        <span className="text-gray-400 flex items-center gap-1">
                          <FiInfo className="text-yellow-400" />
                          Tidak ada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FiEdit2 />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      {search || filterTanggal ? 
                        "Tidak ada data yang sesuai dengan filter" : 
                        "Belum ada data sparepart masuk"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SparepartMasuk;