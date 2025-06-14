import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const DashboardAdmin = () => {
  const [currentTab, setCurrentTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [bookingsRes, customersRes, mechanicsRes, sparepartsRes] = await Promise.all([
          fetch("/data/bookings.json"),
          fetch("/data/customers.json"),
          fetch("/data/mechanics.json"),
          fetch("/data/spareparts.json")
        ]);

        if (!bookingsRes.ok) throw new Error("Failed to fetch bookings data");
        if (!customersRes.ok) throw new Error("Failed to fetch customers data");
        if (!mechanicsRes.ok) throw new Error("Failed to fetch mechanics data");
        if (!sparepartsRes.ok) throw new Error("Failed to fetch spareparts data");

        const [bookingsData, customersData, mechanicsData, sparepartsData] = await Promise.all([
          bookingsRes.json(),
          customersRes.json(),
          mechanicsRes.json(),
          sparepartsRes.json()
        ]);

        setBookings(bookingsData);
        setCustomers(customersData);
        setMechanics(mechanicsData);
        setSpareparts(sparepartsData);
      } catch (error) {
        setError(error.message);
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleAssignMechanic = (bookingId, mechanicId) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { ...booking, mechanicId } : booking
    );
    setBookings(updatedBookings);
  };

  const handleUpdateSparepart = (sparepartId, updates) => {
    const updatedSpareparts = spareparts.map(sparepart => 
      sparepart.id === sparepartId ? { ...sparepart, ...updates } : sparepart
    );
    setSpareparts(updatedSpareparts);
  };

  const sendWhatsAppNotification = (phone, message) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="m-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="m-auto text-center">
          <div className="text-red-500 text-xl font-bold">Error loading data</div>
          <p className="text-gray-600 mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
        <nav>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setCurrentTab('bookings')}
                className={`w-full text-left p-2 rounded ${currentTab === 'bookings' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
              >
                Booking Management
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentTab('customers')}
                className={`w-full text-left p-2 rounded ${currentTab === 'customers' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
              >
                Customer Management
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentTab('mechanics')}
                className={`w-full text-left p-2 rounded ${currentTab === 'mechanics' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
              >
                Mechanic Management
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentTab('spareparts')}
                className={`w-full text-left p-2 rounded ${currentTab === 'spareparts' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
              >
                Sparepart Management
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {currentTab === 'bookings' && 'Booking Management'}
            {currentTab === 'customers' && 'Customer Management'}
            {currentTab === 'mechanics' && 'Mechanic Management'}
            {currentTab === 'spareparts' && 'Sparepart Management'}
          </h2>
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {currentTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Plate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mechanic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => {
                  const customer = customers.find(c => c.vehiclePlate === booking.vehiclePlate);
                  const mechanic = mechanics.find(m => m.id === booking.mechanicId);
                  
                  return (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{booking.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{booking.vehiclePlate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{booking.serviceType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{booking.bookingDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={booking.mechanicId || ''}
                          onChange={(e) => handleAssignMechanic(booking.id, e.target.value)}
                          className="border rounded p-1"
                        >
                          <option value="">Select Mechanic</option>
                          {mechanics.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            const message = `Your vehicle ${booking.vehiclePlate} is being serviced by ${mechanic?.name || 'our mechanic'}.`;
                            sendWhatsAppNotification(customer?.phone, message);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          Notify
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Complete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {currentTab === 'customers' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Plate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.vehiclePlate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.lastServiceDate} ({customer.lastServiceType})</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          const message = `Reminder: Your Volkswagen ${customer.vehicleModel} (${customer.vehiclePlate}) is due for service. Last service was on ${customer.lastServiceDate}.`;
                          sendWhatsAppNotification(customer.phone, message);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Send Reminder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {currentTab === 'mechanics' && (
          <div>
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Mechanic List</h3>
              <button
                onClick={() => navigate('/admin/mechanics/new')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add New Mechanic
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mechanics.map((mechanic) => (
                <div key={mechanic.id} className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-bold text-lg">{mechanic.name}</h4>
                  <p className="text-gray-600">Specialization: {mechanic.specialization}</p>
                  <p className="text-gray-600">Status: 
                    <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      mechanic.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {mechanic.status}
                    </span>
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'spareparts' && (
          <div>
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Sparepart Inventory</h3>
              <div className="space-x-2">
                <button
                  onClick={() => navigate('/admin/spareparts/new')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add New Sparepart
                </button>
                <button
                  onClick={() => navigate('/admin/spareparts/promo')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Create Promo Package
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {spareparts.map((sparepart) => (
                    <tr key={sparepart.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{sparepart.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{sparepart.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sparepart.isPromo ? (
                          <>
                            <span className="line-through text-gray-400 mr-2">Rp{sparepart.price.toLocaleString()}</span>
                            <span className="text-red-600">Rp{sparepart.promoPrice.toLocaleString()}</span>
                          </>
                        ) : (
                          `Rp${sparepart.price.toLocaleString()}`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sparepart.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {sparepart.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sparepart.isPromo ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/spareparts/edit/${sparepart.id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const updatedStatus = sparepart.status === 'Available' ? 'Out of Stock' : 'Available';
                            handleUpdateSparepart(sparepart.id, { status: updatedStatus });
                          }}
                          className="text-yellow-600 hover:text-yellow-900 mr-2"
                        >
                          Toggle Status
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin;