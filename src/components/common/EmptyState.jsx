import { FileQuestion } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({
  icon: Icon = FileQuestion,
  title = 'Nothing here yet',
  message = '',
  description = '',
  action,
}) {
  const displayText = description || message;

  return (
    <div className="empty-state">
      <div className="empty-state__icon-wrap">
        <Icon size={48} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {displayText && <p className="empty-state__message">{displayText}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
