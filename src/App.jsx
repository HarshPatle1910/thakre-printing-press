import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/common/SplashScreen';

// Layouts & Guards
import PublicLayout from './components/public/PublicLayout';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import ServiceDetailPage from './pages/public/ServiceDetailPage';
import GalleryPage from './pages/public/GalleryPage';
import FormsPage from './pages/public/FormsPage';
import AboutPage from './pages/public/AboutPage';
import FAQPage from './pages/public/FAQPage';
import QuotePage from './pages/public/QuotePage';
import ContactPage from './pages/public/ContactPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import BusinessProfilePage from './pages/admin/BusinessProfilePage';
import BrandingPage from './pages/admin/BrandingPage';
import OpeningHoursPage from './pages/admin/OpeningHoursPage';
import LocationPage from './pages/admin/LocationPage';
import SocialMediaPage from './pages/admin/SocialMediaPage';
import HomepageCMSPage from './pages/admin/HomepageCMSPage';
import ServicesListPage from './pages/admin/ServicesListPage';
import ServiceEditPage from './pages/admin/ServiceEditPage';
import GalleryListPage from './pages/admin/GalleryListPage';
import GalleryEditPage from './pages/admin/GalleryEditPage';
import FormsListPage from './pages/admin/FormsListPage';
import FormEditPage from './pages/admin/FormEditPage';
import AboutEditPage from './pages/admin/AboutEditPage';
import FAQListPage from './pages/admin/FAQListPage';
import FAQEditPage from './pages/admin/FAQEditPage';
import EnquiriesListPage from './pages/admin/EnquiriesListPage';
import EnquiryDetailPage from './pages/admin/EnquiryDetailPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import UsersPage from './pages/admin/UsersPage';
import ActivityLogPage from './pages/admin/ActivityLogPage';
import SettingsPage from './pages/admin/SettingsPage';

/** Show splash only on the very first visit per browser session */
const hasSeenSplash = sessionStorage.getItem('tpp_splash_seen');

export default function App() {
  const [splashDone, setSplashDone] = useState(!!hasSeenSplash);

  function handleSplashDone() {
    sessionStorage.setItem('tpp_splash_seen', '1');
    setSplashDone(true);
  }

  // Don't skip splash for admin routes — they go straight in without it
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  if (!splashDone && !isAdminRoute) {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Route>

      {/* Admin Authentication */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Admin Protected CMS Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="business" element={<BusinessProfilePage />} />
        <Route path="branding" element={<BrandingPage />} />
        <Route path="hours" element={<OpeningHoursPage />} />
        <Route path="location" element={<LocationPage />} />
        <Route path="social" element={<SocialMediaPage />} />
        <Route path="homepage" element={<HomepageCMSPage />} />

        {/* Services CRUD */}
        <Route path="services" element={<ServicesListPage />} />
        <Route path="services/new" element={<ServiceEditPage />} />
        <Route path="services/:id" element={<ServiceEditPage />} />

        {/* Gallery CRUD */}
        <Route path="gallery" element={<GalleryListPage />} />
        <Route path="gallery/new" element={<GalleryEditPage />} />
        <Route path="gallery/:id" element={<GalleryEditPage />} />

        {/* Forms Catalog CRUD */}
        <Route path="forms" element={<FormsListPage />} />
        <Route path="forms/new" element={<FormEditPage />} />
        <Route path="forms/:id" element={<FormEditPage />} />

        {/* About & FAQs */}
        <Route path="about" element={<AboutEditPage />} />
        <Route path="faqs" element={<FAQListPage />} />
        <Route path="faqs/new" element={<FAQEditPage />} />
        <Route path="faqs/:id" element={<FAQEditPage />} />

        {/* Enquiries / Leads */}
        <Route path="enquiries" element={<EnquiriesListPage />} />
        <Route path="enquiries/:id" element={<EnquiryDetailPage />} />

        {/* System & Analytics */}
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute requiredRole="OWNER">
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="logs" element={<ActivityLogPage />} />
        <Route
          path="settings"
          element={
            <ProtectedRoute requiredRole="OWNER">
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
