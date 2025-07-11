// File: src/pages/montir/DashboardMontir.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardMontir = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const currentMontirId = currentUser?.id_user;
  const [bookings, setBookings] = useState([]);
  const [kegiatan, setKegiatan] = useState([]);
  const [filterTanggal, setFilterTanggal] = useState(() => {
    return new Date().toISOString().split("T")[0]; // default hari ini
  });

  const [form, setForm] = useState({
    bookingId: "",
    tanggal: new Date().toISOString().split("T")[0],
    catatan: "",
    status: "Selesai",
    sparepartsUsed: "",
  });

  useEffect(() => {
    fetch("/data/booking.json")
      .then((res) => res.json())
      .then((data) => {
        const filteredByMontir = data.filter(
          (b) => Number(b.id_user) === Number(currentMontirId)
        );
        setBookings(filteredByMontir);
      });

    fetch("/data/kegiatan_service.json")
      .then((res) => res.json())
      .then(setKegiatan);
  }, [currentMontirId]);

  const filteredBookings = bookings.filter(
    (b) => b.tanggal_booking === filterTanggal
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: kegiatan.length + 1,
      bookingId: form.bookingId,
      tanggal: form.tanggal,
      catatan: form.catatan,
      status: form.status,
      montirId: currentMontirId,
      sparepartsUsed: form.sparepartsUsed,
    };
    setKegiatan((prev) => [...prev, newEntry]);
    setForm({
      bookingId: "",
      tanggal: new Date().toISOString().split("T")[0],
      catatan: "",
      status: "Selesai",
      sparepartsUsed: "",
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Dashboard Montir, {currentUser?.name}
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("currentUser");
            navigate("/");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Filter Tanggal */}
      <div className="flex gap-4 mb-4 items-center">
        <label className="text-sm font-semibold">Filter tanggal booking:</label>
        <input
          type="date"
          value={filterTanggal}
          onChange={(e) => setFilterTanggal(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Tabel Booking */}
      <h2 className="text-lg font-semibold mb-2">Booking Anda</h2>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-gray-200 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Plat</th>
              <th className="border px-4 py-2">Jenis Servis</th>
              <th className="border px-4 py-2">Tanggal</th>
              <th className="border px-4 py-2">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b) => (
                <tr key={b.id_booking} className="text-center">
                  <td className="border px-2 py-1">{b.id_booking}</td>
                  <td className="border px-2 py-1">{b.plat_nomor}</td>
                  <td className="border px-2 py-1">{b.jenis_service}</td>
                  <td className="border px-2 py-1">{b.tanggal_booking}</td>
                  <td className="border px-2 py-1">{b.catatan}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  Tidak ada booking
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Input Kegiatan */}
      <h2 className="text-lg font-semibold mb-2">Input Kegiatan Service</h2>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 mb-6">
        <select
          value={form.bookingId}
          onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
          required
          className="border p-2 rounded"
        >
          <option value="">Pilih Booking</option>
          {filteredBookings.map((b) => (
            <option key={b.id_booking} value={b.id_booking}>
              {b.id_booking} - {b.plat_nomor}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.tanggal}
          onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
          className="border p-2 rounded"
        />

        <textarea
          value={form.catatan}
          onChange={(e) => setForm({ ...form, catatan: e.target.value })}
          placeholder="Catatan pengerjaan"
          className="border p-2 rounded col-span-full"
          rows={3}
        />

        <input
          type="text"
          value={form.sparepartsUsed}
          onChange={(e) => setForm({ ...form, sparepartsUsed: e.target.value })}
          placeholder="Sparepart yang digunakan (contoh: Filter Oli x1, Oli Mesin x4)"
          className="border p-2 rounded col-span-full"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded col-span-full md:w-max"
        >
          Simpan Kegiatan
        </button>
      </form>

      {/* Tombol ke riwayat */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/montir/riwayat")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Lihat Riwayat Service
        </button>
      </div>
    </div>
  );
};

export default DashboardMontir;
