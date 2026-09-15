import { Loader2 } from 'lucide-react';
import './Loader.css';

export default function Loader({ size = 'md', text, fullPage = false }) {
  const sizeMap = { sm: 20, md: 32, lg: 48 };
  const iconSize = sizeMap[size] || sizeMap.md;

  if (fullPage) {
    return (
      <div className="loader-fullpage">
        <div className="loader-content">
          <Loader2 className="loader-icon animate-spin" size={iconSize} />
          {text && <p className="loader-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loader">
      <Loader2 className="loader-icon animate-spin" size={iconSize} />
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
}
