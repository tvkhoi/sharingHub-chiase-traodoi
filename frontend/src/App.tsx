import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
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
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserGuidePage } from './pages/legal/UserGuidePage';
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/legal/TermsOfServicePage';
import { ReportIssuePage } from './pages/legal/ReportIssuePage';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { socketService } from './services/socket.service';

export const App: React.FC = () => {
  React.useEffect(() => {
    socketService.connect();

    const handleUnload = () => {
      socketService.disconnect();
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<ProtectedRoute guestOnly><LoginPage /></ProtectedRoute>} />
                <Route path="/register" element={<ProtectedRoute guestOnly><RegisterPage /></ProtectedRoute>} />
                <Route path="/assets/create" element={<ProtectedRoute><CreateAssetPage /></ProtectedRoute>} />
                <Route path="/assets/:id" element={<AssetDetailPage />} />
                <Route path="/my-assets" element={<ProtectedRoute><MyAssetsPage /></ProtectedRoute>} />
                <Route path="/proposals" element={<ProtectedRoute><ProposalsPage /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
                <Route path="/profile/:id" element={<UserProfilePage />} />
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><AdminReportsPage /></ProtectedRoute>} />
                <Route path="/guide" element={<UserGuidePage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/report-issue" element={<ReportIssuePage />} />
              </Routes>
            </main>
            <Footer />
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
  </LanguageProvider>
  );
};

export default App;
