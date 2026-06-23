import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiLogOut, FiMenu, FiX, FiCheck, FiUser, FiArrowDownCircle, FiArrowUpCircle, FiPackage } from "react-icons/fi";

const SidebarGudang = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("masuk")) setActiveMenu("masuk");
    else if (path.includes("keluar")) setActiveMenu("keluar");
    else setActiveMenu("dashboard");
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { path: "/dashboardgudang", name: "Dashboard", icon: <FiHome className="text-lg" />, key: "dashboard" },
    { path: "/gudang/masuk", name: "Stok Masuk", icon: <FiArrowDownCircle className="text-lg" />, key: "masuk" },
    { path: "/gudang/keluar", name: "Stok Keluar", icon: <FiArrowUpCircle className="text-lg" />, key: "keluar" }
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
          className={`fixed z-50 top-4 left-4 p-2 rounded-md bg-blue-900 text-white shadow-lg transition-all ${sidebarOpen ? "transform rotate-90" : ""}`}
        >
          {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      )}

      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed z-40 w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? "left-0" : "-left-64 md:left-0"}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-blue-700 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center">
              <span className="bg-blue-100 text-blue-900 rounded-lg p-1 mr-2"><FiPackage /></span>
              Gudang Panel
            </h2>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeMenu === item.key ? "bg-blue-700 shadow-md" : "hover:bg-blue-700 hover:shadow-md"}`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                    {activeMenu === item.key && <FiCheck className="ml-auto" />}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Profile Footer */}
          <div className="p-4 border-t border-blue-700 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                <FiUser className="text-white" />
              </div>
              <div className="flex flex-col text-sm">
                <p className="font-medium">{currentUser?.name || "Staff Gudang"}</p>
                <p className="text-xs text-white text-opacity-70">{currentUser?.email || "gudang@example.com"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 shadow hover:shadow-md mt-2"
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

export default SidebarGudang;
