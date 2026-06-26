import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import SidebarAdmin from "../../components/SidebarAdmin";
import { FiEye, FiSearch, FiPrinter, FiMessageCircle, FiX } from "react-icons/fi";

export default function InvoiceHistory() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");

  // Modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id, invoice_number, public_token, total, payment_method, status, created_at,
          bookings (
            customers ( nama, no_telepon ),
            vehicles ( plat_nomor, tipe_kendaraan )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const customer = inv.bookings?.customers?.nama?.toLowerCase() || "";
    const plate = inv.bookings?.vehicles?.plat_nomor?.toLowerCase() || "";
    const num = inv.invoice_number?.toLowerCase() || "";
    const term = search.toLowerCase();

    const matchesSearch = customer.includes(term) || plate.includes(term) || num.includes(term);
    const matchesPayment = paymentFilter === "All" || inv.payment_method === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleSendWA = () => {
    if (!selectedInvoice) return;
    const customerName = selectedInvoice.bookings?.customers?.nama || "Pelanggan";
    const phone = selectedInvoice.bookings?.customers?.no_telepon || "";
    const baseUrl = window.location.origin;

    const message = `Halo ${customerName},\n\nInvoice Anda:\n${selectedInvoice.invoice_number}\n\nSilakan melihat e-Nota:\n${baseUrl}/e-nota/${selectedInvoice.public_token}\n\nTerima kasih.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans text-gray-900">
      <SidebarAdmin />
      <div className="flex-1 pt-16 md:pt-0 md:ml-64 p-4 pt-20 p-6 md:pt-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">Invoice History</h1>
              <p className="text-gray-500 mt-1">View and manage generated e-invoices.</p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoice, customer, or plate number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full md:w-40 border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">All Payments</option>
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="qris">QRIS</option>
              </select>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold">
                  <tr>
                    <th className="px-6 py-4">Invoice Number</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4 text-center">Payment</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 animate-pulse font-medium">
                        Memuat data invoice...
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 italic">
                        Tidak ada invoice yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{inv.invoice_number}</td>
                        <td className="px-6 py-4">{inv.bookings?.customers?.nama}</td>
                        <td className="px-6 py-4 font-mono text-gray-500">{inv.bookings?.vehicles?.plat_nomor}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${inv.payment_method === 'Cash' ? 'bg-green-100 text-green-700' :
                              inv.payment_method === 'Transfer' ? 'bg-blue-100 text-blue-700' :
                                inv.payment_method === 'QRIS' ? 'bg-purple-100 text-purple-700' :
                                  'bg-gray-100 text-gray-700'
                            }`}>
                            {inv.payment_method || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          Rp {(inv.total || inv.total || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(inv.created_at).toLocaleDateString("id-ID", {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowModal(true);
                            }}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-2 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto font-medium"
                          >
                            <FiEye /> View E-Nota
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

      {/* MODAL: E-Nota Preview */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen animate-fade-in mx-4 md:mx-0">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-black text-gray-800 text-lg">E-Nota Preview</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body: iframe E-Nota */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              <iframe
                ref={iframeRef}
                src={`/e-nota/${selectedInvoice.public_token}`}
                title="E-Nota Document"
                className="w-full h-[500px] md:h-[600px] border-0 rounded-xl shadow-sm bg-white"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 md:p-6 bg-white border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={handlePrint}
                className="flex justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold transition-colors"
              >
                <FiPrinter /> Print E-Nota
              </button>
              <button
                onClick={handleSendWA}
                className="flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-green-500/30"
              >
                <FiMessageCircle /> Send WhatsApp
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex justify-center items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl font-bold transition-colors"
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
