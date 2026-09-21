import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import {
  Users, MessageSquare, Phone, MessageCircle,
  TrendingUp, Calendar, RefreshCw, ExternalLink
} from 'lucide-react';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsDocs, setAnalyticsDocs] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [timeRange, setTimeRange] = useState('30d'); // '7d' | '30d' | 'all'

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [analyticsData, enquiriesData] = await Promise.all([
        firestoreService.getCollection(COLLECTIONS.ANALYTICS, []),
        firestoreService.getCollection(COLLECTIONS.ENQUIRIES, [
          firestoreService.orderBy('createdAt', 'desc'),
        ]),
      ]);

      setAnalyticsDocs(analyticsData || []);
      setEnquiries(enquiriesData || []);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter data based on selected timeRange ('7d', '30d', 'all')
  const {
    filteredAnalytics,
    filteredEnquiries,
    kpis,
    popularServices,
    statusCounts,
    topPages,
    dailyActivity,
    conversionFunnel,
  } = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date(0);
    if (timeRange === '7d') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    // 1. Filtered Analytics docs
    const fAnalytics = analyticsDocs.filter((doc) => {
      if (timeRange === 'all') return true;
      const dStr = doc.date || doc.id;
      return dStr >= cutoffDateStr;
    });

    // 2. Filtered Enquiries
    const fEnquiries = enquiries.filter((enq) => {
      if (timeRange === 'all') return true;
      const enqDate = enq.createdAt?.toDate ? enq.createdAt.toDate() : new Date(enq.createdAt);
      return enqDate >= cutoffDate;
    });

    // 3. Aggregate Page Views & Events
    let totalPageViews = 0;
    let whatsappClicks = 0;
    let phoneClicks = 0;
    let quoteFormSubmissions = 0;
    let quoteFormOpens = 0;

    const pageCountMap = {
      _home: { label: 'Homepage', path: '/', count: 0 },
      _services: { label: 'Services Catalogue', path: '/services', count: 0 },
      _quote: { label: 'Request a Quote', path: '/quote', count: 0 },
      _forms: { label: 'Government & Legal Forms', path: '/forms', count: 0 },
      _gallery: { label: 'Sample Print Gallery', path: '/gallery', count: 0 },
      _contact: { label: 'Contact & Location', path: '/contact', count: 0 },
      _about: { label: 'About Thakre Press', path: '/about', count: 0 },
      _faq: { label: 'Help & FAQs', path: '/faq', count: 0 },
    };

    fAnalytics.forEach((doc) => {
      const pvs = doc.pageViews || {};
      Object.entries(pvs).forEach(([pageKey, val]) => {
        const num = Number(val) || 0;
        totalPageViews += num;
        if (pageCountMap[pageKey]) {
          pageCountMap[pageKey].count += num;
        } else {
          const clean = pageKey.replace(/^_+/, '').replace(/_/g, '/');
          pageCountMap[pageKey] = {
            label: clean.charAt(0).toUpperCase() + clean.slice(1),
            path: '/' + clean,
            count: num,
          };
        }
      });

      const evts = doc.events || {};
      whatsappClicks += Number(evts.whatsappClick) || 0;
      phoneClicks += Number(evts.phoneClick) || 0;
      quoteFormOpens += Number(evts.quoteFormOpened) || 0;
      quoteFormSubmissions += Number(evts.quoteFormSubmitted) || 0;
    });

    const totalEnquiries = fEnquiries.length;
    const directContacts = whatsappClicks + phoneClicks;

    // Rates
    const conversionRate = totalPageViews > 0
      ? ((totalEnquiries / totalPageViews) * 100).toFixed(1) + '%'
      : '0.0%';

    const contactRate = totalPageViews > 0
      ? ((directContacts / totalPageViews) * 100).toFixed(1) + '%'
      : '0.0%';

    // 4. Most Requested Services from Enquiries
    const serviceCounts = {};
    let totalServiceInstances = 0;

    fEnquiries.forEach((enq) => {
      if (Array.isArray(enq.items) && enq.items.length > 0) {
        enq.items.forEach((item) => {
          const name = item.serviceName || item.serviceId || 'General Printing';
          serviceCounts[name] = (serviceCounts[name] || 0) + 1;
          totalServiceInstances += 1;
        });
      } else {
        const rawName = enq.serviceName || 'General Printing';
        const parts = rawName.split(',').map((p) => p.trim()).filter(Boolean);
        parts.forEach((p) => {
          serviceCounts[p] = (serviceCounts[p] || 0) + 1;
          totalServiceInstances += 1;
        });
      }
    });

    const sortedServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalServiceInstances > 0 ? Math.round((count / totalServiceInstances) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 5. Enquiry Status Pipeline
    const sCounts = {
      NEW: 0,
      IN_DISCUSSION: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    fEnquiries.forEach((enq) => {
      const st = enq.status || 'NEW';
      if (sCounts[st] !== undefined) sCounts[st] += 1;
      else if (st === 'CONTACTED') sCounts.IN_DISCUSSION += 1;
      else sCounts[st] = 1;
    });

    // 6. Top Visited Pages
    const sortedPages = Object.values(pageCountMap)
      .filter((p) => p.count > 0)
      .sort((a, b) => b.count - a.count);

    const maxPageViews = sortedPages[0]?.count || 1;

    // 7. Daily Activity Trend (Past 14 entries)
    const sortedDays = [...fAnalytics]
      .filter((d) => d.date || d.id)
      .sort((a, b) => (a.date || a.id).localeCompare(b.date || b.id))
      .slice(-14)
      .map((d) => {
        const dKey = d.date || d.id;
        const views = Object.values(d.pageViews || {}).reduce((s, v) => s + (Number(v) || 0), 0);
        const wa = Number(d.events?.whatsappClick) || 0;
        const phone = Number(d.events?.phoneClick) || 0;
        const enqOnDay = fEnquiries.filter((e) => {
          const dt = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.createdAt);
          return dt.toISOString().split('T')[0] === dKey;
        }).length;

        return {
          date: dKey,
          displayDate: new Date(dKey + 'T00:00:00').toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
          }),
          views,
          contacts: wa + phone,
          enquiries: enqOnDay,
        };
      });

    const maxDayViews = Math.max(...sortedDays.map((d) => d.views), 1);

    return {
      filteredAnalytics: fAnalytics,
      filteredEnquiries: fEnquiries,
      kpis: {
        totalPageViews,
        totalEnquiries,
        whatsappClicks,
        phoneClicks,
        conversionRate,
        contactRate,
        directContacts,
        quoteFormOpens,
      },
      popularServices: sortedServices,
      statusCounts: sCounts,
      topPages: sortedPages.map((p) => ({
        ...p,
        percentage: Math.round((p.count / maxPageViews) * 100),
      })),
      dailyActivity: sortedDays.map((d) => ({
        ...d,
        heightPct: Math.round((d.views / maxDayViews) * 100),
      })),
      conversionFunnel: {
        totalVisits: totalPageViews,
        quoteFormOpens,
        directContacts,
        totalEnquiries,
        completed: sCounts.COMPLETED,
      },
    };
  }, [analyticsDocs, enquiries, timeRange]);

  if (loading) return <Loader text="Loading real-time analytics..." />;

  return (
    <div className="analytics-page animate-fade-in">
      <AdminHeader
        title="Visitor & Enquiry Analytics"
        subtitle="Real-time performance metrics on website traffic, enquiry conversion, and customer outreach actions"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadData(true)}
          >
            Refresh Data
          </Button>
        }
      />

      {/* Date Range Toolbar */}
      <div className="analytics-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="var(--color-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
            Reporting Window:
          </span>
        </div>

        <div className="range-button-group">
          <button
            type="button"
            className={`range-btn ${timeRange === '7d' ? 'range-btn--active' : ''}`}
            onClick={() => setTimeRange('7d')}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            className={`range-btn ${timeRange === '30d' ? 'range-btn--active' : ''}`}
            onClick={() => setTimeRange('30d')}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            className={`range-btn ${timeRange === 'all' ? 'range-btn--active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Real KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--blue">
            <Users size={22} />
          </div>
          <div className="kpi-card__data">
            <span className="kpi-card__value">{kpis.totalPageViews.toLocaleString()}</span>
            <span className="kpi-card__label">Total Page Views</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--green">
            <MessageSquare size={22} />
          </div>
          <div className="kpi-card__data">
            <span className="kpi-card__value">{kpis.totalEnquiries}</span>
            <span className="kpi-card__label">Job Enquiries Created</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--whatsapp">
            <MessageCircle size={22} />
          </div>
          <div className="kpi-card__data">
            <span className="kpi-card__value">{kpis.whatsappClicks}</span>
            <span className="kpi-card__label">WhatsApp Clicks</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--orange">
            <Phone size={22} />
          </div>
          <div className="kpi-card__data">
            <span className="kpi-card__value">{kpis.phoneClicks}</span>
            <span className="kpi-card__label">Phone Call Clicks</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--purple">
            <TrendingUp size={22} />
          </div>
          <div className="kpi-card__data">
            <span className="kpi-card__value">{kpis.conversionRate}</span>
            <span className="kpi-card__label">Quote Conversion Rate</span>
          </div>
        </div>
      </div>

      {/* Enquiry Status & Pipeline Health */}
      <section className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-card__header flex-between">
          <div>
            <h2>Order Pipeline & Enquiry Health</h2>
            <p>Current operational status of customer printing enquiries</p>
          </div>
          <Link to="/admin/enquiries" style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Manage Enquiries <ExternalLink size={13} />
          </Link>
        </div>

        <div className="status-pipeline-grid">
          <div className="status-pill-card status-pill-card--new">
            <span className="status-num">{statusCounts.NEW}</span>
            <span className="status-title">New (Pending Review)</span>
          </div>
          <div className="status-pill-card status-pill-card--progress">
            <span className="status-num">{statusCounts.IN_DISCUSSION}</span>
            <span className="status-title">In Discussion / Proofing</span>
          </div>
          <div className="status-pill-card status-pill-card--completed">
            <span className="status-num">{statusCounts.COMPLETED}</span>
            <span className="status-title">Completed & Delivered</span>
          </div>
          <div className="status-pill-card status-pill-card--cancelled">
            <span className="status-num">{statusCounts.CANCELLED}</span>
            <span className="status-title">Cancelled / Closed</span>
          </div>
        </div>
      </section>

      {/* Daily Activity Chart */}
      <section className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-card__header flex-between">
          <div>
            <h2>Recent Daily Traffic & Activity</h2>
            <p>Daily breakdown of website visits over time</p>
          </div>
          {dailyActivity.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--color-primary)', borderRadius: '2px', display: 'inline-block' }} />
                Page Views
              </span>
            </div>
          )}
        </div>

        {dailyActivity.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', padding: 'var(--space-4) 0', margin: 0 }}>
            No visitor activity recorded yet. Live chart will populate automatically as visitors browse the website.
          </p>
        ) : (
          <div className="chart-container">
            <div className="activity-chart">
              {dailyActivity.map((day) => (
                <div key={day.date} className="activity-bar-group" title={`${day.date}: ${day.views} views, ${day.contacts} contacts, ${day.enquiries} quotes`}>
                  <span className="activity-bar-val">{day.views}</span>
                  <div className="activity-bar-track">
                    <div
                      className="activity-bar-fill"
                      style={{ height: `${Math.max(day.heightPct, 6)}%` }}
                    />
                  </div>
                  <span className="activity-bar-date">{day.displayDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 2-Column Analytics Details */}
      <div className="analytics-details-grid">
        {/* Most Requested Services */}
        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Most Requested Printing Services</h2>
            <p>Real share of services asked across customer enquiries</p>
          </div>

          {popularServices.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', padding: 'var(--space-4) 0' }}>
              No service enquiries recorded yet for this time window.
            </p>
          ) : (
            <div className="services-progress-list">
              {popularServices.map((svc) => (
                <div key={svc.name} className="service-progress-row">
                  <div className="service-progress-header">
                    <span className="service-name">{svc.name}</span>
                    <span className="service-count">
                      {svc.count} {svc.count === 1 ? 'quote' : 'quotes'} ({svc.percentage}%)
                    </span>
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
          )}
        </section>

        {/* Customer Conversion Funnel */}
        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Customer Conversion Funnel</h2>
            <p>Efficiency from website visitor to confirmed printing order</p>
          </div>

          <div className="conversion-metrics-box">
            <div className="conversion-hero-stat">
              <span className="conversion-number">{kpis.conversionRate}</span>
              <span className="conversion-text">Overall Visitor-to-Enquiry Conversion Rate</span>
            </div>

            <div className="conversion-funnel">
              <div className="funnel-step">
                <span>1. Total Website Page Views</span>
                <strong>{conversionFunnel.totalVisits.toLocaleString()}</strong>
              </div>
              <div className="funnel-step">
                <span>2. Direct Contacts Clicked (WhatsApp & Phone)</span>
                <strong>{conversionFunnel.directContacts}</strong>
              </div>
              <div className="funnel-step">
                <span>3. Formal Quotes & Enquiries Submitted</span>
                <strong>{conversionFunnel.totalEnquiries}</strong>
              </div>
              <div className="funnel-step">
                <span>4. Completed & Delivered Print Orders</span>
                <strong style={{ color: 'var(--color-success, #10b981)' }}>{conversionFunnel.completed}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Website Page Popularity Table */}
      <section className="admin-card">
        <div className="admin-card__header">
          <h2>Website Page Popularity</h2>
          <p>Real breakdown of page visits across public sections of Thakre Printing Press</p>
        </div>

        {topPages.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', padding: 'var(--space-4) 0', margin: 0 }}>
            No page visits logged yet for this reporting window.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="pages-table">
              <thead>
                <tr>
                  <th>Page Name</th>
                  <th>URL Path</th>
                  <th>Views</th>
                  <th style={{ minWidth: '160px' }}>Traffic Share</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page) => (
                  <tr key={page.path}>
                    <td>
                      <strong>{page.label}</strong>
                    </td>
                    <td>
                      <code style={{ fontSize: '12px', background: 'var(--color-surface)', padding: '2px 6px', borderRadius: '4px' }}>
                        {page.path}
                      </code>
                    </td>
                    <td>
                      <strong>{page.count.toLocaleString()}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1 }} className="page-cell-bar">
                          <div className="page-cell-fill" style={{ width: `${page.percentage}%` }} />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', minWidth: '35px' }}>
                          {page.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

