import React, { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import { 
  FiSearch, 
  FiUser, 
  FiPhone, 
  FiCalendar, 
  FiSettings,
  FiMessageSquare,
  FiAlertCircle,
  FiRefreshCw,
  FiClock
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const ManajemenPelanggan = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/data/customers.json");
        let data = await response.json();
        
        // Process data to add service overdue status
        data = data.map(customer => {
          const isOverdue = checkServiceOverdue(customer.lastServiceDate);
          return {
            ...customer,
            isServiceOverdue: isOverdue,
            serviceStatus: getServiceStatus(customer.lastServiceDate)
          };
        });
        
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to check if service is overdue (>3 months)
  const checkServiceOverdue = (serviceDate) => {
    if (!serviceDate) return true; // Jika belum pernah service
    
    const threeMonthsInMs = 3 * 30 * 24 * 60 * 60 * 1000; // 3 bulan dalam milidetik
    const lastServiceDate = new Date(serviceDate).getTime();
    const currentDate = new Date().getTime();
    
    return (currentDate - lastServiceDate) > threeMonthsInMs;
  };

  // Function to determine service status
  const getServiceStatus = (serviceDate) => {
    if (!serviceDate) return 'Belum Service';
    return checkServiceOverdue(serviceDate) ? 'Perlu Service' : 'Aktif';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSendWhatsApp = (cust) => {
    const pesan = `Halo ${cust.name}, kendaraan Anda (${cust.vehicleModel}, plat ${cust.plat_no}) terakhir diservis pada ${cust.lastServiceDate || 'belum pernah'} untuk ${cust.lastServiceType || '-'}. Sudah waktunya untuk melakukan service kembali. Silakan hubungi kami untuk booking.`;

    const phoneNumber = cust.phone.replace("+", "");
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(pesan)}`;

    window.open(url, "_blank");
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                         c.plat_no.toLowerCase().includes(search.toLowerCase());
    const matchesOverdueFilter = !showOverdueOnly || c.isServiceOverdue;
    return matchesSearch && matchesOverdueFilter;
  });

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen">
      <SidebarAdmin />

      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Pelanggan</h1>
            <p className="text-gray-600">Kelola data pelanggan dan layanan</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className={`${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama atau plat nomor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOverdueOnly}
                  onChange={(e) => setShowOverdueOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 flex items-center">
                  <FiClock className="mr-1" />
                  Tampilkan yang perlu service (lebig dari 3 bulan)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Memuat data pelanggan...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pelanggan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kendaraan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kontak
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Terakhir Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiUser className="text-blue-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {c.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {c.plat_no}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {c.vehicleModel}
                          </div>
                          <div className="text-xs text-gray-500">
                            {c.vehicleType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <a 
                              href={`tel:${c.phone}`} 
                              className="flex items-center hover:text-blue-600"
                            >
                              <FiPhone className="mr-1" />
                              {c.phone}
                            </a>
                          </div>
                          <div className="text-xs text-gray-500">
                            {c.email || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiCalendar className="mr-1 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {c.lastServiceDate || 'Belum ada'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {c.lastServiceType || '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${c.serviceStatus === 'Aktif' ? 'bg-green-100 text-green-800' : 
                              c.serviceStatus === 'Perlu Service' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {c.serviceStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSendWhatsApp(c)}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                            >
                              <FaWhatsapp className="text-white" />
                              <span>WhatsApp</span>
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                              <FiSettings />
                              <span>Detail</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCustomers.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Tidak ada pelanggan ditemukan
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {showOverdueOnly 
                      ? "Tidak ada pelanggan yang perlu service (>3 bulan)"
                      : "Coba ubah kriteria pencarian Anda"}
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

export default ManajemenPelanggan;