import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  ariaLabel = 'Search',
  count,
  className = '',
  id = 'site-search',
  autoFocus = false,
}) {
  const inputRef = useRef(null);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && value) {
      e.preventDefault();
      handleClear();
    }
  };

  return (
    <div className={`search-bar ${className}`}>
      <div className="search-bar__inner">
        <Search className="search-bar__icon" size={19} aria-hidden="true" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="search-bar__input"
          placeholder={placeholder}
          aria-label={ariaLabel}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck="false"
        />
        {value && (
          <div className="search-bar__actions">
            {typeof count === 'number' && (
              <span className="search-bar__count-badge" title={`${count} matches`}>
                {count}
              </span>
            )}
            <button
              type="button"
              className="search-bar__clear-btn"
              onClick={handleClear}
              aria-label="Clear search input"
              title="Clear search"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
