import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Catalogo from './pages/Catalogo';
import ImportOrder from './pages/ImportOrder';
import { useStore } from './store/useStore';

function App() {
  const initSupabaseListeners = useStore(state => state.initSupabaseListeners);

  useEffect(() => {
    initSupabaseListeners();
  }, [initSupabaseListeners]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Fullscreen external routes */}
        <Route path="/catalogo/:deptId" element={<Catalogo />} />
        <Route path="/import/:payload" element={<ImportOrder />} />

        {/* Dashboard layout routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="departments" element={<Departments />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
