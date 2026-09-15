export default function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase();

  const getVariant = () => {
    switch (normalized) {
      case 'NEW':
        return { label: 'New', className: 'badge--info' };
      case 'CONTACTED':
        return { label: 'Contacted', className: 'badge--warning' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', className: 'badge--primary' };
      case 'COMPLETED':
        return { label: 'Completed', className: 'badge--success' };
      case 'CANCELLED':
        return { label: 'Cancelled', className: 'badge--error' };
      case 'PUBLISHED':
        return { label: 'Published', className: 'badge--success' };
      case 'DRAFT':
        return { label: 'Draft', className: 'badge--warning' };
      default:
        return { label: status, className: 'badge--info' };
    }
  };

  const { label, className } = getVariant();

  return <span className={`badge ${className}`}>{label}</span>;
}
