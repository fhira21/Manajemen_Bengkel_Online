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
        const { data, error } = await supabase
          .from("promo")
          .select("*")
          .order("berlaku_sampai", { ascending: false });

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

  return (
    <section id="promo" className="pt-16 bg-gray-900 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-white mb-12">
          Promo Sparepart & Service
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : promos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promos.map((promo, index) => (
              <motion.div
                key={promo.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={promo.image}
                    alt={promo.nama}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {promo.nama}
                  </h3>
                  <p className="text-gray-600 mb-4">{promo.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Berlaku hingga:</p>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(promo.berlaku_sampai).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="bg-blue-100 px-3 py-1 rounded-md">
                      <p className="text-blue-800 font-bold">{promo.kode_promo}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Tidak ada promo yang tersedia saat ini</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Promo;
