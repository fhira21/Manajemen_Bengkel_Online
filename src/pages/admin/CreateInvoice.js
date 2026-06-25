import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../../components/SidebarAdmin";
import { FiFileText, FiCheckCircle } from "react-icons/fi";

export default function CreateInvoice() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [services, setServices] = useState([]);
  const [spareparts, setSpareparts] = useState([]);

  // Totals
  const [totalService, setTotalService] = useState(0);
  const [totalSparepart, setTotalSparepart] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get Service Report for this booking
      const { data: reportData, error: reportError } = await supabase
        .from("service_reports")
        .select("id")
        .eq("booking_id", bookingId)
        .single();

      if (reportError) throw reportError;
      setReport(reportData);

      // 2. Get Services
      const { data: srsData, error: srsError } = await supabase
        .from("service_report_services")
        .select(`
          id, service_id,
          services ( nama, harga )
        `)
        .eq("service_report_id", reportData.id);

      if (srsError) throw srsError;
      setServices(srsData || []);

      const tService = (srsData || []).reduce((acc, curr) => acc + (curr.services?.harga || 0), 0);
      setTotalService(tService);

      // 3. Get Spareparts
      const { data: srsSpData, error: srsSpError } = await supabase
        .from("service_report_spareparts")
        .select(`
          id, sparepart_id, qty,
          spareparts ( nama, harga_jual )
        `)
        .eq("service_report_id", reportData.id);

      if (srsSpError) throw srsSpError;
      setSpareparts(srsSpData || []);

      const tSparepart = (srsSpData || []).reduce((acc, curr) => acc + ((curr.spareparts?.harga_jual || 0) * (curr.qty || 1)), 0);
      setTotalSparepart(tSparepart);

      setGrandTotal(tService + tSparepart);

    } catch (err) {
      console.error("Error fetching data:", err);
      // It might be empty if the report isn't complete, we handle it gracefully
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setGenerating(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) throw new Error("Please login first");

      // 1. Generate Invoice Number: INV-YYYYMMDD-XXXX
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
      
      const { count, error: countError } = await supabase
        .from("invoices")
        .select("id", { count: "exact" })
        .like("invoice_number", `INV-${dateStr}-%`);

      if (countError && countError.code !== 'PGRST116') {
         // ignore if no rows
      }

      const seq = (count || 0) + 1;
      const invoiceNumber = `INV-${dateStr}-${seq.toString().padStart(4, "0")}`;

      // 2. Insert Invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert([{
          booking_id: bookingId,
          invoice_number: invoiceNumber,
          total_service: totalService,
          total_sparepart: totalSparepart,
          grand_total: grandTotal,
          status: "draft",
          created_by: currentUser.id
        }])
        .select("id")
        .single();

      if (invoiceError) throw invoiceError;
      const newInvoiceId = invoiceData.id;

      // 3. Copy Services
      if (services.length > 0) {
        const invoiceServicesPayload = services.map(s => ({
          invoice_id: newInvoiceId,
          service_id: s.service_id,
        }));
        const { error: isError } = await supabase.from("invoice_services").insert(invoiceServicesPayload);
        if (isError) throw isError;
      }

      // 4. Copy Spareparts
      if (spareparts.length > 0) {
        const invoiceSparepartsPayload = spareparts.map(sp => ({
          invoice_id: newInvoiceId,
          sparepart_id: sp.sparepart_id,
          qty: sp.qty
        }));
        const { error: ispError } = await supabase.from("invoice_spareparts").insert(invoiceSparepartsPayload);
        if (ispError) throw ispError;
      }

      // 5. Success
      alert("Invoice generated successfully!");
      navigate("/admin/invoices/history");

    } catch (err) {
      console.error("Error generating invoice:", err);
      alert(`Failed to generate invoice: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 md:ml-64 p-8 flex justify-center items-center">
          <p className="text-gray-500 animate-pulse">Memuat data Service Report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
              <p className="text-gray-500">Generate nota dari service report</p>
            </div>
            <button
              onClick={handleGenerateInvoice}
              disabled={generating || !report}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all"
            >
              <FiFileText /> {generating ? "Generating..." : "Generate Nota"}
            </button>
          </div>

          {!report ? (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200">
              Service Report belum dibuat untuk Booking ini.
            </div>
          ) : (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Services List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <h2 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Services</h2>
                  {services.length === 0 ? (
                    <p className="text-gray-500 text-sm">Tidak ada service.</p>
                  ) : (
                    <ul className="space-y-3">
                      {services.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{item.services?.nama}</span>
                          <span className="font-medium">Rp {item.services?.harga?.toLocaleString("id-ID")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900">
                    <span>Total Service:</span>
                    <span>Rp {totalService.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Spareparts List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <h2 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Spareparts</h2>
                  {spareparts.length === 0 ? (
                    <p className="text-gray-500 text-sm">Tidak ada pemakaian sparepart.</p>
                  ) : (
                    <ul className="space-y-3">
                      {spareparts.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{item.spareparts?.nama} <span className="text-gray-400 text-xs">x{item.qty}</span></span>
                          <span className="font-medium">Rp {(item.qty * (item.spareparts?.harga_jual || 0)).toLocaleString("id-ID")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900">
                    <span>Total Sparepart:</span>
                    <span>Rp {totalSparepart.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
                <div>
                  <p className="text-blue-100 mb-1">Grand Total</p>
                  <h2 className="text-3xl font-black">Rp {grandTotal.toLocaleString("id-ID")}</h2>
                </div>
                <FiCheckCircle className="text-5xl text-blue-400 opacity-50" />
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
