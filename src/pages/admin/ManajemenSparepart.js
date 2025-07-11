import React, { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";

const ManajemenSparepart = () => {
  const [spareparts, setSpareparts] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSparepart, setNewSparepart] = useState({
    id_sparepart: "",
    nama: "",
    kode: "",
    harga: "",
    stok: "",
    updated_at: new Date().toISOString(),
  });
  const [formErrors, setFormErrors] = useState({});
  const itemsPerPage = 10;

  // Load data from localStorage on initial render
  useEffect(() => {
    const fetchSpareparts = () => {
      try {
        setIsLoading(true);
        const savedSpareparts = localStorage.getItem("spareparts");
        
        if (savedSpareparts) {
          setSpareparts(JSON.parse(savedSpareparts));
        } else {
          // If no data in localStorage, load from JSON (initial data)
          fetch("/data/spareparts.json")
            .then((res) => res.json())
            .then((data) => {
              setSpareparts(data);
              localStorage.setItem("spareparts", JSON.stringify(data));
            });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpareparts();
  }, []);

  // Save to localStorage whenever spareparts change
  useEffect(() => {
    if (spareparts.length > 0) {
      localStorage.setItem("spareparts", JSON.stringify(spareparts));
    }
  }, [spareparts]);

  const filteredSpareparts = spareparts.filter((sp) =>
    sp.nama.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSpareparts.length / itemsPerPage);
  const paginatedSpareparts = filteredSpareparts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return "text-red-600 bg-red-50";
    if (quantity <= 5) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSparepart({
      ...newSparepart,
      [name]: value,
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!newSparepart.nama) errors.nama = "Nama sparepart harus diisi";
    if (!newSparepart.kode) errors.kode = "Kode sparepart harus diisi";
    if (!newSparepart.harga || isNaN(newSparepart.harga)) errors.harga = "Harga harus angka";
    if (!newSparepart.stok || isNaN(newSparepart.stok)) errors.stok = "Stok harus angka";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const newId = spareparts.length > 0 
      ? Math.max(...spareparts.map(sp => sp.id_sparepart)) + 1 
      : 1;

    const sparepartToAdd = {
      ...newSparepart,
      id_sparepart: newId,
      harga: parseInt(newSparepart.harga),
      stok: parseInt(newSparepart.stok),
      updated_at: new Date().toISOString(),
    };

    setSpareparts([...spareparts, sparepartToAdd]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewSparepart({
      id_sparepart: "",
      nama: "",
      kode: "",
      harga: "",
      stok: "",
      updated_at: new Date().toISOString(),
    });
    setFormErrors({});
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus sparepart ini?")) {
      const updatedSpareparts = spareparts.filter(sp => sp.id_sparepart !== id);
      setSpareparts(updatedSpareparts);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <SidebarAdmin />

      <main className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manajemen Sparepart</h1>
              <p className="text-gray-600 mt-1">
                Kelola data sparepart bengkel
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Tambah Sparepart
              </button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Cari Sparepart
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    id="search"
                    type="text"
                    placeholder="Cari berdasarkan nama sparepart..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Memuat data sparepart...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Coba lagi
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama Sparepart
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Harga
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stok
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Terakhir Diupdate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedSpareparts.length > 0 ? (
                        paginatedSpareparts.map((sp) => (
                          <tr key={sp.id_sparepart} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {sp.id_sparepart}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{sp.nama}</div>
                              <div className="text-sm text-gray-500">{sp.kode}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(sp.harga)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatus(
                                  sp.stok
                                )}`}
                              >
                                {sp.stok} pcs
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(sp.updated_at).toLocaleString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(sp.id_sparepart)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            Tidak ada sparepart yang ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredSpareparts.length > 0 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Menampilkan{" "}
                          <span className="font-medium">
                            {(currentPage - 1) * itemsPerPage + 1}
                          </span>{" "}
                          sampai{" "}
                          <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, filteredSpareparts.length)}
                          </span>{" "}
                          dari <span className="font-medium">{filteredSpareparts.length}</span>{" "}
                          hasil
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            <span className="sr-only">Previous</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === totalPages
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            <span className="sr-only">Next</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add Sparepart Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tambah Sparepart Baru</h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Sparepart <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nama"
                      name="nama"
                      value={newSparepart.nama}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border ${
                        formErrors.nama ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.nama && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.nama}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="kode" className="block text-sm font-medium text-gray-700 mb-1">
                      Kode Sparepart <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="kode"
                      name="kode"
                      value={newSparepart.kode}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border ${
                        formErrors.kode ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.kode && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.kode}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="harga" className="block text-sm font-medium text-gray-700 mb-1">
                      Harga (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="harga"
                      name="harga"
                      value={newSparepart.harga}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border ${
                        formErrors.harga ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.harga && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.harga}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="stok" className="block text-sm font-medium text-gray-700 mb-1">
                      Stok <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="stok"
                      name="stok"
                      value={newSparepart.stok}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border ${
                        formErrors.stok ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.stok && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.stok}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManajemenSparepart;