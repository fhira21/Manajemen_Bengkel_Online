import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiTag, FiPackage, FiTool, FiUser, FiLogOut, FiMenu, FiX, FiCheck, FiShield } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const SidebarAdmin = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("pelanggan")) setActiveMenu("pelanggan");
    else if (path.includes("promo")) setActiveMenu("promo");
    else if (path.includes("sparepart")) setActiveMenu("sparepart");
    else if (path.includes("service")) setActiveMenu("service");
    else if (path.includes("karyawan")) setActiveMenu("karyawan");
    else setActiveMenu("dashboard");
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { path: "/admin/dashboardadmin", name: "Dashboard", icon: <FiHome className="text-xl" />, key: "dashboard" },
    { path: "/admin/pelanggan", name: "Pelanggan", icon: <FiUsers className="text-xl" />, key: "pelanggan" },
    { path: "/admin/promo", name: "Promo", icon: <FiTag className="text-xl" />, key: "promo" },
    { path: "/admin/sparepart", name: "Sparepart", icon: <FiPackage className="text-xl" />, key: "sparepart" },
    { path: "/admin/service", name: "Service", icon: <FiTool className="text-xl" />, key: "service" },
    { path: "/admin/karyawan", name: "Karyawan", icon: <FiUser className="text-xl" />, key: "karyawan" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`fixed z-50 top-4 left-4 p-2 rounded-xl bg-blue-600 text-white shadow-lg transition-transform duration-300 ${sidebarOpen ? "transform rotate-90" : ""}`}
        >
          {sidebarOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
        </button>
      )}

      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed md:fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm transition-transform duration-300
    ${sidebarOpen ?
            "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <div className="p-6 pb-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-600/20">
                <FiShield className="w-6 h-6" />
              </div>
              <span>Admin<span className="text-blue-600">Panel</span></span>
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
            <ul className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = activeMenu === item.key;
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden ${isActive
                        ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                        }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-r-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className={`mr-4 transition-colors ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                      {isActive && <FiCheck className="ml-auto text-blue-600 opacity-70" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Profile & Logout Section */}
          <div className="p-4 mt-auto">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">
                  <FiUser className="text-blue-600 text-xl" />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-bold text-gray-900 truncate text-sm">
                    {currentUser?.nama_lengkap || currentUser?.name || "Adminstrator"}
                  </p>
                  <p className="text-xs text-blue-600 font-semibold tracking-wider uppercase mt-0.5">
                    {currentUser?.role || "ADMIN"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 font-bold shadow-sm"
              >
                <FiLogOut className="text-lg" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Global styles for custom scrollbar within sidebar if needed */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #d1d5db;
        }
      `}} />
    </>
  );
};

export default SidebarAdmin;
