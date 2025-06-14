import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SparepartManagement = () => {
  const [spareparts, setSpareparts] = useState([]);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSparepart, setEditingSparepart] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    stock: 0,
    price: 0,
    category: '',
    serviceId: '',
    isPromo: false,
    promoPrice: 0
  });
  const navigate = useNavigate();

  // Load data from JSON
  useEffect(() => {
    const loadData = async () => {
      try {
        // In a real app, you would fetch from API
        const serviceData = {
          "services": [
            {
              "id": 1,
              "name": "Ganti Oli Mesin",
              "category": "Perawatan Rutin",
              "options": [
                { "id": 101, "name": "Oli Mesin VW Original", "price": 450000 },
                { "id": 102, "name": "Filter Oli", "price": 150000 }
              ]
            },
            {
              "id": 2,
              "name": "Ganti Kampas Rem",
              "category": "Perbaikan",
              "options": [
                { "id": 201, "name": "Kampas Rem Depan", "price": 1200000 },
                { "id": 202, "name": "Kampas Rem Belakang", "price": 950000 }
              ]
            }
          ]
        };

        // Transform service options into spareparts
        const transformedSpareparts = serviceData.services.flatMap(service => 
          service.options.map(option => ({
            id: option.id,
            name: option.name,
            price: option.price,
            category: service.category,
            serviceId: service.id,
            serviceName: service.name,
            stock: Math.floor(Math.random() * 50) + 10, // Random stock
            status: 'Available',
            isPromo: Math.random() > 0.7 // 30% chance of being promo
          }))
        );

        setServices(serviceData.services);
        setSpareparts(transformedSpareparts);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingSparepart) {
      // Update existing sparepart
      setSpareparts(spareparts.map(sp => 
        sp.id === editingSparepart.id ? { ...sp, ...formData } : sp
      ));
    } else {
      // Add new sparepart
      const newSparepart = {
        id: Math.max(...spareparts.map(sp => sp.id), 0) + 1,
        ...formData,
        status: 'Available'
      };
      setSpareparts([...spareparts, newSparepart]);
    }
    
    setEditingSparepart(null);
    setFormData({
      name: '',
      stock: 0,
      price: 0,
      category: '',
      serviceId: '',
      isPromo: false,
      promoPrice: 0
    });
  };

  const handleEdit = (sparepart) => {
    setEditingSparepart(sparepart);
    setFormData({
      name: sparepart.name,
      stock: sparepart.stock,
      price: sparepart.price,
      category: sparepart.category,
      serviceId: sparepart.serviceId,
      isPromo: sparepart.isPromo || false,
      promoPrice: sparepart.promoPrice || 0
    });
  };

  const handleDelete = (id) => {
    setSpareparts(spareparts.filter(sp => sp.id !== id));
  };

  const toggleStatus = (id) => {
    setSpareparts(spareparts.map(sp => 
      sp.id === id ? { 
        ...sp, 
        status: sp.status === 'Available' ? 'Out of Stock' : 'Available' 
      } : sp
    ));
  };

  const filteredSpareparts = spareparts.filter(sp => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'promo' && sp.isPromo) || 
                         (filter === 'out_of_stock' && sp.status === 'Out of Stock');
    
    const matchesSearch = sp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         sp.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sparepart Management</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search spareparts..."
            className="px-4 py-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Spareparts</option>
            <option value="promo">Promo Items</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <button
            onClick={() => setEditingSparepart({})}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add New Sparepart
          </button>
        </div>
      </div>

      {/* Sparepart Form Modal */}
      {(editingSparepart !== null) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingSparepart.id ? 'Edit Sparepart' : 'Add New Sparepart'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Price (IDR)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Perawatan Rutin">Perawatan Rutin</option>
                  <option value="Perbaikan">Perbaikan</option>
                  <option value="Body">Body</option>
                  <option value="Aksesoris">Aksesoris</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Service</label>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select Service (Optional)</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isPromo"
                  name="isPromo"
                  checked={formData.isPromo}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="isPromo" className="text-gray-700">Promo Item</label>
              </div>
              
              {formData.isPromo && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Promo Price (IDR)</label>
                  <input
                    type="number"
                    name="promoPrice"
                    value={formData.promoPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    min="0"
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingSparepart(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingSparepart.id ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spareparts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSpareparts.map(sparepart => (
              <tr key={sparepart.id}>
                <td className="px-6 py-4 whitespace-nowrap">{sparepart.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{sparepart.name}</div>
                  {sparepart.isPromo && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">PROMO</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{sparepart.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sparepart.serviceId ? 
                    services.find(s => s.id === parseInt(sparepart.serviceId))?.name || 'N/A' : 
                    'Standalone'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{sparepart.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sparepart.isPromo ? (
                    <>
                      <span className="line-through text-gray-400 mr-2">
                        Rp{sparepart.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-red-600">
                        Rp{sparepart.promoPrice.toLocaleString('id-ID')}
                      </span>
                    </>
                  ) : (
                    `Rp${sparepart.price.toLocaleString('id-ID')}`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sparepart.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {sparepart.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEdit(sparepart)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(sparepart.id)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    {sparepart.status === 'Available' ? 'Set Out of Stock' : 'Set Available'}
                  </button>
                  <button
                    onClick={() => handleDelete(sparepart.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Promo Package Section */}
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Promo Packages</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Promo Package 1 */}
            <div className="border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-blue-50 p-4 border-b">
                <h3 className="font-bold text-lg">Paket Service Lengkap</h3>
                <p className="text-sm text-gray-600">Include: Ganti Oli Mesin + Filter Oli + Pembersihan Mesin</p>
              </div>
              <div className="p-4">
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>Oli Mesin VW Original</li>
                  <li>Filter Oli Baru</li>
                  <li>Pembersihan Mesin</li>
                </ul>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="line-through text-gray-400 mr-2">Rp800.000</span>
                    <span className="text-lg font-bold text-red-600">Rp650.000</span>
                  </div>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Create Package
                  </button>
                </div>
              </div>
            </div>

            {/* Example Promo Package 2 */}
            <div className="border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-blue-50 p-4 border-b">
                <h3 className="font-bold text-lg">Paket Rem Komplit</h3>
                <p className="text-sm text-gray-600">Include: Kampas Rem Depan + Belakang + Minyak Rem</p>
              </div>
              <div className="p-4">
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>Kampas Rem Depan</li>
                  <li>Kampas Rem Belakang</li>
                  <li>Minyak Rem Baru</li>
                </ul>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="line-through text-gray-400 mr-2">Rp2.450.000</span>
                    <span className="text-lg font-bold text-red-600">Rp2.100.000</span>
                  </div>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Create Package
                  </button>
                </div>
              </div>
            </div>

            {/* Add New Promo Package Card */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 cursor-pointer">
              <div className="text-center p-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">New Promo Package</h3>
                <p className="mt-1 text-sm text-gray-500">Create a new bundled service package</p>
                <button className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                  Add Package
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparepartManagement;