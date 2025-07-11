import React, { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";

const ManajemenPromo = () => {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState({
    kode_promo: "",
    nama: "",
    description: "",
    harga_asli: "",
    harga_promo: "",
    berlaku_mulai: "",
    berlaku_sampai: "",
    image: "",
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetch("/data/promo.json")
      .then((res) => res.json())
      .then(setPromos);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPromo = {
      ...form,
      harga_asli: parseInt(form.harga_asli),
      harga_promo: parseInt(form.harga_promo),
      created_by: 1,
    };
    setPromos((prev) => [...prev, newPromo]);
    setForm({
      kode_promo: "",
      nama: "",
      description: "",
      harga_asli: "",
      harga_promo: "",
      berlaku_mulai: "",
      berlaku_sampai: "",
      image: "",
    });
    setIsFormOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row">
      <SidebarAdmin />

      <main className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Promo</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
          >
            + Tambah Promo
          </button>
        </div>

        {/* Modal Form */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center border-b p-4">
                <h2 className="text-lg font-semibold">Tambah Promo Baru</h2>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Promo</label>
                  <input
                    name="kode_promo"
                    type="text"
                    placeholder="Kode Promo"
                    value={form.kode_promo}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Promo</label>
                  <input
                    name="nama"
                    type="text"
                    placeholder="Nama Promo"
                    value={form.nama}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    name="description"
                    placeholder="Deskripsi Promo"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga Asli</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2">Rp</span>
                      <input
                        name="harga_asli"
                        type="number"
                        placeholder="Harga Asli"
                        value={form.harga_asli}
                        onChange={handleChange}
                        required
                        className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga Promo</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2">Rp</span>
                      <input
                        name="harga_promo"
                        type="number"
                        placeholder="Harga Promo"
                        value={form.harga_promo}
                        onChange={handleChange}
                        required
                        className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Berlaku Mulai</label>
                    <input
                      name="berlaku_mulai"
                      type="date"
                      value={form.berlaku_mulai}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Berlaku Sampai</label>
                    <input
                      name="berlaku_sampai"
                      type="date"
                      value={form.berlaku_sampai}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                  <input
                    name="image"
                    type="text"
                    placeholder="Contoh: /promo2.jpg"
                    value={form.image}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Simpan Promo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Promo Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promos.length > 0 ? (
                  promos.map((promo, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {promo.kode_promo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{promo.nama}</div>
                        <div className="text-sm text-gray-500 md:hidden line-clamp-2">{promo.description}</div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-normal">
                        <div className="text-sm text-gray-500">{promo.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 line-through">Rp {promo.harga_asli.toLocaleString()}</div>
                        <div className="text-sm font-bold text-red-600">Rp {promo.harga_promo.toLocaleString()}</div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(promo.berlaku_mulai).toLocaleDateString()} - {new Date(promo.berlaku_sampai).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Hapus</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data promo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManajemenPromo;