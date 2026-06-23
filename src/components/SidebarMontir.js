import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiLogOut, FiMenu, FiX, FiUser, FiCheck, FiClock, FiHome } from "react-icons/fi";

const SidebarMontir = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [currentUser, setCurrentUser] = useState({ name: "", email: "" });

  const navItems = [
    { name: "Dashboard", icon: <FiHome size={20} />, path: "/dashboardmontir" },
    { name: "Riwayat Service", icon: <FiClock size={20} />, path: "/riwayatmontir" },
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser")) || {};
    setCurrentUser({
      name: user.nama || user.name || "Montir",
      email: user.email || "example@email.com",
    });

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      {/* Mobile toggle */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`fixed z-50 top-4 left-4 p-2 rounded-md bg-blue-900 text-white shadow-lg transition-all ${
            sidebarOpen ? "rotate-90" : ""
          }`}
        >
          {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      )}

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed z-40 w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col justify-between transition-all duration-300 ease-in-out ${
          sidebarOpen ? "left-0" : "-left-64 md:left-0"
        }`}
      >
        {/* Sidebar content */}
        <div>
          {/* Header */}
          <div className="p-4 border-b border-blue-700 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="bg-blue-100 text-blue-900 rounded-lg p-1">
                <FiClock />
              </span>
              Montir Panel
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                      location.pathname === item.path
                        ? "bg-blue-700 shadow-md font-medium"
                        : "hover:bg-blue-800/50"
                    }`}
                  >
                    <span className="mr-3 text-blue-200">{item.icon}</span>
                    <span>{item.name}</span>
                    {location.pathname === item.path && <FiCheck className="ml-auto" />}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Profile + Logout Footer */}
        <div className="p-4 border-t border-blue-700">
          <div className="flex items-center mb-4 gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <FiUser className="text-white" />
            </div>
            <div className="truncate">
              <p className="font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-blue-200 truncate">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 shadow hover:shadow-md"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarMontir;
