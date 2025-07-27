import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <motion.li whileHover={{ x: 5 }}>
                <Link to="#" className="text-gray-700 hover:text-white">Regular Maintenance</Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <Link to="#" className="text-gray-700 hover:text-white">Repairs</Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <Link to="#" className="text-gray-700 hover:text-white">Genuine Parts</Link>
              </motion.li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="not-italic text-gray-700 space-y-2">
              <p>Volkswagen Street No.123</p>
              <p>contact@vw-service.id</p>
              <p>+62 21 1234 5678</p>
            </address>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Opening Hours</h3>
            <ul className="text-gray-700 space-y-2">
              <li>Monday-Friday: 8AM - 5PM</li>
              <li>Saturday: 8AM - 3PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-700"
        >
          <p>&copy; {new Date().getFullYear()} Volkswagen Service Center. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;