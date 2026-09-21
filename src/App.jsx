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
import { useBusiness } from './contexts/BusinessContext';
import { Phone, MessageCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  const { business, settings } = useBusiness();
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  // Splash logic driven by settings
  const isSplashEnabled = settings?.enableSplashScreen !== false && settings?.splashFrequency !== 'disabled';
  
  const checkShouldShowSplash = () => {
    if (typeof window === 'undefined' || !isSplashEnabled) return false;
    const params = new URLSearchParams(window.location.search);
    if (params.has('splash')) return true;
    if (settings?.splashFrequency === 'always') return true;
    return !sessionStorage.getItem('tpp_splash_seen');
  };

  const [splashDone, setSplashDone] = useState(!checkShouldShowSplash());

  function handleSplashDone() {
    sessionStorage.setItem('tpp_splash_seen', '1');
    setSplashDone(true);
  }

  // Show splash if active and not an admin route
  if (!splashDone && !isAdminRoute && isSplashEnabled) {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  // Maintenance screen if active and not on /admin
  if (settings?.maintenanceMode && !isAdminRoute) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        background: '#0B0F19',
        color: '#F8FAFC',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          maxWidth: '560px',
          width: '100%',
          background: 'rgba(30, 41, 59, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '40px 28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(234, 88, 12, 0.15)',
            color: '#F97316',
            marginBottom: '20px'
          }}>
            <AlertTriangle size={32} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '12px' }}>
            {business?.name || 'Thakre Printing Press'}
          </h1>
          <p style={{ fontSize: '15px', color: '#CBD5E1', lineHeight: '1.6', marginBottom: '28px' }}>
            {settings?.maintenanceMessage || 'Our website is currently undergoing scheduled updates. For urgent printing orders, please call us or message on WhatsApp.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <a
              href={`https://wa.me/91${business?.whatsapp || '9923113085'}?text=Hello%20Thakre%20Printing%20Press`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: '#25D366',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <MessageCircle size={18} /> WhatsApp Us
            </a>
            <a
              href={`tel:+91${business?.phone || '9923113085'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: '#E11D48',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <Phone size={18} /> Call Us
            </a>
          </div>
          <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
            <a href="/admin/login" style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'none' }}>
              Staff & Admin Portal &rarr;
            </a>
          </div>
        </div>
      </div>
    );
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
