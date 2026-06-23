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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  // Background floating shapes
  const floatingShape = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section
      id="home"
      className="relative pt-16 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-[90vh] flex items-center overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <motion.div
        variants={floatingShape}
        animate="animate"
        className="absolute top-20 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        variants={floatingShape}
        animate="animate"
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 py-24 text-center w-full"
      >
        <motion.div variants={item} className="mb-4">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-900/50 text-blue-300 text-sm font-semibold tracking-wider uppercase border border-blue-700/50">
            Bengkel Resmi
          </span>
        </motion.div>

        <motion.h1 
          variants={item}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight text-white drop-shadow-md"
        >
          Layanan Service Premium <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">VolksWagen</span>
        </motion.h1>
        
        <motion.p 
          variants={item}
          className="text-lg md:text-xl lg:text-2xl mb-10 max-w-2xl mx-auto text-gray-300 leading-relaxed font-light"
        >
          Ditangani langsung oleh teknisi bersertifikat Volkswagen dengan menggunakan suku cadang asli.
        </motion.p>
        
        <motion.button
          variants={item}
          whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(37, 99, 235, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => scrollToSection("booking")}
          className="w-full sm:w-auto inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-blue-600/30 ring-1 ring-blue-500/50"
        >
          Booking Sekarang
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Home;