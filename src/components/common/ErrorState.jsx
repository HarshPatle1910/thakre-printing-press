import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';
import './ErrorState.css';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}) {
  return (
    <div className="error-state">
      <div className="error-state__icon-wrap">
        <AlertTriangle size={48} />
      </div>
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <Button variant="outline" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
