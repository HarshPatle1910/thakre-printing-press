import { ExternalLink, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './AdminHeader.css';

export default function AdminHeader({ title, subtitle, actions }) {
  const { user } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <h1 className="admin-header__title">{title}</h1>
        {subtitle && <p className="admin-header__subtitle">{subtitle}</p>}
      </div>
      <div className="admin-header__right">
        {actions && <div className="admin-header__actions">{actions}</div>}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-header__view-site"
          title="View public website in new tab"
        >
          <ExternalLink size={16} />
          <span>View Site</span>
        </a>
      </div>
    </header>
  );
}
