import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";

const LandingPage = () => {
  // State untuk navbar mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [errorPromos, setErrorPromos] = useState(null);

  // State untuk booking section
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingData, setBookingData] = useState({
    services: [],
    vehicleTypes: [],
  });
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicleType: "",
    licensePlate: "", // New field
    selectedServices: [],
    selectedOptions: [],
    checkOnly: false,
    notes: "",
    promoCode: "", // New field
    appliedPromo: null, // New field
  });

  const [loading, setLoading] = useState({
    reviews: true,
    booking: true,
  });
  const [error, setError] = useState({
    reviews: null,
    booking: null,
  });

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/bookingData.json");
        const data = await response.json();
        setBookingData(data);
      } catch (error) {
        console.error("Error loading booking data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch("/data/review.json");
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await response.json();
        setReviews(data.reviews);
      } catch (err) {
        setError((prev) => ({ ...prev, reviews: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, reviews: false }));
      }
    };

    fetchReviews();
  }, []);

  // Load promo data
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await fetch("/data/promo.json");
        if (!response.ok) {
          throw new Error("Failed to fetch promos");
        }
        const data = await response.json();
        setPromos(data.promos);
      } catch (err) {
        setErrorPromos(err.message);
      } finally {
        setLoadingPromos(false);
      }
    };

    fetchPromos();
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const handleNavigation = (direction) => {
    if (direction === "prev") {
      setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
    } else {
      setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
    }
  };

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const isDateBooked = (day) => {
    return bookingData.bookedDates?.some(
      (date) => isSameDay(parseISO(date), day) || false
    );
  };

  // Fungsi untuk smooth scrolling
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false); // Tutup mobile menu setelah klik
    }
  };

  // Handle service selection
  const handleServiceChange = (e) => {
    const serviceId = parseInt(e.target.value);
    const service = bookingData.services.find((s) => s.id === serviceId);

    if (service) {
      setFormData((prev) => ({
        ...prev,
        selectedServices: [...prev.selectedServices, service],
      }));
    }
  };

  // Toggle service option
  const toggleOption = (optionId, serviceId) => {
    setFormData((prev) => {
      const newSelected = prev.selectedOptions.includes(optionId)
        ? prev.selectedOptions.filter((id) => id !== optionId)
        : [...prev.selectedOptions, optionId];

      return { ...prev, selectedOptions: newSelected };
    });
  };

  // Remove service from selection
  const removeService = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.filter(
        (service) => service.id !== serviceId
      ),
      selectedOptions: prev.selectedOptions.filter((optionId) => {
        // Remove options that belong to the removed service
        const service = prev.selectedServices.find((s) => s.id === serviceId);
        if (!service) return true;
        return !service.options.some((opt) => opt.id === optionId);
      }),
    }));
  };

  const applyPromoCode = () => {
    if (!formData.promoCode) {
      alert("Harap masukkan kode promo");
      return;
    }

    const promo = bookingData.promoCodes.find(
      (p) => p.code === formData.promoCode.toUpperCase()
    );

    if (!promo) {
      alert("Kode promo tidak valid atau tidak ditemukan");
      return;
    }

    // Check expiration
    const today = new Date();
    const validUntil = new Date(promo.validUntil);
    if (today > validUntil) {
      alert("Maaf, kode promo ini sudah kadaluarsa");
      return;
    }

    // Check applicable services
    if (promo.applicableServices && promo.applicableServices.length > 0) {
      const hasApplicableService = formData.selectedServices.some((service) =>
        promo.applicableServices.includes(service.id)
      );

      if (!hasApplicableService) {
        alert("Kode promo ini tidak berlaku untuk layanan yang dipilih");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      appliedPromo: promo,
      promoCode: "", // Clear input after successful application
    }));
  };

  const removePromoCode = () => {
    setFormData((prev) => ({
      ...prev,
      promoCode: "",
      appliedPromo: null,
    }));
  };

  // Remove option from invoice
  const removeOption = (optionId) => {
    setFormData((prev) => ({
      ...prev,
      selectedOptions: prev.selectedOptions.filter((id) => id !== optionId),
    }));
  };

  const calculateTotal = () => {
    if (formData.checkOnly) return 0;

    const subtotal = formData.selectedOptions.reduce((total, optionId) => {
      for (const service of formData.selectedServices) {
        const option = service.options.find((opt) => opt.id === optionId);
        if (option) return total + option.price;
      }
      return total;
    }, 0);

    if (!formData.appliedPromo) return subtotal;

    const promo = formData.appliedPromo;
    let discount = 0;

    if (promo.discountType === "percentage") {
      discount = subtotal * (promo.value / 100);
    } else {
      discount = promo.value;
    }

    // Ensure discount doesn't make total negative
    return Math.max(subtotal - discount, 0);
  };

  const calculateSubtotal = () => {
    if (formData.checkOnly) return 0;

    return formData.selectedOptions.reduce((total, optionId) => {
      for (const service of formData.selectedServices) {
        const option = service.options.find((opt) => opt.id === optionId);
        if (option) return total + option.price;
      }
      return total;
    }, 0);
  };

  const calculateDiscount = () => {
    if (!formData.appliedPromo || formData.checkOnly) return 0;

    const subtotal = calculateSubtotal();
    const promo = formData.appliedPromo;

    if (promo.discountType === "percentage") {
      return subtotal * (promo.value / 100);
    } else {
      return Math.min(promo.value, subtotal);
    }
  };

  // Get selected options with details
  const getSelectedOptions = () => {
    return formData.selectedOptions
      .map((optionId) => {
        // Find the option and its parent service
        for (const service of formData.selectedServices) {
          const option = service.options.find((opt) => opt.id === optionId);
          if (option) {
            return {
              ...option,
              serviceName: service.name,
            };
          }
        }
        return null;
      })
      .filter(Boolean); // Remove any null entries
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const bookingDetails = {
      ...formData,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      totalPrice: calculateTotal(),
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      selectedServices: formData.selectedServices.map((s) => s.name),
      checkOnly: formData.checkOnly,
      promoCode: formData.appliedPromo?.code || null,
    };

    console.log("Booking details:", bookingDetails);
    alert(
      formData.checkOnly
        ? "Booking untuk pemeriksaan saja berhasil!"
        : `Booking service berhasil! Total biaya: Rp${calculateTotal().toLocaleString()}`
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / reviews.length;
    return Math.round(average * 10) / 10; // Round to 1 decimal place
  };

  return (
    <div className="font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            {/* Logo as single clickable element */}
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => scrollToSection("home")}
            >
              <img
                src="/volkswagen.webp"
                alt="Volkswagen Logo"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
                VW Service Center
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6">
              <button
                onClick={() => scrollToSection("home")}
                className="nav-link"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("booking")}
                className="nav-link"
              >
                Booking
              </button>
              <button
                onClick={() => scrollToSection("promo")}
                className="nav-link"
              >
                Promo
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="nav-link"
              >
                Tentang Kami
              </button>
              <button
                onClick={() => scrollToSection("reviews")}
                className="nav-link"
              >
                Review
              </button>
              <button
                onClick={() => (window.location.href = "/login")}
                className="nav-link"
              >
                Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => scrollToSection("home")}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("booking")}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Booking
              </button>
              <button
                onClick={() => scrollToSection("promo")}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Promo
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Tentang Kami
              </button>
              <button
                onClick={() => scrollToSection("reviews")}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Review
              </button>
              <button
                onClick={() => (window.location.href = "/login")}
                className="nav-link"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="pt-16 bg-gray-900 text-white min-h-screen flex items-center"
      >
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Layanan Service Premium{" "}
            <span className="text-blue-400">VolksWagen</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Bengkel resmi dengan teknisi bersertifikat Volkswagen. Dapatkan
            pengalaman service terbaik untuk kendaraan Anda.
          </p>
          <button
            onClick={() => scrollToSection("booking")}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
          >
            Booking Sekarang
          </button>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Booking Service
          </h1>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Form Input */}
                <div>
                  {/* Calendar Section */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                      Pilih Tanggal
                    </h2>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      {/* Calendar content remains the same */}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Polisi
                      </label>
                      <input
                        type="text"
                        value={formData.licensePlate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            licensePlate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                        placeholder="Contoh: B 1234 ABC"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipe Kendaraan
                      </label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicleType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Pilih Tipe</option>
                        {bookingData.vehicleTypes?.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Service Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Service
                    </label>
                    <select
                      onChange={handleServiceChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Pilih Service</option>
                      {bookingData.services?.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} ({service.duration})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Show selected services */}
                  {formData.selectedServices.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service yang dipilih:
                      </label>
                      <div className="space-y-2">
                        {formData.selectedServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <span>
                              {service.name} ({service.category})
                            </span>
                            <button
                              type="button"
                              onClick={() => removeService(service.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Check Only Option */}
                  {formData.selectedServices.length > 0 && (
                    <div className="mb-4 flex items-center">
                      <input
                        type="checkbox"
                        id="checkOnly"
                        checked={formData.checkOnly}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            checkOnly: !prev.checkOnly,
                          }))
                        }
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="checkOnly"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Hanya pemeriksaan (tidak ada penggantian sparepart)
                      </label>
                    </div>
                  )}

                  {/* Service Options for all selected services */}
                  {formData.selectedServices.length > 0 &&
                    !formData.checkOnly && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pilihan Sparepart/Service:
                        </label>
                        <div className="space-y-4">
                          {formData.selectedServices.map((service) => (
                            <div key={service.id} className="border-b pb-4">
                              <h3 className="font-medium text-gray-900 mb-2">
                                {service.name}
                              </h3>
                              <div className="space-y-2">
                                {service.options.map((option) => (
                                  <div
                                    key={option.id}
                                    className="flex items-center"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`option-${option.id}`}
                                      checked={formData.selectedOptions.includes(
                                        option.id
                                      )}
                                      onChange={() => toggleOption(option.id)}
                                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    />
                                    <label
                                      htmlFor={`option-${option.id}`}
                                      className="ml-2 text-sm text-gray-700"
                                    >
                                      {option.name} - Rp
                                      {option.price.toLocaleString()}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Additional Notes */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan Tambahan
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    ></textarea>
                  </div>
                </div>

                {/* Right Column - Invoice */}
                <div className="space-y-6 sticky top-4">
                  <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                      Nota Service
                    </h2>

                    {formData.selectedServices.length > 0 ? (
                      <>
                        {/* Services Info */}
                        <div className="mb-4">
                          <h3 className="font-medium text-gray-900 mb-2">
                            Service yang dipilih:
                          </h3>
                          <ul className="space-y-1">
                            {formData.selectedServices.map((service) => (
                              <li key={service.id} className="text-sm">
                                {service.name} ({service.duration})
                              </li>
                            ))}
                          </ul>
                          {formData.checkOnly && (
                            <p className="text-sm text-green-600 mt-2">
                              Hanya pemeriksaan
                            </p>
                          )}
                        </div>

                        {/* Selected Options */}
                        {!formData.checkOnly &&
                          getSelectedOptions().length > 0 && (
                            <div className="mb-4">
                              <h3 className="font-medium text-gray-900 mb-2">
                                Yang akan diganti:
                              </h3>
                              <ul className="space-y-2">
                                {getSelectedOptions().map((option) => (
                                  <li
                                    key={option.id}
                                    className="flex justify-between group"
                                  >
                                    <span className="text-sm">
                                      {option.name} ({option.serviceName})
                                      <button
                                        type="button"
                                        onClick={() => removeOption(option.id)}
                                        className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                      </button>
                                    </span>
                                    <span className="text-sm">
                                      Rp{option.price.toLocaleString()}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {/* Discount Breakdown */}
                        {formData.appliedPromo && (
                          <div className="mb-4">
                            <div className="flex justify-between items-center border-b pb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Subtotal
                              </span>
                              <span className="text-sm">
                                Rp{calculateSubtotal().toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <div>
                                <span className="text-sm font-medium text-gray-700">
                                  Diskon
                                </span>
                                <span className="text-xs text-gray-500 block">
                                  ({formData.appliedPromo.code})
                                </span>
                              </div>
                              <span className="text-sm text-red-500">
                                -Rp{calculateDiscount().toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Total */}
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">
                              Total
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              {formData.checkOnly
                                ? "Gratis"
                                : `Rp${calculateTotal().toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          Belum ada service dipilih
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Pilih service untuk melihat detail nota
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Promo Code Section - Now positioned below the invoice */}
                  {formData.selectedServices.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Gunakan Kode Promo
                      </h3>
                      <div className="flex">
                        <input
                          type="text"
                          value={formData.promoCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              promoCode: e.target.value,
                            })
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          placeholder="Masukkan kode promo"
                        />
                        <button
                          type="button"
                          onClick={applyPromoCode}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md text-sm"
                        >
                          Terapkan
                        </button>
                      </div>
                      {formData.appliedPromo && (
                        <div className="mt-3 p-2 bg-green-50 rounded-md flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Promo {formData.appliedPromo.code} berhasil
                              diterapkan
                            </p>
                            <p className="text-xs text-green-600">
                              Diskon{" "}
                              {formData.appliedPromo.discountType ===
                              "percentage"
                                ? `${formData.appliedPromo.value}%`
                                : `Rp${formData.appliedPromo.value.toLocaleString()}`}
                            </p>
                          </div>
                          <button
                            onClick={removePromoCode}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date Info and Submit Button */}
                  {formData.selectedServices.length > 0 && (
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg flex items-center">
                        <svg
                          className="h-5 w-5 text-blue-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm">
                          {selectedDate
                            ? format(selectedDate, "dd MMMM yyyy")
                            : "Belum memilih tanggal"}
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={!selectedDate}
                        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                          !selectedDate
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                      >
                        {formData.checkOnly
                          ? "Booking Pemeriksaan"
                          : "Konfirmasi Booking"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Promo Section */}
      <section id="promo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Promo Sparepart & Service
          </h2>

          {loadingPromos ? (
            <div className="text-center py-8">
              <p>Memuat promo...</p>
            </div>
          ) : errorPromos ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error: {errorPromos}</p>
            </div>
          ) : promos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promos.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {promo.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{promo.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Berlaku hingga:</p>
                        <p className="text-sm font-medium text-gray-700">
                          {promo.validUntil}
                        </p>
                      </div>
                      <div className="bg-blue-100 px-3 py-1 rounded-md">
                        <p className="text-blue-800 font-bold">{promo.code}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p>Tidak ada promo yang tersedia saat ini</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tentang Kami
          </h2>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Volkswagen Image */}
            <div className="lg:w-1/2">
              <img
                src="/volkswagen.webp"
                alt="Volkswagen Service Center"
                className="rounded-lg shadow-xl w-full max-w-2xl mx-auto"
              />
            </div>

            {/* Company Description */}
            <div className="lg:w-1/2 space-y-8">
              {/* Vision */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Visi
                    </h3>
                    <p className="text-gray-600">
                      Menjadi bengkel resmi Volkswagen terdepan di Indonesia
                      yang memberikan pengalaman servis premium dengan standar
                      global.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mission */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Misi
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>
                        Menyediakan layanan berkualitas dengan standar pabrikan
                        Volkswagen
                      </li>
                      <li>
                        Menggunakan teknisi bersertifikat dan sparepart original
                      </li>
                      <li>
                        Memberikan pengalaman servis yang transparan dan
                        terpercaya
                      </li>
                      <li>
                        Mengutamakan kepuasan pelanggan dengan layanan purna
                        jual terbaik
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow flex items-start">
                  <div className="flex-shrink-0 mt-1 text-blue-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700 font-medium">
                    Teknisi bersertifikat Volkswagen
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow flex items-start">
                  <div className="flex-shrink-0 mt-1 text-blue-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700 font-medium">
                    Sparepart original 100%
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow flex items-start">
                  <div className="flex-shrink-0 mt-1 text-blue-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700 font-medium">
                    Garansi resmi pabrikan
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow flex items-start">
                  <div className="flex-shrink-0 mt-1 text-blue-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700 font-medium">
                    Fasilitas tunggu premium
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Apa Kata Pelanggan Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Testimoni dari pelanggan yang telah menggunakan layanan bengkel
              kami.
            </p>

            {/* Average Rating Display */}
            {!loading.reviews && reviews.length > 0 && (
              <div className="mt-6 flex justify-center items-center">
                <div className="bg-blue-50 px-6 py-3 rounded-full inline-flex items-center">
                  <span className="text-2xl font-bold text-blue-700 mr-2">
                    {calculateAverageRating()}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.round(calculateAverageRating())
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 ml-2">
                    ({reviews.length} ulasan)
                  </span>
                </div>
              </div>
            )}
          </div>

          {loading.reviews ? (
            <div className="text-center py-8">
              <p>Memuat ulasan...</p>
            </div>
          ) : error.reviews ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error: {error.reviews}</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="relative">
              {/* Navigation Arrows */}
              <button
                onClick={() => handleNavigation("prev")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 ml-2"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={() => handleNavigation("next")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 mr-2"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Slider Container */}
              <div className="overflow-hidden">
                <motion.div
                  className="flex"
                  animate={{ x: -currentIndex * 100 + "%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) {
                      handleNavigation("next");
                    } else if (swipe > swipeConfidenceThreshold) {
                      handleNavigation("prev");
                    }
                  }}
                >
                  {reviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      className="w-full flex-shrink-0 px-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center mb-4">
                          <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                            {review.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <h4 className="font-bold text-gray-900">
                              {review.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {review.car}
                            </p>
                          </div>
                        </div>
                        <div className="flex mb-3">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-600 mb-4">"{review.comment}"</p>
                        <p className="text-sm text-gray-400">{review.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center mt-6 space-x-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      currentIndex === index ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>Tidak ada review yang tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="#" className="text-gray-300 hover:text-white">
                    Regular Maintenance
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-300 hover:text-white">
                    Repairs
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-300 hover:text-white">
                    Genuine Parts
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <address className="not-italic text-gray-300">
                <p>Volkswagen Street No.123</p>
                <p>contact@vw-service.id</p>
                <p>+62 21 1234 5678</p>
              </address>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Opening Hours</h3>
              <ul className="text-gray-300">
                <li>Monday-Friday: 8AM - 5PM</li>
                <li>Saturday: 8AM - 3PM</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Volkswagen Service Center. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
