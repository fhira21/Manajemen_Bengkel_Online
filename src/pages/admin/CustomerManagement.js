import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import SidebarAdmin from "../../components/SidebarAdmin";
import { FiEye, FiSearch, FiX, FiUser, FiPhone, FiMail, FiMapPin, FiCalendar } from "react-icons/fi";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const term = search.toLowerCase();
    const nama = c.nama?.toLowerCase() || "";
    const telp = c.no_telepon?.toLowerCase() || "";
    const email = c.email?.toLowerCase() || "";
    const alamat = c.alamat?.toLowerCase() || "";

    return nama.includes(term) || telp.includes(term) || email.includes(term) || alamat.includes(term);
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const totalCustomers = customers.length;
  const customersWithEmail = customers.filter(c => c.email).length;
  const customersWithAddress = customers.filter(c => c.alamat).length;
  const newCustomersThisMonth = customers.filter(c => {
    if (!c.created_at) return false;
    const date = new Date(c.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans text-gray-900">
      <SidebarAdmin />
      <div className="flex-1 pt-16 md:pt-0 md:ml-64 p-4 sm:pt-20 p-6 md:pt-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">Customer Management</h1>
              <p className="text-gray-500 mt-1">View and manage registered customers.</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Total Customers</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{totalCustomers}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Customers With Email</p>
              <p className="text-3xl font-black text-blue-600 mt-2">{customersWithEmail}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Customers With Address</p>
              <p className="text-3xl font-black text-green-600 mt-2">{customersWithAddress}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">New This Month</p>
              <p className="text-3xl font-black text-orange-600 mt-2">{newCustomersThisMonth}</p>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customer, phone number, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Customer Table Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold">
                  <tr>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Phone Number</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 animate-pulse font-medium">
                        Memuat data customer...
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">
                        No customer data found.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{c.nama}</td>
                        <td className="px-6 py-4 font-mono text-gray-600">{c.no_telepon}</td>
                        <td className="px-6 py-4 text-gray-600">{c.email || "-"}</td>
                        <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{c.alamat || "-"}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString("id-ID", {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          }) : "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedCustomer(c);
                              setShowModal(true);
                            }}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2 mx-auto font-bold"
                          >
                            <FiEye /> Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* DETAIL MODAL */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-3xl mx-4 md:mx-0 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen animate-fade-in">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-black text-gray-800 text-lg">Customer Information</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto bg-white p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-1"><FiUser /> Name</p>
                  <p className="font-bold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedCustomer.nama}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-1"><FiPhone /> Phone Number</p>
                  <p className="font-bold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedCustomer.no_telepon}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-1"><FiMail /> Email</p>
                  <p className="font-bold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedCustomer.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-1"><FiCalendar /> Joined Date</p>
                  <p className="font-bold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString("id-ID", {
                      year: 'numeric', month: 'long', day: 'numeric'
                    }) : "-"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-1"><FiMapPin /> Address</p>
                  <p className="font-bold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100 min-h-[80px]">
                    {selectedCustomer.alamat || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 md:p-6 bg-white border-t border-gray-100">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl font-bold transition-all shadow-md"
              >
                Close
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
