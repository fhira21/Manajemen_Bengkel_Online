import React, { useEffect, useState } from "react";
import SidebarGudang from "../../components/SideBarGudang";
import SparepartMasuk from "./SparepartMasuk";
import SparepartKeluar from "./SparepartKeluar";
import { FiSearch, FiAlertTriangle, FiBox, FiPackage, FiCheckCircle, FiXCircle, FiTrendingUp, FiLayers } from "react-icons/fi";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

const DashboardGudang = () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const [userData, setUserData] = useState(null);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [filterStokRendah, setFilterStokRendah] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [sparepartsData, setSparepartsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    totalSpareparts: 0,
    totalStock: 0,
    lowStockItems: 0,
    todaysTransactions: 0
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);

    // Fetch spareparts_with_stock view
    const { data: spData, error: spError } = await supabase
      .from("spareparts_with_stock")
      .select("*")
      .order("nama");

    // Fetch today's transactions count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: txCount, error: txError } = await supabase
      .from("inventory_transactions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    if (spError) console.error("Error fetching spareparts:", spError);
    if (txError) console.error("Error fetching transactions:", txError);

    if (spData) {
      setSparepartsData(spData);

      const totalSp = spData.length;
      const totalSt = spData.reduce(
        (acc, curr) => acc + Number(curr.stok || 0),
        0
      );

      const lowSt = spData.filter(
        item => Number(item.stok || 0) <= Number(item.stok_minimum || 0)
      ).length;


      setStats({
        totalSpareparts: totalSp,
        totalStock: totalSt,
        lowStockItems: lowSt,
        todaysTransactions: txCount || 0
      });
    }

    setIsLoading(false);
  };

  const fetchUserData = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("users")
      .select("nama_lengkap")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setUserData(data);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatus = (stok, stok_minimum) => {
    const stock = Number(stok || 0);
    const min = Number(stok_minimum || 0);
    if (stock === 0) return { label: "Habis", color: "bg-red-50 text-red-700 border-red-200", icon: <FiXCircle className="w-3.5 h-3.5 mr-1.5" /> };
    if (stock <= min) return { label: "Menipis", color: "bg-orange-50 text-orange-700 border-orange-200", icon: <FiAlertTriangle className="w-3.5 h-3.5 mr-1.5" /> };
    return { label: "Aman", color: "bg-green-50 text-green-700 border-green-200", icon: <FiCheckCircle className="w-3.5 h-3.5 mr-1.5" /> };
  };

  const filteredSpareparts = sparepartsData.filter(item => {
    const keyword = searchKeyword.toLowerCase();
    const matchSearch = item.nama?.toLowerCase().includes(keyword) ||
      item.kode_part?.toLowerCase().includes(keyword);
    const matchStok = !filterStokRendah || Number(item.current_stock) <= Number(item.stok_minimum);
    return matchSearch && matchStok;
  });

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {/* Stat Cards */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Total Sparepart</p>
                  <h3 className="text-3xl font-black text-gray-800">{stats.totalSpareparts}</h3>
                </div>
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl shadow-inner">
                  <FiBox />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Total Fisik Stok</p>
                  <h3 className="text-3xl font-black text-gray-800">{stats.totalStock}</h3>
                </div>
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl shadow-inner">
                  <FiLayers />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Stok Menipis</p>
                  <h3 className="text-3xl font-black text-red-600">{stats.lowStockItems}</h3>
                </div>
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 text-2xl shadow-inner">
                  <FiAlertTriangle />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Transaksi Harian</p>
                  <h3 className="text-3xl font-black text-gray-800">{stats.todaysTransactions}</h3>
                </div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 text-2xl shadow-inner">
                  <FiTrendingUp />
                </div>
              </div>
            </motion.div>

            {/* Table Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FiPackage className="text-blue-600" />
                  Monitoring Stok Sparepart
                </h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cari kode atau nama..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                    />
                  </div>

                  <label className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={filterStokRendah}
                      onChange={(e) => setFilterStokRendah(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      Tampilkan Stok Rendah
                    </span>
                  </label>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-gray-50/50">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kode Part</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Sparepart</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Stok Minimum</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Sisa Stok</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {filteredSpareparts.map((item) => {
                        const statusObj = getStatus(
                          item.stok,
                          item.stok_minimum
                        );
                         return (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.kode_part}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{item.nama}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{item.stok_minimum}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                                {item.stok || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusObj.color}`}>
                                {statusObj.icon}
                                {statusObj.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredSpareparts.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <FiSearch className="w-12 h-12 mb-3 text-gray-300" />
                              <p className="text-lg font-medium text-gray-600">Tidak ada data sparepart</p>
                              <p className="text-sm">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                            </div>
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
    <div className="flex bg-gray-50 min-h-screen">
      <SidebarGudang activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-1 tracking-wider uppercase">Warehouse Management</p>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                Dashboard Gudang
              </h1>
            </div>
            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col text-right">
                <span className="text-xs text-gray-500 font-medium">Masuk sebagai</span>
                <span className="text-sm font-bold text-gray-900">{userData?.nama_lengkap || user?.name || "Loading..."}</span>
              </div>
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                {userData?.nama_lengkap?.charAt(0) || user?.name?.charAt(0) || "W"}
              </div>
            </div>
          </div>
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardGudang;
