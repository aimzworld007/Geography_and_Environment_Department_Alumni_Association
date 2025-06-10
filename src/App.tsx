import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import SubmitForm from './pages/Submit/SubmitForm';
import PrintView from './pages/Print/PrintView';
import SearchPage from './pages/Search/SearchPage';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SubmitForm />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="print/:serialId" element={<PrintView />} />
          <Route path="admin" element={<AdminLogin />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;