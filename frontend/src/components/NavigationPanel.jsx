import { Link, useLocation, useNavigate } from 'react-router-dom';

const NavigationPanel = ({
  title = 'Navigation',
  welcomeMessage,
  initials,
  userName,
  userRole,
  items = [],
  onItemSelect,
  className = '',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const baseClass = 'student-dashboard__sidebar';
  const combinedClassName = className ? `${baseClass} ${className}` : baseClass;
  const resolvedWelcome = welcomeMessage ?? (userName ? `Welcome back, ${userName}` : 'Welcome back!');

  const handleItemInteraction = (item, event) => {
    if (typeof item.onClick === 'function') {
      item.onClick(event, item);
    }
    if (typeof onItemSelect === 'function') {
      onItemSelect(item, event);
    }
  };

  const renderItemContent = (item) => (
    <>
      {item.icon && (
        <span className="sidebar-nav__icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span>{item.label}</span>
    </>
  );

  return (
    <aside className={combinedClassName} aria-label={title}>
      <div className="sidebar-header">
        <h2>{title}</h2>
        <p>{resolvedWelcome}</p>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const isActive =
            typeof item.active === 'boolean'
              ? item.active
              : Boolean(item.to && location.pathname.startsWith(item.to));
          const itemClass = `sidebar-nav__item${isActive ? ' sidebar-nav__item--active' : ''}`;

          if (item.to) {
            return (
              <Link
                key={item.id ?? item.label}
                to={item.to}
                className={itemClass}
                onClick={(event) => handleItemInteraction(item, event)}
              >
                {renderItemContent(item)}
              </Link>
            );
          }

          return (
            <button
              key={item.id ?? item.label}
              type="button"
              className={itemClass}
              onClick={(event) => handleItemInteraction(item, event)}
            >
              {renderItemContent(item)}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        className="sidebar-footer"
        onClick={() => navigate('/profile')} // i probably should have been using this more 
      >
        <div className="sidebar-footer__avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="sidebar-footer__details">
          <p className="sidebar-footer__name">{userName}</p>
          <p className="sidebar-footer__role">{userRole}</p>
        </div>
      </button>
    </aside>
  );
};

export default NavigationPanel;
