import React from "react";

const DashboardMontir = () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800">Montir Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome, {user?.name || "Technician"}!
        </p>
        {/* Montir-specific content here */}
      </div>
    </div>
  );
};

export default DashboardMontir;