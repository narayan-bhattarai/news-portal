import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ArticleDetail from './pages/ArticleDetail';
import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import GenericPage from './pages/GenericPage';
import NotFound from './pages/NotFound';

import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPages from './pages/admin/AdminPages';
import AdminMessages from './pages/admin/AdminMessages';
import AdminChat from './pages/admin/AdminChat';

import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { config } from './config';

function App() {
  const [, setTheme] = useState('light');

  useEffect(() => {
    // Set Site Title & Favicon from Config
    document.title = config.siteTitle;
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = config.favicon;
    }

    // Theme Handling
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes - Wrapped in MainLayout */}
        {/* Standalone Route for Login */}
        <Route path="/login" element={<Login />} />

        {/* Public Routes - Wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<GenericPage slug="privacy-policy" defaultTitle="Privacy Policy" />} />
          <Route path="/terms-of-service" element={<GenericPage slug="terms-of-service" defaultTitle="Terms of Service" />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Routes - Separate Layout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <AdminLayout />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="articles" replace />} />
          <Route path="articles" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="chat" element={<AdminChat />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
