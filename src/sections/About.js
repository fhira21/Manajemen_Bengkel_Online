import { motion } from "framer-motion";

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <section id="about" className="pt-20 pb-20 bg-gray-50 min-h-screen flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-4 tracking-tight">
            Tentang Kami
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16 text-lg">
            Dedikasi kami adalah memberikan layanan premium untuk menjaga performa optimal kendaraan Volkswagen Anda.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-blue-600 rounded-2xl transform translate-x-4 translate-y-4 opacity-20 blur-sm"></div>
            <img
              src="/volkswagen.webp"
              alt="Volkswagen Service Center"
              className="relative rounded-2xl shadow-2xl w-full max-w-2xl mx-auto object-cover h-[500px]"
            />
          </motion.div>

          <motion.div 
            className="lg:w-1/2 space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-md border border-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <svg className="h-7 w-7 text-blue-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Visi</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Menjadi bengkel resmi Volkswagen terdepan di Indonesia yang
                    memberikan pengalaman servis premium dengan standar global.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-md border border-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 p-3 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <svg className="h-7 w-7 text-green-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Misi</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 text-lg">
                    <li>Standar pabrikan Volkswagen</li>
                    <li>Teknisi bersertifikat dan sparepart original</li>
                    <li>Transparan dan terpercaya</li>
                    <li>Layanan purna jual terbaik</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"
            >
              {[
                "Teknisi bersertifikat",
                "Sparepart original 100%",
                "Garansi resmi pabrikan",
                "Fasilitas tunggu premium"
              ].map((text, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-all duration-300"
                >
                  <div className="flex-shrink-0 text-blue-600 bg-blue-50 p-2 rounded-full">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-800 font-semibold">{text}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;