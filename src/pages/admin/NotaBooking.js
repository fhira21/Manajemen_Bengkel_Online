import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { jsPDF } from "jspdf";
import Sidebar from "../../components/SidebarAdmin";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../../components/ui/skeleton";
import { FiTrash2 } from "react-icons/fi";

export default function NotaBooking() {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [services, setServices] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [items, setItems] = useState([]);
  const [metode, setMetode] = useState("");
  const [kodeTransaksi, setKodeTransaksi] = useState("");
  const [uangCash, setUangCash] = useState("");
  const [kembalian, setKembalian] = useState(0);
  const [total, setTotal] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const bookingId = window.location.pathname.split("/").pop();

  useEffect(() => {
    fetchBookingData();
    fetchDropdownData();
  }, []);

  const fetchBookingData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, nama, plat_no, no_telepon, tgl_booking, tipe_kendaraan, catatan,
        booking_services (
          services (id, nama, harga)
        )
      `)
      .eq("id", bookingId)
      .single();

    if (error) console.error(error);
    else setBooking(data);
    setLoading(false);
  };

  const fetchDropdownData = async () => {
    const [serviceRes, sparepartRes, promoRes] = await Promise.all([
      supabase.from("services").select("id, nama, harga"),
      supabase.from("spareparts").select("id, nama, harga"),
      supabase.from("promo").select("id, nama, harga_promo"),
    ]);

    if (serviceRes.data) setServices(serviceRes.data);
    if (sparepartRes.data) setSpareparts(sparepartRes.data);
    if (promoRes.data) setPromos(promoRes.data);
  };

  const addItem = (type, itemId) => {
    let selectedItem = null;
    if (type === "service") selectedItem = services.find(s => s.id === itemId);
    if (type === "sparepart") selectedItem = spareparts.find(s => s.id === itemId);
    if (type === "promo") selectedItem = promos.find(p => p.id === itemId);

    if (!selectedItem) return;

    setItems(prev => [
      ...prev,
      {
        id: itemId,
        nama: selectedItem.nama,
        harga: selectedItem.harga || selectedItem.harga_promo,
        qty: 1,
        type,
      },
    ]);
  };

  const removeItem = (id) => setItems(prev => prev.filter(item => item.id !== id));
  const updateQty = (id, qty) =>
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, qty: Number(qty) } : item))
    );

  useEffect(() => {
    const totalHarga = items.reduce((sum, item) => sum + item.harga * item.qty, 0);
    setTotal(totalHarga);
  }, [items]);

  useEffect(() => {
    if (metode === "cash" && uangCash) {
      setKembalian(Number(uangCash) - total);
    } else {
      setKembalian(0);
    }
  }, [metode, uangCash, total]);

  const handleSaveNota = () => {
    if (!metode) return alert("Pilih metode pembayaran terlebih dahulu!");
    if (items.length === 0) return alert("Tambahkan item atau service terlebih dahulu!");

    // Buat teks nota
    let teksNota = `Halo ${booking.nama}! 👋\nTerima kasih sudah melakukan service di bengkel kami.\n\n`;
    teksNota += `Nota Servis Anda:\n-------------------------\n`;
    teksNota += `Nama      : ${booking.nama}\n`;
    teksNota += `Plat No   : ${booking.plat_no}\n`;
    teksNota += `Tanggal   : ${booking.tgl_booking}\n`;
    teksNota += `Tipe      : ${booking.tipe_kendaraan}\n`;
    if (booking.catatan) teksNota += `Catatan Montir: ${booking.catatan}\n`;
    teksNota += `-------------------------\n`;
    teksNota += `Item / Service      Qty   Harga   Subtotal\n`;

    items.forEach((item) => {
      const nama = item.nama.padEnd(18, " "); // padding agar rata
      const qty = String(item.qty).padEnd(5, " ");
      const harga = `Rp ${item.harga.toLocaleString("id-ID")}`.padEnd(10, " ");
      const subtotal = `Rp ${(item.harga * item.qty).toLocaleString("id-ID")}`;
      teksNota += `${nama}${qty}${harga}${subtotal}\n`;
    });

    teksNota += `-------------------------\n`;
    teksNota += `Total: Rp ${total.toLocaleString("id-ID")}\n`;
    teksNota += `Metode Pembayaran: ${metode}\n`;
    if (metode === "cash" && uangCash) {
      teksNota += `Uang Cash: Rp ${Number(uangCash).toLocaleString("id-ID")}\n`;
      teksNota += `Kembalian: Rp ${kembalian.toLocaleString("id-ID")}\n`;
    }
    teksNota += `\nTerima kasih 🙏`;

    // Kirim ke WhatsApp
    const noWa = booking.no_telepon.replace(/\D/g, "").replace(/^0/, "62");
    window.open(`https://wa.me/${noWa}?text=${encodeURIComponent(teksNota)}`, "_blank");

    alert("Nota berhasil dibuat dan dikirim ke WhatsApp pelanggan!");
    setShowConfirm(false);
  };



  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Buat Nota Booking</h1>

        {loading ? (
          <Skeleton className="h-10 w-full" />
        ) : booking ? (
          <div className="space-y-6">
            {/* Informasi Booking */}
            <div className="bg-white shadow p-4 rounded-xl border">
              <h2 className="text-lg font-semibold mb-3">Informasi Booking</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p><strong>Nama:</strong> {booking.nama}</p>
                <p><strong>No Telepon:</strong> {booking.no_telepon}</p>
                <p><strong>Plat No:</strong> {booking.plat_no}</p>
                <p><strong>Tipe:</strong> {booking.tipe_kendaraan}</p>
                <p><strong>Tanggal Booking:</strong> {booking.tgl_booking}</p>
                {booking.catatan && <p><strong>Catatan Montir:</strong> {booking.catatan}</p>}
              </div>
            </div>

            {/* Tambah Item */}
            <div className="bg-white shadow p-4 rounded-xl border">
              <h2 className="text-lg font-semibold mb-3">Tambah Item / Service</h2>
              <div className="flex flex-wrap gap-4 mb-4">
                <select onChange={(e) => addItem("service", e.target.value)} className="border rounded-lg px-3 py-2">
                  <option value="">+ Tambah Service</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>

                <select onChange={(e) => addItem("sparepart", e.target.value)} className="border rounded-lg px-3 py-2">
                  <option value="">+ Tambah Sparepart</option>
                  {spareparts.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>

                <select onChange={(e) => addItem("promo", e.target.value)} className="border rounded-lg px-3 py-2">
                  <option value="">+ Tambah Promo</option>
                  {promos.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>

              <table className="w-full text-sm border-t">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Nama Item</th>
                    <th className="text-center p-2">Qty</th>
                    <th className="text-right p-2">Harga</th>
                    <th className="text-right p-2">Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.nama}</td>
                      <td className="text-center p-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateQty(item.id, e.target.value)}
                          className="w-16 text-center border rounded"
                          min="1"
                        />
                      </td>
                      <td className="text-right p-2">{item.harga.toLocaleString("id-ID")}</td>
                      <td className="text-right p-2">{(item.harga * item.qty).toLocaleString("id-ID")}</td>
                      <td className="text-right p-2">
                        <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-800">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right mt-4 font-semibold text-lg">
                Total: Rp {total.toLocaleString("id-ID")}
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="bg-white shadow p-4 rounded-xl border">
              <h2 className="text-lg font-semibold mb-3">Metode Pembayaran</h2>
              <select
                value={metode}
                onChange={(e) => setMetode(e.target.value)}
                className="border rounded-lg px-3 py-2 mb-3"
              >
                <option value="">Pilih metode</option>
                <option value="qris">QRIS</option>
                <option value="transfer">Transfer</option>
                <option value="cash">Cash</option>
              </select>

              {metode === "cash" && (
                <div>
                  <input
                    type="number"
                    placeholder="Masukkan nominal uang"
                    value={uangCash}
                    onChange={(e) => setUangCash(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                  {uangCash && (
                    <p className="mt-2 text-green-700">
                      Kembalian: Rp {kembalian.toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              )}

              {(metode === "qris" || metode === "transfer") && (
                <input
                  type="text"
                  placeholder="Masukkan kode transaksi"
                  value={kodeTransaksi}
                  onChange={(e) => setKodeTransaksi(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              )}
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConfirm(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
              >
                Buat & Kirim Nota
              </motion.button>
            </div>
          </div>
        ) : (
          <p>Data booking tidak ditemukan.</p>
        )}

        {/* Modal Konfirmasi */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white rounded-xl shadow-lg p-6 w-96 text-center"
              >
                <h3 className="text-lg font-semibold mb-4">Konfirmasi</h3>
                <p className="text-gray-700 mb-6">
                  Apakah Anda yakin ingin membuat dan mengirim nota ke WhatsApp pelanggan?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveNota}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Ya, Kirim
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
