// File: src/pages/gudang/DashboardGudang.jsx
import React, { useEffect, useState } from "react";
import SidebarGudang from "../../components/SideBarGudang";
import SparepartMasuk from "./SparepartMasuk";
import SparepartKeluar from "./SparepartKeluar";
import { FiSearch, FiAlertTriangle, FiHome, FiArrowUp, FiArrowDown, FiBox, FiPackage } from "react-icons/fi";
import { motion } from "framer-motion";

const DashboardGudang = () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [filterStokRendah, setFilterStokRendah] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [laporan, setLaporan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    setIsLoading(true);
    fetch("/data/gudangData.json")
      .then(res => res.json())
      .then(data => {
        setLaporan(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredLaporan = laporan.filter(item => {
    const matchSearch = item.nama.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchStok = !filterStokRendah || item.sisa_stock < 10;
    return matchSearch && matchStok;
  });

  // Statistik bulan ini
  const today = new Date();
  const thisMonth = today.toISOString().slice(0, 7); // "2025-06"

  const totalMasukBulanIni = laporan.reduce((sum, item) => sum + (item.stock_masuk || 0), 0);
  const totalKeluarBulanIni = laporan.reduce((sum, item) => sum + (item.stock_keluar || 0), 0);
  const totalSisaStock = laporan.reduce((sum, item) => sum + (item.sisa_stock || 0), 0);

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <>
            {/* Ringkasan Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Stok Masuk Bulan Ini</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalMasukBulanIni}</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FiArrowDown className="text-green-600 text-xl" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Update terakhir: {today.toLocaleDateString()}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Stok Keluar Bulan Ini</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalKeluarBulanIni}</h3>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <FiArrowUp className="text-red-600 text-xl" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Update terakhir: {today.toLocaleDateString()}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Sisa Stok</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalSisaStock}</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FiPackage className="text-blue-600 text-xl" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Update terakhir: {today.toLocaleDateString()}</p>
              </motion.div>
            </div>

            {/* Tabel Laporan */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-100"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FiBox className="text-blue-500" />
                  Laporan Stok Sparepart
                </h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cari nama sparepart..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <label className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={filterStokRendah}
                      onChange={(e) => setFilterStokRendah(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex items-center gap-1 text-sm">
                      <FiAlertTriangle className="text-yellow-500" />
                      Stok Rendah (kurang dari 10)
                    </span>
                  </label>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Sparepart</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Masuk</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Keluar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sisa Stock</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLaporan.map(item => (
                        <tr 
                          key={item.id_sparepart} 
                          className={item.sisa_stock < 5 ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id_sparepart}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nama}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stock_masuk}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stock_keluar}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={`px-2 py-1 rounded-full text-xs ${item.sisa_stock < 5 ? 'bg-red-100 text-red-800' : item.sisa_stock < 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                              {item.sisa_stock}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredLaporan.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            {searchKeyword || filterStokRendah ? "Tidak ada data yang sesuai dengan filter" : "Tidak ada data"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        );
      case "masuk":
        return <SparepartMasuk />;
      case "keluar":
        return <SparepartKeluar />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarGudang activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Halo, {user?.name}</h1>
            <p className="text-sm text-gray-500">Selamat datang di Dashboard Gudang</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Online</span>
            </div>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardGudang;