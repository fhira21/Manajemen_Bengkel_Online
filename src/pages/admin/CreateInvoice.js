import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../../components/SidebarAdmin";
import {
  FiFileText, FiPrinter, FiMessageCircle, FiInfo,
  FiTool, FiBox, FiPlus, FiTrash2, FiTag, FiCheckCircle, FiX
} from "react-icons/fi";
import Select from "react-select";

export default function CreateInvoice() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Data State
  const [booking, setBooking] = useState(null);
  const [report, setReport] = useState(null);
  const [mechanicServices, setMechanicServices] = useState([]);
  const [mechanicSpareparts, setMechanicSpareparts] = useState([]);

  // Dropdowns
  const [dbServices, setDbServices] = useState([]);
  const [dbSpareparts, setDbSpareparts] = useState([]);
  const [dbPromos, setDbPromos] = useState([]);

  // Invoice Builder State
  const [addedServices, setAddedServices] = useState([]);
  const [addedSpareparts, setAddedSpareparts] = useState([]);

  // Builder Inputs
  const [selService, setSelService] = useState("");
  const [qtyService, setQtyService] = useState(1);
  const [selSparepart, setSelSparepart] = useState("");
  const [qtySparepart, setQtySparepart] = useState(1);
  const [selectedPromo, setSelectedPromo] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [transactionCode, setTransactionCode] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Booking Info
      const { data: bData, error: bError } = await supabase
        .from("bookings")
        .select(`id,tgl_booking,status,catatan,
          customers:customer_id (nama,no_telepon),
          vehicles:vehicle_id (plat_nomor,tipe_kendaraan)`)
        .eq("id", bookingId)
        .single();
      if (bError) throw bError;
      setBooking(bData);

      // 2. Service Report Info
      const { data: rData } = await supabase
        .from("service_reports")
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle();

      if (rData) {
        setReport(rData);

        // Mechanic Services
        const { data: srsData } = await supabase
          .from("service_report_services")
          .select(`id,report_id,service_id,qty,harga,
            services:service_id (nama, harga)`)
          .eq("report_id", rData.id);
        if (srsData) {
          setMechanicServices(
            srsData.map((s) => ({
              id: s.id,
              service_id: s.service_id,
              nama:
                Array.isArray(s.services)
                  ? s.services[0]?.nama
                  : s.services?.nama || "Service",
              harga: s.harga || s.services?.harga || 0,
              qty: s.qty || 1
            }))
          );
        }

        // Mechanic Spareparts
        const { data: srpData } = await supabase
          .from("service_report_spareparts")
          .select(`id,report_id,sparepart_id,qty,harga,
            spareparts:sparepart_id (nama, harga_jual)`)
          .eq("report_id", rData.id);
        if (srpData) {
          setMechanicSpareparts(
            srpData.map((s) => ({
              id: s.id,
              sparepart_id: s.sparepart_id,
              nama:
                Array.isArray(s.spareparts)
                  ? s.spareparts[0]?.nama
                  : s.spareparts?.nama || "Sparepart",
              harga: s.harga || s.spareparts?.harga_jual || 0,
              qty: s.qty || 1
            }))
          );
        }
      }

      // 3. Dropdowns
      const [sRes, spRes, pRes] = await Promise.all([
        supabase.from("services").select("id, nama, harga"),
        supabase.from("spareparts").select("id, nama, harga_jual"),
        supabase.from("promo").select("*")
      ]);
      console.log("PROMO RESPONSE", pRes);
      console.log("PROMO DATA", pRes.data);
      console.log("PROMO ERROR", pRes.error);
      if (sRes.data) setDbServices(sRes.data);
      if (spRes.data) setDbSpareparts(spRes.data);
      if (pRes.data) setDbPromos(pRes.data);

      console.log(dbPromos);
      console.log(selectedPromo);

    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Gagal memuat data booking.");
    } finally {
      setLoading(false);
    }
  };

  // Add Handlers
  const handleAddService = () => {
    if (!selService || qtyService < 1) return;
    const s = dbServices.find(x => x.id === selService);
    if (!s) return;
    setAddedServices([...addedServices, {
      tempId: Date.now(),
      service_id: s.id,
      nama: s.nama,
      harga: s.harga,
      qty: parseInt(qtyService)
    }]);
    setSelService("");
    setQtyService(1);
  };

  const handleAddSparepart = () => {
    if (!selSparepart || qtySparepart < 1) return;
    const sp = dbSpareparts.find(x => x.id === selSparepart);
    if (!sp) return;
    setAddedSpareparts([...addedSpareparts, {
      tempId: Date.now(),
      sparepart_id: sp.id,
      nama: sp.nama,
      harga: sp.harga_jual,
      qty: parseInt(qtySparepart)
    }]);
    setSelSparepart("");
    setQtySparepart(1);
  };

  const removeAddedService = (id) => setAddedServices(addedServices.filter(s => s.tempId !== id));
  const removeAddedSparepart = (id) => setAddedSpareparts(addedSpareparts.filter(s => s.tempId !== id));

  // Calculations
  const calcTotal = (items) => items.reduce((acc, curr) => acc + (curr.harga * curr.qty), 0);

  const totalMechanicService = calcTotal(mechanicServices);
  const totalMechanicSparepart = calcTotal(mechanicSpareparts);
  const totalAddedService = calcTotal(addedServices);
  const totalAddedSparepart = calcTotal(addedSpareparts);

  const grandTotalService = totalMechanicService + totalAddedService;
  const grandTotalSparepart = totalMechanicSparepart + totalAddedSparepart;

  const promo =
    dbPromos.find(
      (p) =>
        String(p.id) === String(selectedPromo)
    ) || null;
  const promoDiscount =
    Number(promo?.nilai_diskon || 0);

  const subtotal = grandTotalService + grandTotalSparepart;
  const dpp = Math.max(0, subtotal - promoDiscount);
  const ppn = Math.floor(dpp * 0.11);
  const finalGrandTotal = dpp + ppn;

  const changeAmount = (paymentMethod === "Cash" && cashAmount) ? (parseFloat(cashAmount) - finalGrandTotal) : 0;

  // Actions
  const handleGenerateInvoice = async () => {
    if (!paymentMethod) {
      alert("Pilih metode pembayaran terlebih dahulu.");
      return;
    }
    console.log(generatedInvoice);

    setGenerating(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) throw new Error("Please login first");

      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

      const { data: existing } = await supabase
        .from("invoices")
        .select("id")
        .eq("booking_id", bookingId)
        .maybeSingle();

      if (existing) {
        alert("Invoice untuk booking ini sudah dibuat.");
        return;
      }
      const { count } = await supabase
        .from("invoices")
        .select("*", {
          count: "exact",
          head: true
        });

      const seq = (count || 0) + 1;

      const invoiceNumber =
        `INV-${dateStr}-${seq.toString().padStart(4, "0")}`;

      // Insert Invoice
      
      const { data: invData, error: invError } = await supabase
        .from("invoices")
        .insert([{
          booking_id: bookingId,
          promo_id: selectedPromo || null,
          invoice_number: invoiceNumber,
          subtotal_service: grandTotalService,
          subtotal_sparepart: grandTotalSparepart,
          diskon: promoDiscount,
          ppn,
          total: finalGrandTotal,
          payment_method: paymentMethod.toLowerCase(),
          transaction_code:
            paymentMethod !== "Cash"
              ? transactionCode
              : null,
          status: "paid",
          created_by: currentUser.id
        }])
        .select("id, invoice_number, public_token")
        .single();

      if (invError) {
        console.error("Insert Error", invError);
        throw new Error(invError.message || "Pastikan Anda telah menjalankan ALTER TABLE SQL dari Plan.");
      }
      const invoiceId = invData.id;

      // Combine items for insertion
      const allServices = [...mechanicServices, ...addedServices];
      const allSpareparts = [...mechanicSpareparts, ...addedSpareparts];

      if (allServices.length > 0) {
        await supabase
          .from("invoice_services")
          .insert(
            allServices.map((s) => ({
              invoice_id: invoiceId,
              service_id: s.service_id,
              qty: s.qty,
              harga: s.harga,
              subtotal: s.harga * s.qty
            }))
          );
      }

      if (allSpareparts.length > 0) {
        await supabase
          .from("invoice_spareparts")
          .insert(
            allSpareparts.map((s) => ({
              invoice_id: invoiceId,
              sparepart_id: s.sparepart_id,
              qty: s.qty,
              harga: s.harga,
              subtotal: s.harga * s.qty
            }))
          );
      }

      setGeneratedInvoice(invData);
      setShowModal(true);

    } catch (err) {
      console.error(err);
      alert(`Gagal generate invoice: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintFromModal = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleSendWA = () => {
    if (!generatedInvoice || !booking) return;

    const customerName = booking?.customers?.nama || "Pelanggan";
    let phone =
      booking?.customers?.no_telepon || "";

    phone = phone
      .replace(/\D/g, "")
      .replace(/^0/, "62");

    // Base URL is origin
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/e-nota/${generatedInvoice.public_token}`;

    const message = `Halo ${customerName},\n\nServis kendaraan Anda telah selesai.\n\nNomor Invoice:\n${generatedInvoice.invoice_number}\n\nTotal Pembayaran:\nRp ${finalGrandTotal.toLocaleString("id-ID")}\n\nSilakan melihat e-Nota melalui tautan berikut:\n${link}\n\nTerima kasih telah mempercayakan servis kendaraan Anda kepada Bengkel XYZ.`;

    const encodedMessage = encodeURIComponent(message);
    console.log("PHONE:", phone);
    console.log(
      `https://wa.me/${phone}?text=${encodedMessage}`
    );
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="flex-1 md:ml-64 p-8 flex justify-center items-center">
          <p className="text-gray-500 animate-pulse font-semibold">Memuat Workspace Invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans text-gray-900 relative">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Invoice Workspace</h1>
            <p className="text-gray-500 mt-1">Review laporan montir dan terbitkan invoice akhir.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* SECTION 1: Booking Information */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiInfo className="text-blue-500" /> Booking Information
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-0.5">Customer Name</p>
                  <p className="font-semibold text-gray-900">{booking?.customers?.nama}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Phone Number</p>
                  <p className="font-semibold text-gray-900">{booking?.customers?.no_telepon}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Vehicle Type</p>
                  <p className="font-semibold text-gray-900">{booking?.vehicles?.tipe_kendaraan}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">License Plate</p>
                  <p className="font-semibold text-gray-900">{booking?.vehicles?.plat_nomor}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Booking Date</p>
                  <p className="font-semibold text-gray-900">{booking?.tgl_booking ? new Date(booking.tgl_booking).toLocaleDateString("id-ID") : ""}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Status</p>
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold text-xs uppercase">
                    {booking?.status}
                  </span>
                </div>
                <div className="col-span-2 mt-2">
                  <p className="text-gray-500 mb-0.5">Notes</p>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-gray-800 italic">{booking?.catatan || "Tidak ada catatan."}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Service Report */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiFileText className="text-purple-500" /> Service Report
              </h2>
              {!report ? (
                <div className="text-gray-500 italic text-sm py-4 text-center bg-gray-50 rounded-xl">
                  Service Report belum dibuat oleh montir.
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-bold text-gray-700 mb-1">Customer Complaint</p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{report.keluhan_customer || "-"}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 mb-1">Mechanic Notes</p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{report.catatan_montir || "-"}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 mb-1">Repair Actions</p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{report.tindakan_perbaikan || "-"}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 mb-1">Service Recommendations</p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{report.rekomendasi_service || "-"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Mechanic Services */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiTool className="text-green-500" /> Services Used by Mechanic
              </h2>
              {mechanicServices.length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-4">Belum ada service yang ditambahkan.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-2">Service Name</th>
                        <th className="pb-2 text-center">Qty</th>
                        <th className="pb-2 text-right">Price</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {mechanicServices.map((s, i) => (
                        <tr key={i}>
                          <td className="py-2.5 font-medium">{s.nama}</td>
                          <td className="py-2.5 text-center">{s.qty}</td>
                          <td className="py-2.5 text-right">Rp {s.harga.toLocaleString("id-ID")}</td>
                          <td className="py-2.5 text-right font-semibold">Rp {(s.harga * s.qty).toLocaleString("id-ID")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-right font-bold text-gray-900 border-t border-gray-100 pt-3">
                    Total: Rp {totalMechanicService.toLocaleString("id-ID")}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: Mechanic Spareparts */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiBox className="text-orange-500" /> Spareparts Used by Mechanic
              </h2>
              {mechanicSpareparts.length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-4">Belum ada sparepart yang digunakan.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-2">Sparepart</th>
                        <th className="pb-2 text-center">Qty</th>
                        <th className="pb-2 text-right">Price</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {mechanicSpareparts.map((s, i) => (
                        <tr key={i}>
                          <td className="py-2.5 font-medium">{s.nama}</td>
                          <td className="py-2.5 text-center">{s.qty}</td>
                          <td className="py-2.5 text-right">Rp {s.harga.toLocaleString("id-ID")}</td>
                          <td className="py-2.5 text-right font-semibold">Rp {(s.harga * s.qty).toLocaleString("id-ID")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-right font-bold text-gray-900 border-t border-gray-100 pt-3">
                    Total: Rp {totalMechanicSparepart.toLocaleString("id-ID")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: Editable Invoice Builder */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <FiFileText className="text-blue-600" /> Create Invoice
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Add Service Builder */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Add Service</h3>
                <div className="flex items-center gap-3 mb-4 w-full">
                  <div className="flex-1 min-w-0">
                    <Select
                      className="w-full"
                      classNamePrefix="react-select"
                      value={
                        dbServices.find((s) => s.id === selService)
                          ? {
                            value: selService,
                            label:
                              dbServices.find(
                                (s) => s.id === selService
                              ).nama,
                          }
                          : null
                      }
                      onChange={(option) =>
                        setSelService(option?.value || "")
                      }
                      options={dbServices.map((s) => ({
                        value: s.id,
                        label: `${s.nama} (Rp ${s.harga.toLocaleString(
                          "id-ID"
                        )})`,
                      }))}
                      placeholder="Search Service..."
                      isSearchable
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "52px",
                          height: "52px",
                          borderRadius: "16px",
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          height: "52px",
                          padding: "0 14px",
                        }),
                        input: (base) => ({
                          ...base,
                          margin: 0,
                          padding: 0,
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          height: "52px",
                        }),
                      }}
                    />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={qtyService}
                    onChange={(e) =>
                      setQtyService(e.target.value)
                    }
                    className="w-20 sm:w-24 h-[52px] border border-gray-300 rounded-2xl text-center font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={handleAddService}
                    className=" h-[52px] px-5 rounded-2xl bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold flex items-center gap-2 whitespace-nowrap transition ">
                    <FiPlus />
                    Add
                  </button>
                </div>
                {addedServices.length > 0 && (
                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="p-2 text-left">Service</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Subtotal</th>
                          <th className="p-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {addedServices.map(s => (
                          <tr key={s.tempId}>
                            <td className="p-2">{s.nama}</td>
                            <td className="p-2 text-center">{s.qty}</td>
                            <td className="p-2 text-right font-semibold">Rp {(s.harga * s.qty).toLocaleString("id-ID")}</td>
                            <td className="p-2 text-center">
                              <button onClick={() => removeAddedService(s.tempId)} className="text-red-500 hover:text-red-700"><FiTrash2 /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add Sparepart Builder */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Add Sparepart</h3>
                <div className="flex items-center gap-3 mb-4 w-full">
                  <div className="flex-1 min-w-0">
                    <Select
                      className="w-full"
                      classNamePrefix="react-select"
                      value={
                        dbSpareparts.find(
                          (sp) => sp.id === selSparepart
                        )
                          ? {
                            value: selSparepart,
                            label:
                              dbSpareparts.find(
                                (sp) =>
                                  sp.id === selSparepart
                              ).nama,
                          }
                          : null
                      }
                      onChange={(option) =>
                        setSelSparepart(
                          option?.value || ""
                        )
                      }
                      options={dbSpareparts.map((sp) => ({
                        value: sp.id,
                        label: `${sp.nama} (Rp ${sp.harga_jual.toLocaleString(
                          "id-ID"
                        )})`,
                      }))}
                      placeholder="Search Sparepart..."
                      isSearchable
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "52px",
                          height: "52px",
                          borderRadius: "16px",
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          height: "52px",
                          padding: "0 14px",
                        }),
                        input: (base) => ({
                          ...base,
                          margin: 0,
                          padding: 0,
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          height: "52px",
                        }),
                      }}
                    />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={qtySparepart}
                    onChange={(e) =>
                      setQtySparepart(e.target.value)
                    }
                    className="w-20 sm:w-24 h-[52px] border border-gray-300 rounded-2xl text-center font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleAddSparepart}
                    className=" h-[52px] px-5 rounded-2xl bg-orange-100 text-orange-700 hover:bg-orange-200 font-boldflex items-centergap-2 whitespace-nowrap transition"
                  >
                    <FiPlus />
                    Add
                  </button>
                </div>
                {addedSpareparts.length > 0 && (
                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="p-2 text-left">Sparepart</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Subtotal</th>
                          <th className="p-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {addedSpareparts.map(s => (
                          <tr key={s.tempId}>
                            <td className="p-2">{s.nama}</td>
                            <td className="p-2 text-center">{s.qty}</td>
                            <td className="p-2 text-right font-semibold">Rp {(s.harga * s.qty).toLocaleString("id-ID")}</td>
                            <td className="p-2 text-center">
                              <button onClick={() => removeAddedSparepart(s.tempId)}
                                className="text-red-500 hover:text-red-700"><FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col lg:flex-row gap-8 items-start">

              {/* Optional Promo */}
              <div className="w-full lg:w-1/3">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FiTag /> Optional Promo</h3>
                <select
                  value={selectedPromo ?? ""}
                  onChange={(e) =>
                    setSelectedPromo(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- No Promo --</option>
                  {dbPromos.map(p => <option key={p.id} value={p.id}>{p.nama} (-Rp {p.nilai_diskon.toLocaleString("id-ID")})</option>)}
                </select>
                {promoDiscount > 0 && (
                  <div className="mt-2 text-green-600 text-sm font-semibold">
                    Discount Applied: Rp {promoDiscount.toLocaleString("id-ID")}
                  </div>
                )}
              </div>

              {/* Tax Invoice Summary */}
              <div className="w-full lg:w-2/3 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex justify-between">
                    <span>Service Total</span>
                    <span className="font-medium">Rp {grandTotalService.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sparepart Total</span>
                    <span className="font-medium">Rp {grandTotalSparepart.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                    <span>Subtotal</span>
                    <span>
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount</span>
                    <span>
                      - Rp {promoDiscount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-800 font-bold border-t border-gray-200 pt-2">
                    <span>DPP (Tax Base)</span>
                    <span>Rp {dpp.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span>PPN (11%)</span>
                    <span>+ Rp {ppn.toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-300 flex justify-between items-center text-blue-700">
                  <span className="text-xl font-bold">Grand Total</span>
                  <span className="text-3xl font-black tracking-tight">Rp {finalGrandTotal.toLocaleString("id-ID")}</span>
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* SECTION 6: Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 border-b border-gray-100 pb-3">Payment Method</h2>
              <div className="flex gap-3 mb-5">
                {["Cash", "Transfer", "QRIS"].map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`flex-1 py-2 rounded-xl font-bold border-2 transition-all ${paymentMethod === m ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {paymentMethod === "Cash" && (
                <div className="space-y-3 animate-fade-in">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Amount Paid</label>
                    <input
                      type="number"
                      placeholder="e.g. 500000"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
                    />
                  </div>
                  <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 flex justify-between items-center">
                    <span className="font-medium">Change Amount:</span>
                    <span className="text-xl font-black">Rp {changeAmount > 0 ? changeAmount.toLocaleString("id-ID") : "0"}</span>
                  </div>
                </div>
              )}

              {(paymentMethod === "Transfer" || paymentMethod === "QRIS") && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Transaction Code / Ref</label>
                  <input
                    type="text"
                    placeholder="Enter transaction reference"
                    value={transactionCode}
                    onChange={(e) => setTransactionCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              )}
            </div>

            {/* SECTION 7: Invoice Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-center gap-4">
              <button
                onClick={handleGenerateInvoice}
                disabled={generating || !paymentMethod}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <FiCheckCircle size={24} /> {generating ? "Processing..." : "Generate E-Nota & Simpan"}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL: E-Nota Preview */}
      {showModal && generatedInvoice && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-black text-gray-800 text-lg">E-Nota Preview</h2>
              <button
                onClick={() => navigate('/admin/dashboardadmin')}
                className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body: iframe E-Nota */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              <iframe
                ref={iframeRef}
                src={`/e-nota/${generatedInvoice.public_token}`}
                title="E-Nota Document"
                className="w-full h-[600px] border-0 rounded-xl shadow-sm bg-white"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 bg-white border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={handlePrintFromModal}
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
                onClick={() => navigate('/admin/dashboardadmin')}
                className="flex justify-center items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl font-bold transition-colors"
              >
                Tutup & Kembali
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
