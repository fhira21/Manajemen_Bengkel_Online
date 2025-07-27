import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Skeleton from "../components/ui/skeleton";

const Booking = () => {
  const [nama, setNama] = useState("");
  const [platNo, setPlatNo] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [tipeKendaraan, setTipeKendaraan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [tglBooking, setTglBooking] = useState("");

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, nama, deskripsi, harga");

      if (!error && data) {
        const cleanedData = data.map((s) => ({
          ...s,
          harga: Number(s.harga),
        }));
        setServices(cleanedData);
      }
      setLoadingServices(false);
    };
    fetchServices();
  }, []);

  const handleServiceSelect = (e) => {
    const id = e.target.value;
    if (!id) return;

    const service = services.find((s) => s.id === id);
    if (service && !selectedServices.find((s) => s.id === id)) {
      setSelectedServices((prev) => [...prev, service]);
    }

    e.target.selectedIndex = 0;
  };

  const removeSelectedService = (id) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== id));
  };

  const getTotalHarga = () => {
    return selectedServices.reduce(
      (total, s) => total + Number(s.harga || 0),
      0
    );
  };

  const getTomorrow = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tglBooking) return alert("Tanggal booking wajib diisi");

    const payload = {
      nama,
      plat_no: platNo,
      no_telepon: noTelepon,
      tipe_kendaraan: tipeKendaraan,
      jenis_service: selectedServices.map((s) => s.id), // pastikan UUID[]
      catatan,
      tgl_booking: tglBooking,
    };

    console.log("Payload:", payload); // debug

    const { error } = await supabase.from("bookings").insert(payload);

    if (error) {
      console.error("Insert error:", error); // debug
      alert("Gagal menyimpan booking: " + error.message);
    } else {
      alert("Booking berhasil!");
      setNama("");
      setPlatNo("");
      setNoTelepon("");
      setTipeKendaraan("");
      setTglBooking("");
      setCatatan("");
      setSelectedServices([]);
    }
  };

  return (
    <section
      id="booking"
      className="pt-16 bg-white min-h-screen flex items-center"
    >
      <div className="max-w-3xl mx-auto px-5 py-24 bg-gray-100 shadow rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Form Booking</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              <InputField
                label="Nama Lengkap"
                value={nama}
                onChange={setNama}
                required
              />
              <InputField
                label="Plat Nomor"
                value={platNo}
                onChange={setPlatNo}
                required
              />
              <InputField
                label="No Telepon"
                value={noTelepon}
                onChange={setNoTelepon}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Kendaraan
                </label>
                <select
                  value={tipeKendaraan}
                  onChange={(e) => setTipeKendaraan(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Tipe Kendaraan</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="MVP">MVP</option>{" "}
                  {/* sebelumnya mungkin salah tulis MPV */}
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Booking
                </label>
                <input
                  type="date"
                  min={getTomorrow()}
                  value={tglBooking}
                  onChange={(e) => setTglBooking(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Jenis Service (opsional)
                </label>
                {loadingServices ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <select
                    onChange={handleServiceSelect}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Service --</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} - Rp {s.harga.toLocaleString()}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedServices.length > 0 && (
                <div className="bg-white p-4 rounded border border-gray-200">
                  <h4 className="font-semibold mb-2">Nota Estimasi</h4>
                  <ul className="space-y-2 text-sm">
                    {selectedServices.map((s) => (
                      <li
                        key={s.id}
                        className="flex justify-between items-center"
                      >
                        <span>
                          {s.nama} - Rp {s.harga.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSelectedService(s.id)}
                          className="text-red-500 text-xs hover:underline"
                        >
                          Hapus
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 font-bold text-right text-blue-600">
                    Total: Rp {getTotalHarga().toLocaleString()}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Booking Sekarang
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

const InputField = ({ label, type = "text", value, onChange, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default Booking;
