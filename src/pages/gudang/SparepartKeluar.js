import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { FiPackage, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import SidebarGudang from "../../components/SideBarGudang";

export default function ManajemenSparepartKeluar() {
  const [data, setData] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    sparepart_id: "",
    jumlah_stok: 0,
    keterangan: "",
    tgl: "",
    dikelola_oleh: "",
    tipe: "keluar",
  });

  // Fetch sparepart keluar
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("sparepart_stok")
      .select(
        `
      id,
      jumlah_stok,
      keterangan,
      tgl,
      tipe,
      spareparts:sparepart_id (
        nama
      ),
      users:dikelola_oleh (
        nama_lengkap
      )
    `
      )
      .eq("tipe", "keluar");

    if (error) {
      console.error("Gagal fetch data:", error.message);
    } else {
      setData(data);
    }
  };

  const fetchDropdowns = async () => {
    const [sparepartsRes, userRes] = await Promise.all([
      supabase.from("spareparts").select("id, nama"),
      supabase.from("users").select("id, nama_lengkap"),
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

  const handleSubmit = async () => {
    if (
      !form.sparepart_id ||
      !form.jumlah_stok ||
      !form.tgl ||
      !form.dikelola_oleh
    ) {
      alert("Mohon lengkapi semua data!");
      return;
    }
    const { error } = await supabase.from("sparepart_stok").insert([form]);
    if (error) {
      alert("Gagal menambahkan data: " + error.message);
    } else {
      alert("Data berhasil ditambahkan!");
      fetchData();
      setShowModal(false);
      setForm({
        sparepart_id: "",
        jumlah_stok: 0,
        keterangan: "",
        tgl: "",
        dikelola_oleh: "",
        tipe: "keluar",
      });
    }
  };

  return (
    <div className="flex">
      <SidebarGudang />
      <main className="flex-1 md:ml-64 p-4">
        <div className="flex justify-between items-center mb-6"> {/* Increased margin-bottom */}
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3"> {/* Increased gap */}
            <FiPackage className="text-blue-500 text-3xl" /> {/* Larger icon */}
            Manajemen Sparepart Keluar
          </h2>
        </div>

        {/* Search dan Tambah - Enlarged */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6"> {/* Increased gap */}
            <div className="flex gap-4 flex-1"> {/* Increased gap */}
              <input
                type="text"
                placeholder="Cari sparepart..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full text-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-3 text-lg"
              >
                <FiPlus size={20} /> {/* Larger icon */}
                Tambah Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* Table with increased spacing */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg"> {/* Larger shadow */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-5 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-8 py-5 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Sparepart</th>
                <th className="px-8 py-5 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                <th className="px-8 py-5 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-8 py-5 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-8 py-5 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((d, i) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-8 py-6 whitespace-nowrap text-base text-gray-500"> {/* Larger text and padding */}
                      {i + 1}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base font-medium text-gray-900">
                      {d.spareparts?.nama || "-"}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base text-gray-500">
                      {d.jumlah_stok}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base text-gray-500">
                      {d.tgl}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base text-gray-500">
                      {d.users?.nama_lengkap || "-"}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base text-gray-500">
                      {d.keterangan}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-6 whitespace-nowrap text-base text-gray-500 text-center">
                    Belum ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Tambah */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">
                Tambah Sparepart Keluar
              </h3>

              <div className="grid gap-3">
                <div>
                  <label className="text-sm">Sparepart</label>
                  <select
                    name="sparepart_id"
                    value={form.sparepart_id}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 rounded"
                  >
                    <option value="">Pilih Sparepart</option>
                    {spareparts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm">Jumlah Stok</label>
                  <input
                    name="jumlah_stok"
                    type="number"
                    value={form.jumlah_stok}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm">Keterangan</label>
                  <input
                    name="keterangan"
                    value={form.keterangan}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm">Tanggal</label>
                  <input
                    type="date"
                    name="tgl"
                    value={form.tgl}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm">Dikelola Oleh</label>
                  <select
                    name="dikelola_oleh"
                    value={form.dikelola_oleh}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 rounded"
                  >
                    <option value="">Pilih Karyawan</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama_lengkap}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
