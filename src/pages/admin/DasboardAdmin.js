import React, { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import {
  FiSearch,
  FiCalendar,
  FiRefreshCw,
  FiUser,
  FiPhone,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from "react-icons/fi";

const DashboardAdmin = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tanggalFilter, setTanggalFilter] = useState("");
  const [montirs, setMontirs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    cancelled: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API calls
        const [bookingsRes, usersRes] = await Promise.all([
          fetch("/data/booking.json"),
          fetch("/data/userData.json")
        ]);
        
        const bookingsData = await bookingsRes.json();
        const usersData = await usersRes.json();
        
        setBookings(bookingsData);
        setMontirs(usersData.filter(u => u.role === "montir"));
        
        // Calculate stats
        setStats({
          total: bookingsData.length,
          completed: bookingsData.filter(b => b.status === "Selesai").length,
          inProgress: bookingsData.filter(b => b.status === "Proses").length,
          cancelled: bookingsData.filter(b => b.status === "Batal").length
        });
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMontirChange = (id_booking, id_user) => {
    setBookings(prev =>
      prev.map(b =>
        b.id_booking === id_booking ? { ...b, id_user: Number(id_user) } : b
      )
    );
  };

  const handleRefresh = () => {
    // Add actual refresh logic here
    window.location.reload();
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.plat_nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.jenis_service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.nama_pelanggan?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTanggal =
      !tanggalFilter || b.tanggal_booking === tanggalFilter;
    return matchesSearch && matchesTanggal;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "Selesai":
        return <FiCheckCircle className="text-green-500" />;
      case "Proses":
        return <FiClock className="text-blue-500" />;
      case "Batal":
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiAlertCircle className="text-yellow-500" />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen">
      <SidebarAdmin />

      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
            <p className="text-gray-600">Kelola booking dan pantau aktivitas bengkel</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className={`${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 font-medium">Total Booking</h3>
              <div className="p-2 bg-blue-100 rounded-full">
                <FiClock className="text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.total}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 font-medium">Selesai</h3>
              <div className="p-2 bg-green-100 rounded-full">
                <FiCheckCircle className="text-green-500" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.completed}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 font-medium">Proses</h3>
              <div className="p-2 bg-yellow-100 rounded-full">
                <FiClock className="text-yellow-500" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.inProgress}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 font-medium">Batal</h3>
              <div className="p-2 bg-red-100 rounded-full">
                <FiXCircle className="text-red-500" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari plat, service, atau nama pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="date"
                value={tanggalFilter}
                onChange={(e) => setTanggalFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Memuat data...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Booking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pelanggan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plat Nomor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jenis Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montir
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map(b => (
                      <tr key={b.id_booking} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{b.id_booking}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiUser className="text-blue-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {b.nama_pelanggan || "Tidak ada nama"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {b.no_telp || "-"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {b.plat_nomor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {b.jenis_service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {b.tanggal_booking}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(b.status)}
                            <span className="ml-2 text-sm text-gray-900">
                              {b.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <select
                            value={b.id_user || ""}
                            onChange={(e) => handleMontirChange(b.id_booking, e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">Pilih Montir</option>
                            {montirs.map(m => (
                              <option key={m.id_user} value={m.id_user}>
                                {m.nama}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredBookings.length === 0 && (
                <div className="text-center py-8">
                  <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Tidak ada booking ditemukan
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Coba ubah kriteria pencarian Anda
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;