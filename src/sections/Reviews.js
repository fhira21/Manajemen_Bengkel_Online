import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { Star } from "lucide-react";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setReviews(data);
      setLoading(false);
    };

    fetchReviews();
  }, []);

  return (
    <section
      id="reviews"
      className="pt-16 pb-20 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen flex items-center"
    >
      <div className="px-4 py-8 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
            Ulasan Pelanggan
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Lihat apa yang pelanggan kami katakan tentang layanan kami
          </p>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5, 
                ease: "easeInOut"
              }}
              className="rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"
            ></motion.div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                  }}
                  className="p-6 rounded-xl bg-gray-800 border border-gray-700 shadow-lg hover:shadow-yellow-500/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{review.name}</h3>
                      <p className="text-sm text-gray-400">{review.car}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Star
                          size={18}
                          className={idx < review.rating 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-600"
                          }
                        />
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.p 
                    whileHover={{ scale: 1.01 }}
                    className="text-gray-300 text-sm leading-relaxed"
                  >
                    "{review.comment}"
                  </motion.p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && reviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="flex flex-col items-center justify-center">
              <svg className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-300">Belum ada ulasan</h3>
              <p className="text-gray-500 mt-2">Jadilah yang pertama memberikan ulasan</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Reviews;