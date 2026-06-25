import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import SidebarMontir from "../../components/SidebarMontir";
import { FiArrowLeft, FiSave, FiUser, FiPhone, FiCalendar, FiTool, FiBox, FiPlus } from "react-icons/fi";
import { FaCar } from "react-icons/fa";

export default function ServiceReport() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [booking, setBooking] = useState(null);

  // Service Report Notes
  const [reportId, setReportId] = useState(null);
  const [keluhanCustomer, setKeluhanCustomer] = useState("");
  const [catatanMontir, setCatatanMontir] = useState("");
  const [tindakanPerbaikan, setTindakanPerbaikan] = useState("");
  const [rekomendasiService, setRekomendasiService] = useState("");

  // Spareparts
  const [sparepartsList, setSparepartsList] = useState([]);
  const [selectedSparepart, setSelectedSparepart] = useState("");
  const [qty, setQty] = useState(1);
  const [usedSpareparts, setUsedSpareparts] = useState([]);

  // Services
  const [servicesList, setServicesList] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [usedServices, setUsedServices] = useState([]);
  const [serviceQty, setServiceQty] = useState(1);

  useEffect(() => {
    if (bookingId) {
      fetchData();
    }
  }, [bookingId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Booking Details
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select(`
          id, tgl_booking, status, catatan,
          customers ( nama, no_telepon ),
          vehicles ( plat_nomor, tipe_kendaraan ),
          booking_services ( services ( nama ) )
        `)
        .eq("id", bookingId)
        .single();

      if (bookingError) throw bookingError;
      setBooking(bookingData);

      // 2. Fetch Existing Service Report (if any)
      const { data: reportData } = await supabase
        .from("service_reports")
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle();

      if (reportData) {
        setReportId(reportData.id);
        setKeluhanCustomer(reportData.keluhan_customer || "");
        setCatatanMontir(reportData.catatan_montir || "");
        setTindakanPerbaikan(reportData.tindakan_perbaikan || "");
        setRekomendasiService(reportData.rekomendasi_service || "");
      }

      // 3. Fetch Spareparts Catalog
      const { data: spData, error: spError } = await supabase
        .from("spareparts")
        .select(`id, nama, kode_part, harga_jual`)
        .order("nama", { ascending: true });

      if (spError) throw spError;

      if (spData) {
        setSparepartsList(spData);
      }
      // 4. Fetch Used Spareparts for this report
      if (reportData?.id) {
        const { data: usedSpData } = await supabase
          .from("service_report_spareparts")
          .select(`id, sparepart_id, qty, harga, spareparts 
            ( nama, kode_part, harga_jual )`)
          .eq("report_id", reportData.id);

        if (usedSpData) {
          setUsedSpareparts(usedSpData);
        }
        if (usedSpData) setUsedSpareparts(usedSpData);
      }

      const { data: svcData } = await supabase
        .from("services")
        .select("id, nama, harga")
        .order("nama", { ascending: true });

      if (svcData) {
        setServicesList(svcData);
      }

      if (reportData?.id) {
        const { data: usedSvcData } = await supabase
          .from("service_report_services")
          .select(`id,service_id,qty,harga,services 
            (nama,harga )`)
          .eq("report_id", reportData.id);

        if (usedSvcData) {
          setUsedServices(usedSvcData);
        }
      }

    } catch (err) {
      console.error("Error fetching service report data:", err);
      alert("Gagal memuat data booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser")
      );

      const payload = {
        booking_id: bookingId,
        montir_id: currentUser?.id,
        keluhan_customer: keluhanCustomer,
        catatan_montir: catatanMontir,
        tindakan_perbaikan: tindakanPerbaikan,
        rekomendasi_service: rekomendasiService,
      };

      let newReportId = reportId;

      if (reportId) {
        // Update existing
        const { error } = await supabase
          .from("service_reports")
          .update(payload)
          .eq("id", reportId);
        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("service_reports")
          .insert([{ booking_id: bookingId, catatan_montir: catatanMontir }])
          .select("id")
          .single();
        if (error) throw error;
        newReportId = data.id;
        setReportId(newReportId);
      }

      alert("Service Report berhasil disimpan!");
    } catch (err) {
      console.error("Error saving service report:", err);
      alert(`Gagal menyimpan laporan: ${err.message || "Pastikan kolom tabel sesuai dengan database."}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSparepart = async () => {
    if (!selectedSparepart || qty < 1) return;

    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    setSaving(true);

    try {
      let currentReportId = reportId;

      // Jika report belum ada, buat dulu
      if (!currentReportId) {
        const { data, error } = await supabase
          .from("service_reports")
          .insert([
            {
              booking_id: bookingId,
              montir_id: currentUser?.id,
              keluhan_customer: keluhanCustomer,
              tindakan_perbaikan: tindakanPerbaikan,
              catatan_montir: catatanMontir,
              rekomendasi_service: rekomendasiService,
            },
          ])
          .select("id")
          .single();

        if (error) throw error;

        currentReportId = data.id;
        setReportId(currentReportId);
      }

      // Cari data sparepart yang dipilih
      const sparepart = sparepartsList.find(
        (sp) => sp.id === selectedSparepart
      );

      if (!sparepart) {
        throw new Error("Sparepart tidak ditemukan");
      }

      // Simpan sparepart yang dipakai
      const { data: srSpData, error: srSpError } = await supabase
        .from("service_report_spareparts")
        .insert([
          {
            report_id: currentReportId,
            sparepart_id: selectedSparepart,
            qty: parseInt(qty),
            harga: sparepart.harga_jual,
          },
        ])
        .select(`id, sparepart_id, qty, harga, spareparts 
          ( nama, kode_part, harga_jual ) `)
        .single();

      if (srSpError) throw srSpError;

      // Catat transaksi stok keluar
      const { error: trxError } = await supabase
        .from("inventory_transactions")
        .insert([
          {
            sparepart_id: selectedSparepart,
            dikelola_oleh: currentUser?.id,
            qty: parseInt(qty),
            tipe: "keluar",
            keterangan: `Digunakan untuk Booking ID: ${bookingId}`,
          },
        ]);

      if (trxError) throw trxError;

      setUsedSpareparts((prev) => [...prev, srSpData]);

      setSelectedSparepart("");
      setQty(1);

      alert("Sparepart berhasil ditambahkan!");
    } catch (err) {
      console.error("Error adding sparepart:", err);
      console.log(err.message);
      console.log(err.details);
      console.log(err.hint);

      alert(`Gagal menambahkan sparepart: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };
  const handleAddService = async () => {
    if (!selectedService || serviceQty < 1) return;

    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    setSaving(true);

    try {
      let currentReportId = reportId;

      // Buat report jika belum ada
      if (!currentReportId) {
        const { data, error } = await supabase
          .from("service_reports")
          .insert([
            {
              booking_id: bookingId,
              montir_id: currentUser?.id,
              keluhan_customer: keluhanCustomer,
              tindakan_perbaikan: tindakanPerbaikan,
              catatan_montir: catatanMontir,
              rekomendasi_service: rekomendasiService,
            },
          ])
          .select("id")
          .single();

        if (error) throw error;

        currentReportId = data.id;
        setReportId(currentReportId);
      }

      const service = servicesList.find(
        (s) => s.id === selectedService
      );

      if (!service) {
        throw new Error("Service tidak ditemukan");
      }

      const { data: svcData, error: svcError } =
        await supabase
          .from("service_report_services")
          .insert([
            {
              report_id: currentReportId,
              service_id: selectedService,
              qty: parseInt(serviceQty),
              harga: service.harga,
            },
          ])
          .select(`id, service_id,
      qty, harga, services 
      (nama, harga)`)
          .single();

      if (svcError) throw svcError;

      setUsedServices((prev) => [
        ...prev,
        svcData,
      ]);

      setSelectedService("");
      setServiceQty(1);

      alert("Service berhasil ditambahkan!");
    } catch (err) {
      console.error(err);
      alert(`Gagal menambahkan service: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <SidebarMontir />
        <main className="flex-1 md:ml-64 p-8 flex items-center justify-center">
          <p className="text-gray-500 font-semibold animate-pulse">Memuat data Service Report...</p>
        </main>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <SidebarMontir />
        <main className="flex-1 md:ml-64 p-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
            Booking tidak ditemukan.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <SidebarMontir />

      <main className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <FiArrowLeft /> Kembali ke Dashboard
        </button>

        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Service Report
            </h1>
            <p className="text-gray-500 mt-1">Laporan pengerjaan untuk booking ID: <span className="font-mono text-xs">{bookingId.split('-')[0]}...</span></p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all disabled:opacity-50"
          >
            <FiSave /> {saving ? "Menyimpan..." : "Simpan Laporan"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Information */}
          <div className="lg:col-span-1 space-y-6">

            {/* Customer & Booking Info */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiUser className="text-blue-500" /> Informasi Pelanggan
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 mb-0.5">Nama Pelanggan</p>
                  <p className="font-semibold text-gray-900">{booking.customers?.nama}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Telepon</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5"><FiPhone className="text-gray-400" /> {booking.customers?.no_telepon}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Tgl Booking</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5"><FiCalendar className="text-gray-400" /> {new Date(booking.tgl_booking).toLocaleDateString("id-ID")}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Status</p>
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-xs uppercase tracking-wide">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FaCar className="text-purple-500" /> Kendaraan & Layanan
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 mb-0.5">Kendaraan</p>
                  <p className="font-semibold text-gray-900">{booking.vehicles?.tipe_kendaraan}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Plat Nomor</p>
                  <span className="font-mono text-sm font-bold bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-200 inline-block mt-0.5">
                    {booking.vehicles?.plat_nomor || booking.plat_no}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-500 mb-1.5 flex items-center gap-1"><FiTool /> Layanan Diminta</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {booking.booking_services?.map((bs, i) => (
                      <li key={i} className="text-gray-800 font-medium">{bs.services?.nama}</li>
                    ))}
                    {!booking.booking_services?.length && <li className="text-gray-500">Servis Umum</li>}
                  </ul>
                </div>
                {booking.catatan && (
                  <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 mt-2">
                    <p className="text-xs font-bold text-yellow-800 mb-1">Keluhan Pelanggan:</p>
                    <p className="text-yellow-900 italic">"{booking.catatan}"</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Forms */}
          <div className="lg:col-span-2 space-y-6">

            {/* Notes Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
                Laporan Pengerjaan (Notes)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Keluhan Customer</label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="Keluhan yang dirasakan pelanggan..."
                    value={keluhanCustomer}
                    onChange={(e) => setKeluhanCustomer(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Catatan Montir</label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="Hasil pemeriksaan awal..."
                    value={catatanMontir}
                    onChange={(e) => setCatatanMontir(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tindakan Perbaikan</label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="Detail tindakan perbaikan yang dilakukan..."
                    value={tindakanPerbaikan}
                    onChange={(e) => setTindakanPerbaikan(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Rekomendasi Service</label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="Saran untuk servis selanjutnya..."
                    value={rekomendasiService}
                    onChange={(e) => setRekomendasiService(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiTool className="text-blue-500" />
                Penggunaan Service
              </h3>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <select
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5"
                  value={selectedService}
                  onChange={(e) =>
                    setSelectedService(e.target.value)
                  }
                >
                  <option value="">
                    -- Pilih Service --
                  </option>

                  {servicesList.map((svc) => (
                    <option
                      key={svc.id}
                      value={svc.id}
                    >
                      {svc.nama} - Rp
                      {Number(svc.harga).toLocaleString(
                        "id-ID"
                      )}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={serviceQty}
                  onChange={(e) =>
                    setServiceQty(e.target.value)
                  }
                  className="w-24 border border-gray-200 rounded-xl px-4 py-2.5 text-center"
                />

                <button
                  onClick={handleAddService}
                  disabled={!selectedService || saving}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2"
                >
                  <FiPlus />
                  Tambah
                </button>
              </div>

              {usedServices.length > 0 ? (
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          Service
                        </th>
                        <th className="px-4 py-3 text-center">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-right">
                          Harga
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {usedServices.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-medium">
                            {item.services?.nama}
                          </td>

                          <td className="px-4 py-3 text-center">
                            {item.qty}
                          </td>

                          <td className="px-4 py-3 text-right font-bold">
                            Rp
                            {Number(item.harga).toLocaleString(
                              "id-ID"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed text-gray-500 text-sm">
                  Belum ada service yang ditambahkan.
                </div>
              )}
            </div>

            {/* Sparepart Usage Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiBox className="text-orange-500" /> Penggunaan Sparepart
              </h3>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <select
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 text-sm"
                  value={selectedSparepart}
                  onChange={(e) => setSelectedSparepart(e.target.value)}
                >
                  <option value="">-- Pilih Sparepart --</option>
                  {sparepartsList.map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.kode_part} - {sp.nama}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="w-24 border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 text-sm text-center"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="Qty"
                />
                <button
                  onClick={handleAddSparepart}
                  disabled={!selectedSparepart || saving}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <FiPlus /> Tambah
                </button>
              </div>

              {usedSpareparts.length > 0 ? (
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-left">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Kode Part</th>
                        <th className="px-4 py-3 font-semibold">Nama Sparepart</th>
                        <th className="px-4 py-3 font-semibold text-center">Qty Digunakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {usedSpareparts.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono">{item.spareparts?.kode_part}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{item.spareparts?.nama}</td>
                          <td className="px-4 py-3 text-center font-bold text-gray-900">{item.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed text-gray-500 text-sm">
                  Belum ada sparepart yang ditambahkan untuk pengerjaan ini.
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
