import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Skeleton from "../components/ui/skeleton";
import { motion } from "framer-motion";

const Promo = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const { data, error } = await supabase
          .from("promo")
          .select("*")
          .eq("aktif", true)
          .lte("tgl_mulai", today)
          .gte("tgl_selesai", today)
          .order("tgl_selesai", { ascending: true });

        if (error) throw error;
        setPromos(data);
      } catch (err) {
        setError(err.message || "Gagal memuat promo");
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <section id="promo" className="pt-24 pb-20 bg-gray-900 min-h-screen flex items-center relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm mb-2 block">Penawaran Spesial</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Promo & Diskon
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
              Manfaatkan penawaran terbatas kami untuk perawatan kendaraan Anda.
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4 bg-gray-800 p-6 rounded-2xl">
                <Skeleton className="h-32 w-full rounded-xl bg-gray-700" />
                <Skeleton className="h-6 w-3/4 bg-gray-700" />
                <Skeleton className="h-4 w-full bg-gray-700" />
                <Skeleton className="h-4 w-1/2 bg-gray-700" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-red-900/20 rounded-2xl border border-red-500/20 max-w-lg mx-auto">
            <p className="text-red-400 font-medium">Error: {error}</p>
          </div>
        ) : promos.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {promos.map((promo) => (
              <motion.div
                key={promo.id}
                variants={cardVariants}
                whileHover={{ y: -10 }}
                className="bg-gray-800/80 backdrop-blur-lg rounded-3xl border border-gray-700/50 shadow-xl overflow-hidden group flex flex-col"
              >
                <div className="h-40 bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                  <div className="text-center relative z-10 p-4">
                    <span className="block text-blue-200 text-sm font-semibold uppercase tracking-widest mb-1">Diskon</span>
                    <span className="text-5xl font-black text-white drop-shadow-md">
                      {promo.diskon_persen}%
                    </span>
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-white mb-3 leading-snug">
                    {promo.nama}
                  </h3>
                  <p className="text-gray-400 mb-8 flex-1 leading-relaxed">
                    {promo.deskripsi}
                  </p>
                  
                  <div className="flex justify-between items-end border-t border-gray-700 pt-5 mt-auto">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Berlaku Hingga</p>
                      <p className="text-md font-medium text-blue-400">
                        {new Date(promo.tgl_selesai).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                      <svg className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center py-16 bg-gray-800/30 rounded-3xl border border-gray-700 max-w-2xl mx-auto"
          >
            <p className="text-gray-400 text-lg">Belum ada promo yang tersedia saat ini.<br/>Nantikan penawaran menarik dari kami selanjutnya!</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Promo;
