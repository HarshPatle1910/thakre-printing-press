import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Building2, Palette, Clock, MapPin, Share2,
  Home, Package, Image, FileText, Users, HelpCircle, MessageSquare,
  BarChart3, Activity, Settings, LogOut, Printer, ChevronDown
} from 'lucide-react';
import './AdminLayout.css';

const navSections = [
  {
    label: 'BUSINESS', items: [
      { to: '/admin/business', icon: Building2, label: 'Business Profile' },
      { to: '/admin/branding', icon: Palette, label: 'Branding' },
      { to: '/admin/hours', icon: Clock, label: 'Opening Hours' },
      { to: '/admin/location', icon: MapPin, label: 'Location' },
      { to: '/admin/social', icon: Share2, label: 'Social Media' },
    ]
  },
  {
    label: 'CONTENT', items: [
      { to: '/admin/homepage', icon: Home, label: 'Homepage' },
      { to: '/admin/services', icon: Package, label: 'Services' },
      { to: '/admin/gallery', icon: Image, label: 'Gallery' },
      { to: '/admin/forms', icon: FileText, label: 'Forms' },
      { to: '/admin/about', icon: Users, label: 'About / Family' },
      { to: '/admin/faqs', icon: HelpCircle, label: 'FAQs' },
    ]
  },
  {
    label: 'CUSTOMERS', items: [
      { to: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries' },
    ]
  },
  {
    label: 'SYSTEM', items: [
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/admin/users', icon: Users, label: 'Users & Roles', ownerOnly: true },
      { to: '/admin/logs', icon: Activity, label: 'Activity Logs' },
      { to: '/admin/settings', icon: Settings, label: 'Settings', ownerOnly: true },
    ]
  },
];

export default function AdminLayout({ children }) {
  const { user, userRole, logout, isOwner } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <Printer size={22} />
          <span>TPP Admin</span>
        </div>

        <nav className="admin-sidebar__nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          {navSections.map((section) => (
            <div key={section.label} className="admin-nav-section">
              <div className="admin-nav-section__label">{section.label}</div>
              {section.items
                .filter(item => !item.ownerOnly || isOwner())
                .map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}>
                  <item.icon size={18} /> {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__user-info">
              <span className="admin-sidebar__user-name">{user?.displayName || user?.email}</span>
              <span className="admin-sidebar__user-role">{userRole}</span>
            </div>
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
