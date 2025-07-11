import React, { useState, useEffect } from "react";
import { 
  FaBars, 
  FaTimes, 
  FaTachometerAlt, 
  FaSignInAlt, 
  FaSignOutAlt,
  FaWarehouse,
  FaPowerOff
} from "react-icons/fa";

const SidebarGudang = ({ activeMenu, setActiveMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.href = "/";
  };

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <FaTachometerAlt className="mr-3" /> },
    { key: "masuk", label: "Stok Masuk", icon: <FaSignInAlt className="mr-3" /> },
    { key: "keluar", label: "Stok Keluar", icon: <FaSignOutAlt className="mr-3" /> }
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed z-50 top-4 left-4 p-2 rounded-md bg-gray-800 text-white shadow-lg"
        >
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 w-64 bg-gray-800 text-white min-h-screen transition-all duration-300 ease-in-out
          ${isOpen ? 'left-0' : '-left-64'} md:left-0`}
      >
        <div className="p-4 flex items-center border-b border-gray-700">
          <FaWarehouse className="text-2xl mr-2 text-blue-400" />
          <h1 className="text-2xl font-bold">Gudang</h1>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map(menu => (
            <button
              key={menu.key}
              onClick={() => {
                setActiveMenu(menu.key);
                if (isMobile) setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                ${activeMenu === menu.key 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "hover:bg-gray-700 text-gray-300"}`}
            >
              {menu.icon}
              {menu.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer with Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 mb-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
          >
            <FaPowerOff className="mr-2" />
            Logout
          </button>
          <div className="text-sm text-gray-400">Bengkel Motor</div>
          <div className="text-xs text-gray-500">v1.0.0</div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
        />
      )}
    </>
  );
};

export default SidebarGudang;