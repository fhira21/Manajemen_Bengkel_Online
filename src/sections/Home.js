import { motion } from "framer-motion";

const Home = ({ scrollToSection }) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <section
      id="home"
      className="pt-16 bg-gray-900 text-white min-h-screen flex items-center"
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 py-24 text-center"
      >
        <motion.h1 
          variants={item}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          Layanan Service Premium{" "}
          <span className="text-blue-400">VolksWagen</span>
        </motion.h1>
        
        <motion.p 
          variants={item}
          className="text-xl mb-8 max-w-2xl mx-auto"
        >
          Bengkel resmi dengan teknisi bersertifikat Volkswagen. Dapatkan
          pengalaman service terbaik untuk kendaraan Anda.
        </motion.p>
        
        <motion.button
          variants={item}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => scrollToSection("booking")}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
        >
          Booking Sekarang
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Home;