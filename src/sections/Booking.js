import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Skeleton from "../components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const Booking = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Customer
  const [nama, setNama] = useState("");
  const [noTelepon, setNoTelepon] = useState("");

  // Step 2: Vehicle
  const [platNo, setPlatNo] = useState("");
  const [merk, setMerk] = useState("Volkswagen");
  const [model, setModel] = useState("");
  const [tipeKendaraan, setTipeKendaraan] = useState("");

  // Step 3: Services & Booking
  const [tglBooking, setTglBooking] = useState("");
  const [catatan, setCatatan] = useState("");
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("nama");

      if (!error && data) {
        setServices(data);
      }
      setLoadingServices(false);
    };
    fetchServices();
  }, []);

  const getTomorrow = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().split("T")[0];
  };

  const toggleService = (service) => {
    if (selectedServices.find((s) => s.id === service.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const getTotalHarga = () => {
    return selectedServices.reduce((total, s) => total + Number(s.harga || 0), 0);
  };

  const getTotalEstimasi = () => {
    return selectedServices.reduce((total, s) => total + Number(s.estimasi_menit || 0), 0);
  };

  const handleNext = () => {
    if (step === 1 && (!nama || !noTelepon)) return alert("Mohon lengkapi data pelanggan");
    if (step === 2 && (!platNo || !merk || !model || !tipeKendaraan)) return alert("Mohon lengkapi data kendaraan");
    if (step === 3 && !tglBooking) return alert("Pilih tanggal booking terlebih dahulu");
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Resolve Customer
      let customerId;
      const { data: existingCustomer, error: cError } = await supabase
        .from("customers")
        .select("id")
        .eq("no_telepon", noTelepon)
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: ncError } = await supabase
          .from("customers")
          .insert([{ nama, no_telepon: noTelepon }])
          .select("id")
          .single();
        if (ncError) throw ncError;
        customerId = newCustomer.id;
      }

      // 2. Resolve Vehicle
      let vehicleId;
      const normalizedPlate = platNo.replace(/\s+/g, "").toUpperCase();
      const { data: existingVehicle, error: vError } = await supabase
        .from("vehicles")
        .select("id")
        .eq("plat_nomor", normalizedPlate)
        .maybeSingle();

      if (existingVehicle) {
        vehicleId = existingVehicle.id;
      } else {
        const { data: newVehicle, error: nvError } = await supabase
          .from("vehicles")
          .insert([{
            customer_id: customerId,
            plat_nomor: normalizedPlate,
            merk,
            model,
            tipe_kendaraan: tipeKendaraan
          }])
          .select("id")
          .single();
        if (nvError) throw nvError;
        vehicleId = newVehicle.id;
      }

      // 3. Create Booking
      const { data: newBooking, error: bError } = await supabase
        .from("bookings")
        .insert([{
          customer_id: customerId,
          vehicle_id: vehicleId,
          tgl_booking: tglBooking,
          catatan: catatan,
          status: "pending"
        }])
        .select("id")
        .single();
      
      if (bError) throw bError;

      // 4. Create Booking Services
      if (selectedServices.length > 0) {
        const servicePayload = selectedServices.map(s => ({
          booking_id: newBooking.id,
          service_id: s.id
        }));
        const { error: bsError } = await supabase.from("booking_services").insert(servicePayload);
        if (bsError) throw bsError;
      }

      alert("Booking berhasil dibuat!");
      setStep(1);
      setNama(""); setNoTelepon("");
      setPlatNo(""); setMerk("Volkswagen"); setModel(""); setTipeKendaraan("");
      setTglBooking(""); setCatatan(""); setSelectedServices([]);

    } catch (err) {
      console.error("Booking Error:", err);
      alert("Terjadi kesalahan saat membuat booking: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <section id="booking" className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Reservasi Service</h2>
          <p className="text-gray-500 mt-2">Jadwalkan perawatan kendaraan Anda dalam beberapa langkah mudah</p>
        </div>

        {/* Stepper Progress */}
        <div className="mb-10 flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 z-0 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors duration-300 ${step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 border-2 border-white'}`}>
              {i}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="hidden" animate="visible" exit="exit" className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">1. Informasi Pelanggan</h3>
                <div className="space-y-5">
                  <InputField label="Nama Lengkap" value={nama} onChange={setNama} placeholder="Masukkan nama lengkap" />
                  <InputField label="Nomor Telepon / WhatsApp" value={noTelepon} onChange={setNoTelepon} type="tel" placeholder="08123456789" />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="hidden" animate="visible" exit="exit" className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">2. Informasi Kendaraan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="Plat Nomor" value={platNo} onChange={setPlatNo} placeholder="B 1234 ABC" />
                  <InputField label="Merk Kendaraan" value={merk} onChange={setMerk} disabled />
                  <InputField label="Model Kendaraan" value={model} onChange={setModel} placeholder="Contoh: Golf, Tiguan, Polo" />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tipe Kendaraan</label>
                    <select value={tipeKendaraan} onChange={(e) => setTipeKendaraan(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                      <option value="">Pilih Tipe Kendaraan</option>
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="MPV">MPV</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={variants} initial="hidden" animate="visible" exit="exit" className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">3. Jadwal & Layanan</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Booking</label>
                      <input type="date" min={getTomorrow()} value={tglBooking} onChange={(e) => setTglBooking(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan Keluhan (Opsional)</label>
                      <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows="1" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" placeholder="Jelaskan keluhan kendaraan" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Pilih Layanan Service</label>
                    {loadingServices ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto p-1">
                        {services.map((s) => {
                          const isSelected = selectedServices.some(sel => sel.id === s.id);
                          return (
                            <div 
                              key={s.id} 
                              onClick={() => toggleService(s)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className={`font-bold ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{s.nama}</h4>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                                  {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-2">{s.deskripsi}</p>
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-gray-900">Rp {Number(s.harga).toLocaleString()}</span>
                                <span className="text-gray-500 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  {s.estimasi_menit || 0} mnt
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" variants={variants} initial="hidden" animate="visible" exit="exit" className="p-8 bg-blue-50/50">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">4. Konfirmasi Booking</h3>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                    <h4 className="font-bold text-lg">Estimasi Service</h4>
                    <span className="font-medium text-blue-100">{tglBooking}</span>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Pelanggan</p>
                        <p className="font-bold text-gray-900">{nama}</p>
                        <p className="text-gray-600">{noTelepon}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Kendaraan</p>
                        <p className="font-bold text-gray-900">{platNo.toUpperCase()}</p>
                        <p className="text-gray-600">{merk} {model} ({tipeKendaraan})</p>
                      </div>
                    </div>

                    {catatan && (
                      <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-sm text-orange-800">
                        <strong>Keluhan:</strong> {catatan}
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-500 mb-3 text-sm font-semibold">Layanan Dipilih</p>
                      {selectedServices.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Belum ada layanan yang dipilih</p>
                      ) : (
                        <ul className="space-y-3">
                          {selectedServices.map(s => (
                            <li key={s.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">{s.nama}</span>
                              <span className="font-semibold text-gray-900">Rp {Number(s.harga).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex flex-col items-end gap-1">
                      <div className="flex justify-between w-full text-gray-600 text-sm">
                        <span>Estimasi Waktu:</span>
                        <span>{getTotalEstimasi()} Menit</span>
                      </div>
                      <div className="flex justify-between w-full font-bold text-lg text-blue-700 mt-2">
                        <span>Total Estimasi:</span>
                        <span>Rp {getTotalHarga().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            {step > 1 ? (
              <button type="button" onClick={handleBack} disabled={loading} className="px-6 py-2.5 text-gray-600 hover:text-blue-600 font-semibold transition-colors disabled:opacity-50">
                Kembali
              </button>
            ) : <div></div>}
            
            {step < 4 ? (
              <button type="button" onClick={handleNext} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all">
                Lanjut
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? "Memproses..." : "Konfirmasi Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const InputField = ({ label, type = "text", value, onChange, placeholder, disabled = false }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:bg-gray-200 disabled:text-gray-500"
    />
  </div>
);

export default Booking;
