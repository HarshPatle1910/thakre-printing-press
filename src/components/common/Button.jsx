import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  href,
  target,
  className = '',
  onClick,
  ...props
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full',
    loading && 'btn--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading && <span className="btn__spinner" />}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="btn__icon" size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
      )}
      {children && <span className="btn__label">{children}</span>}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="btn__icon" size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} target={target} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
}
