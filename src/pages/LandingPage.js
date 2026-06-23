import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Home from "../sections/Home";
import Booking from "../sections/Booking";
import Promo from "../sections/Promo";
import About from "../sections/About";
import Reviews from "../sections/Reviews";
import Footer from "../components/Footer";

const LandingPage = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: "smooth"
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="font-sans bg-gray-50"
    >
      <Navbar scrollToSection={scrollToSection} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Home scrollToSection={scrollToSection} />
        <Booking />
        <Promo />
        <About />
        <Reviews />
        <Footer />
      </motion.div>
    </motion.div>
  );
};

export default LandingPage;