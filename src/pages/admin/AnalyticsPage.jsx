import { useState, useEffect } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import Loader from '../../components/common/Loader';
import firestoreService from '../../services/firestoreService';
import {
  BarChart3, Users, MessageSquare, Phone, MessageCircle,
  TrendingUp, Calendar, ArrowUpRight
} from 'lucide-react';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalVisits: 1420,
    enquiriesGenerated: 68,
    whatsappClicks: 142,
    phoneClicks: 89,
    quoteFormSubmissions: 54,
    conversionRate: '4.8%',
  });

  const popularServices = [
    { name: 'Flex & Banner Printing', count: 28, percentage: 41 },
    { name: 'Visiting Cards & Stationery', count: 19, percentage: 28 },
    { name: 'Wedding & Invitation Cards', count: 12, percentage: 18 },
    { name: 'Government Forms & Legal', count: 9, percentage: 13 },
  ];

  return (
    <div className="analytics-page animate-fade-in">
      <AdminHeader
        title="Visitor & Enquiry Analytics"
        subtitle="Insights on website traffic, enquiry conversion, and customer outreach actions"
      />

      {/* KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--blue">
            <Users size={22} />
          </div>
          <div className="kpi-card__data">
            <span className="kpi-card__value">{stats.totalVisits}</span>
            <span className="kpi-card__label">Total Page Views</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--green">
            <MessageSquare size={22} />
          </div>
          <div className="kpi-card__data">
            <span className="kpi-card__value">{stats.enquiriesGenerated}</span>
            <span className="kpi-card__label">Job Enquiries</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--whatsapp">
            <MessageCircle size={22} />
          </div>
          <div className="kpi-card__data">
            <span className="kpi-card__value">{stats.whatsappClicks}</span>
            <span className="kpi-card__label">WhatsApp Clicks</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--orange">
            <Phone size={22} />
          </div>
          <div className="kpi-card__data">
            <span className="kpi-card__value">{stats.phoneClicks}</span>
            <span className="kpi-card__label">Phone Call Clicks</span>
          </div>
        </div>
      </div>

      <div className="analytics-details-grid">
        {/* Popular Services */}
        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Most Requested Printing Services</h2>
            <p>Percentage share of quotation enquiries</p>
          </div>

          <div className="services-progress-list">
            {popularServices.map((svc) => (
              <div key={svc.name} className="service-progress-row">
                <div className="service-progress-header">
                  <span className="service-name">{svc.name}</span>
                  <span className="service-count">{svc.count} quotes ({svc.percentage}%)</span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${svc.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conversion Overview */}
        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Conversion Summary</h2>
            <p>Action efficiency from visitor to customer</p>
          </div>

          <div className="conversion-metrics-box">
            <div className="conversion-hero-stat">
              <span className="conversion-number">{stats.conversionRate}</span>
              <span className="conversion-text">Overall Lead Conversion Rate</span>
            </div>

            <div className="conversion-funnel">
              <div className="funnel-step">
                <span>Total Site Visitors</span>
                <strong>{stats.totalVisits}</strong>
              </div>
              <div className="funnel-step">
                <span>Direct Contact Clicked</span>
                <strong>{stats.whatsappClicks + stats.phoneClicks}</strong>
              </div>
              <div className="funnel-step">
                <span>Formal Quotes Submitted</span>
                <strong>{stats.quoteFormSubmissions}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
