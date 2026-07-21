import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CreateAssetPage } from './pages/CreateAssetPage';
import { AssetDetailPage } from './pages/AssetDetailPage';
import { MyAssetsPage } from './pages/MyAssetsPage';
import { ProposalsPage } from './pages/ProposalsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col transition-colors">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/assets/create" element={<CreateAssetPage />} />
                <Route path="/assets/:id" element={<AssetDetailPage />} />
                <Route path="/my-assets" element={<MyAssetsPage />} />
                <Route path="/proposals" element={<ProposalsPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/profile/:id" element={<UserProfilePage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
              </Routes>
            </main>
            <footer className="py-6 border-t border-color text-center text-xs text-muted">
              © 2026 ShareHub - Nền Tảng Chia Sẻ & Trao Đổi Tài Sản Cộng Đồng. All rights reserved.
            </footer>
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
