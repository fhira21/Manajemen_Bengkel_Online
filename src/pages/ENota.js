import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { FiCheckCircle } from "react-icons/fi";

export default function ENota() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchInvoice();
  }, [token]);

  const fetchInvoice = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          bookings (
            id, tgl_booking,
            customers ( nama, no_telepon ),
            vehicles ( plat_nomor, tipe_kendaraan )
          ),
          invoice_services (
            qty,
            harga,
            subtotal,
            services ( nama )
          ),
          invoice_spareparts (
            qty,
            harga,
            subtotal,
            spareparts ( nama )
          )
        `)
        .eq("public_token", token)
        .single();
      console.log("INVOICE DATA", data);

      if (error) throw error;
      setInvoice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Memuat E-Nota...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invoice Tidak Ditemukan</h2>
          <p className="text-gray-500 text-sm">Tautan e-nota tidak valid atau invoice telah dihapus.</p>
        </div>
      </div>
    );
  }

  const { bookings, invoice_services, invoice_spareparts } = invoice;
  const customer = bookings?.customers;
  const vehicle = bookings?.vehicles;

  // Assuming Promo was deducted from Subtotal to make DPP. 
  // We can calculate Promo if not stored explicitly by: (TotalService + TotalSparepart) - DPP
  // But wait, the original logic in CreateInvoice: DPP = max(0, Subtotal - Promo)
  // Subtotal = total_service + total_sparepart
  const subtotalService =
    Number(invoice.subtotal_service || 0);

  const subtotalSparepart =
    Number(invoice.subtotal_sparepart || 0);

  const subtotal =
    subtotalService +
    subtotalSparepart;

  const promoDiscount =
    Number(invoice.diskon || 0);

  const dpp =
    Math.max(
      0,
      subtotal - promoDiscount
    );

  const ppn =
    Number(invoice.ppn || 0);

  const grandTotal =
    Number(invoice.total || 0);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans flex flex-col items-center">

      {/* E-Nota Card */}
      <div
        ref={printRef}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:max-w-none print:w-full print:rounded-none"
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 text-center">
          <h1 className="text-2xl font-black tracking-tight">BENGKEL VOLKSWAGEN</h1>
          <p className="text-blue-100 text-sm mt-1">Jl. Sudirman No. 123, Jakarta Selatan</p>
          <p className="text-blue-100 text-sm">Telp: 0812-3456-7890</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">

          {/* Status Badge */}
          <div className="flex justify-center -mt-10">
            <div className="bg-white px-4 py-2 rounded-full shadow-md border border-gray-100 flex items-center gap-2 text-green-600 font-bold text-sm">
              <FiCheckCircle size={18} /> Pembayaran Berhasil
            </div>
          </div>

          {/* Invoice Info */}
          <div className="flex flex-col items-center border-b border-gray-200 pb-6 border-dashed">
            <h2 className="text-gray-500 text-sm font-semibold mb-1">Total Pembayaran</h2>
            <p className="text-4xl font-black text-gray-900 mb-4">Rp {grandTotal.toLocaleString("id-ID")}</p>
            <div className="w-full grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-gray-500">No. Invoice</div>
              <div className="font-semibold text-right text-gray-900">{invoice.invoice_number}</div>
              <div className="text-gray-500">Tanggal</div>
              <div className="font-semibold text-right text-gray-900">{new Date(invoice.created_at).toLocaleString("id-ID")}</div>
              {/* Payment Method is not stored directly in DB based on our schema, but let's assume it was successful */}
              <div className="text-gray-500">Status</div>
              <div className="font-semibold text-right text-green-600 uppercase">{invoice.status}</div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-b border-gray-200 pb-6 border-dashed">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Detail Pelanggan</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-gray-500">Nama</div>
              <div className="font-semibold text-right text-gray-900">{customer?.nama}</div>
              <div className="text-gray-500">No. Telepon</div>
              <div className="font-semibold text-right text-gray-900">{customer?.no_telepon}</div>
              <div className="text-gray-500">Kendaraan</div>
              <div className="font-semibold text-right text-gray-900">{vehicle?.tipe_kendaraan}</div>
              <div className="text-gray-500">Plat Nomor</div>
              <div className="font-semibold text-right text-gray-900">{vehicle?.plat_nomor}</div>
            </div>
          </div>

          {/* Rincian Pesanan */}
          <div className="border-b border-gray-200 pb-6 border-dashed">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Rincian Servis & Sparepart</h3>

            {invoice_services?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Services</p>
                <div className="space-y-3">
                  {invoice_services.map((item, idx) => {
                    const price =
                      item.harga || 0;
                    const q = item.qty || 1;
                    return (
                      <div key={idx} className="flex justify-between text-sm">
                        <div className="text-gray-700">
                          <p>{item.services?.nama}</p>
                          <p className="text-xs text-gray-400">{q} x Rp {price.toLocaleString("id-ID")}</p>
                        </div>
                        <div className="font-medium text-gray-900">Rp {(q * price).toLocaleString("id-ID")}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {invoice_spareparts?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Spareparts</p>
                <div className="space-y-3">
                  {invoice_spareparts.map((item, idx) => {
                    const price =
                      item.harga || 0;
                    const q = item.qty || 1;
                    return (
                      <div key={idx} className="flex justify-between text-sm">
                        <div className="text-gray-700">
                          <p>{item.spareparts?.nama}</p>
                          <p className="text-xs text-gray-400">{q} x Rp {price.toLocaleString("id-ID")}</p>
                        </div>
                        <div className="font-medium text-gray-900">Rp {(q * price).toLocaleString("id-ID")}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Summary / Tax Calculation */}
          <div className="border-b border-gray-200 pb-6 border-dashed text-sm space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal Servis</span>
              <span>
                Rp {subtotalService.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Subtotal Sparepart</span>
              <span>
                Rp {subtotalSparepart.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800 pt-2">
              <span>Total Keseluruhan</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Promo / Diskon</span>
                <span>- Rp {promoDiscount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-100">
              <span>Dasar Pengenaan Pajak (DPP)</span>
              <span>Rp {dpp.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>PPN 11%</span>
              <span>Rp {ppn.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-lg font-black text-gray-900">
            <span>Grand Total</span>
            <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center text-gray-500 text-xs">
          <p>Terima kasih telah mempercayakan servis kendaraan Anda kepada kami.</p>
          <p className="mt-1 font-medium">Semoga perjalanan Anda aman dan nyaman!</p>
        </div>
      </div>
    </div>
  );
}
