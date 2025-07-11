import React, { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";

const ManajemenService = () => {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: ""
  });

  // Load service data
  useEffect(() => {
    fetch("/data/services.json")
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error("Failed to load services:", err));
  }, []);

  const handleAddService = (e) => {
    e.preventDefault();
    const updated = [...services, { id: Date.now(), ...newService }];
    setServices(updated);
    setNewService({ name: "", description: "", price: "" });
  };

  const handleDelete = (id) => {
    const filtered = services.filter(service => service.id !== id);
    setServices(filtered);
  };

  return (
    <div className="flex">
      <SidebarAdmin />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Manajemen Layanan Service</h1>

        <form onSubmit={handleAddService} className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Tambah Service Baru</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nama Service"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Deskripsi"
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Harga"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              className="border p-2 rounded"
              required
            />
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Tambah Service</button>
        </form>

        <div className="bg-white rounded shadow">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Nama</th>
                <th className="border px-4 py-2">Deskripsi</th>
                <th className="border px-4 py-2">Harga</th>
                <th className="border px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id} className="text-center">
                  <td className="border px-2 py-1">{service.id}</td>
                  <td className="border px-2 py-1">{service.name}</td>
                  <td className="border px-2 py-1">{service.description}</td>
                  <td className="border px-2 py-1">Rp{parseInt(service.price).toLocaleString()}</td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">Belum ada layanan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ManajemenService;
