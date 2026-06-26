import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Login';
// dashboard admin kasir
import DashboardAdmin from './pages/admin/DasboardAdmin';
import ManajemenService from './pages/admin/ManajemenService';
import CustomerManagement from './pages/admin/CustomerManagement';
import ManajemenKaryawan from './pages/admin/ManajemenMechanic';
import ManajemenSparepart from './pages/admin/ManajemenSparepart';
import ManajemenPromo from './pages/admin/ManajemenPromo';
import CreateInvoice from './pages/admin/CreateInvoice';
import InvoiceHistory from './pages/admin/InvoiceHistory';
import ENota from './pages/ENota';

// dashboard montir
import DashboardMontir from './pages/montir/DashboardMontir';
import RiwayatMontir from './pages/montir/RiwayatMontir';
import ServiceReport from './pages/montir/ServiceReport';

// dashboard gudang
import DashboardGudang from './pages/gudang/DashboardGudang';
import SparepartMasuk from './pages/gudang/SparepartMasuk';
import ManajemenSparepartKeluar from './pages/gudang/SparepartKeluar';

function App() {
  return <MainLayout />;
}

function MainLayout() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/e-nota/:token" element={<ENota />} />


      <Route path="/admin/dashboardadmin" element={<DashboardAdmin />} />
      <Route path="/admin/service" element={<ManajemenService />} />
      <Route path="/admin/Pelanggan" element={<CustomerManagement />} />
      <Route path="/admin/karyawan" element={<ManajemenKaryawan />} />
      <Route path="/admin/sparepart" element={<ManajemenSparepart />} />
      <Route path="/admin/promo" element={<ManajemenPromo />} />
      <Route path="/admin/create-invoice/:bookingId" element={<CreateInvoice />} />
      <Route path="/admin/invoices/history" element={<InvoiceHistory />} />

      <Route path="/montir/dashboardmontir" element={<DashboardMontir />} />
      <Route path="/montir/riwayatmontir" element={<RiwayatMontir />} />
      <Route path="/montir/service-report/:bookingId" element={<ServiceReport />} />
      
      <Route path="/gudang/dashboardgudang" element={<DashboardGudang />} />
      <Route path="/gudang/masuk" element={<SparepartMasuk />} />
      <Route path="/gudang/keluar" element={<ManajemenSparepartKeluar />} />

    </Routes>
  );
}

export default App;