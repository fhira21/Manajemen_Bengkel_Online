import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiTag,
  FiPackage,
  FiTool,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiCheck
} from "react-icons/fi";

const SidebarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activeMenu, setActiveMenu] = useState("");

  // Set active menu based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("pelanggan")) setActiveMenu("pelanggan");
    else if (path.includes("promo")) setActiveMenu("promo");
    else if (path.includes("sparepart")) setActiveMenu("sparepart");
    else if (path.includes("service")) setActiveMenu("service");
    else if (path.includes("karyawan")) setActiveMenu("karyawan");
    else setActiveMenu("dashboard");
  }, [location]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      path: "/dashboardadmin",
      name: "Dashboard",
      icon: <FiHome className="text-lg" />,
      key: "dashboard"
    },
    {
      path: "/admin/pelanggan",
      name: "Pelanggan",
      icon: <FiUsers className="text-lg" />,
      key: "pelanggan"
    },
    {
      path: "/admin/promo",
      name: "Promo",
      icon: <FiTag className="text-lg" />,
      key: "promo"
    },
    {
      path: "/admin/sparepart",
      name: "Sparepart",
      icon: <FiPackage className="text-lg" />,
      key: "sparepart"
    },
    {
      path: "/admin/service",
      name: "Service",
      icon: <FiTool className="text-lg" />,
      key: "service"
    },
    {
      path: "/admin/karyawan",
      name: "Karyawan",
      icon: <FiUser className="text-lg" />,
      key: "karyawan"
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`fixed z-50 top-4 left-4 p-2 rounded-md bg-blue-900 text-white shadow-lg transition-all ${
            sidebarOpen ? "transform rotate-90" : ""
          }`}
        >
          {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "left-0" : "-left-64 md:left-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Sidebar Header */}
          <div className="p-4 border-b border-blue-700 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center">
              <span className="bg-white text-blue-900 rounded-lg p-1 mr-2">
                <FiTool />
              </span>
              Admin Panel
            </h2>
            {!isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 rounded-full hover:bg-blue-700"
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                      activeMenu === item.key
                        ? "bg-blue-700 shadow-md"
                        : "hover:bg-blue-700 hover:shadow-md"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                    {activeMenu === item.key && (
                      <FiCheck className="ml-auto animate-fade-in" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-blue-700">
            <button
              onClick={() => {
                localStorage.removeItem("currentUser");
                navigate("/");
              }}
              className="w-full flex items-center justify-center p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 shadow hover:shadow-md"
            >
              <FiLogOut className="mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarAdmin;