import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Home from "../sections/Home";
import Booking from "../sections/Booking";
import Promo from "../sections/Promo";
import About from "../sections/About";
import Reviews from "../sections/Reviews";
import Footer from "../components/Footer";

const LandingPage = () => {
  const [reviews, setReviews] = useState([]);
  const [promos, setPromos] = useState([]);
  const [bookingData, setBookingData] = useState({
    services: [],
    vehicleTypes: [],
    promoCodes: [],
    bookedDates: [],
  });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState({
    reviews: true,
    booking: true,
  });
  const [error, setError] = useState({
    reviews: null,
    booking: null,
  });
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [errorPromos, setErrorPromos] = useState(null);

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
      className="font-sans"
    >
      <Navbar scrollToSection={scrollToSection} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Home scrollToSection={scrollToSection} />
        <Booking bookingData={bookingData} services={services} />
        <Promo promos={promos} loadingPromos={loadingPromos} errorPromos={errorPromos} />
        <About />
        <Reviews reviews={reviews} loading={loading} error={error} />
        <Footer />
      </motion.div>
    </motion.div>
  );
};

export default LandingPage;