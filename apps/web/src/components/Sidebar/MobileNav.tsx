import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import MapIcon from '../../assets/icons/map.svg?react';
import PulseIcon from '../../assets/icons/pulse.svg?react';
import ArrowIcon from '../../assets/icons/arrow.svg?react';
import CalendarIcon from '../../assets/icons/calendar.svg?react';
import LogoutIcon from '../../assets/icons/logout.svg?react';
import './MobileNav.css';
import { useSidebar } from './use-sidebar';
import { AppRoute } from '../../constants/routes';

interface MobileNavProps {
  handleLogout: () => void;
}

export function MobileNav({ handleLogout }: MobileNavProps) {
  const { collapsed, toggle } = useSidebar();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = [
    { path: AppRoute.Pulse, label: 'The Pulse', icon: <PulseIcon />, indicator: <span className="mobile-nav__pulse-dot" /> },
    { path: AppRoute.Map, label: 'Map', icon: <MapIcon /> },
    { path: AppRoute.Scheduler, label: 'Scheduler', icon: <CalendarIcon /> },
  ];

  function goTo(path: AppRoute) {
    navigate(path);
    if (!collapsed) toggle();
  }

  return (
    <>
      <div className="mobile-nav">
        <span className="mobile-nav__logo-mark">N</span>

        <div className="mobile-nav__icons">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`mobile-nav__icon-btn${pathname === item.path ? ' mobile-nav__icon-btn--active' : ''}`}
              onClick={() => goTo(item.path)}
              title={item.label}
            >
              <span className="mobile-nav__icon-wrap">
                {item.icon}
                {item.indicator}
              </span>
            </button>
          ))}
        </div>

        <button type="button" className="mobile-nav__menu-btn" onClick={toggle} title="Open menu">
          <ArrowIcon className={`mobile-nav__menu-icon${!collapsed ? ' mobile-nav__menu-icon--open' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            className="mobile-nav__overlay"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="mobile-nav__overlay-main">
              <div className="mobile-nav__overlay-logo">
                <span className="mobile-nav__overlay-logo-mark">N</span>
                <span className="mobile-nav__overlay-logo-text">Nexus</span>
              </div>

              <ul className="mobile-nav__overlay-nav">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <button
                      type="button"
                      className={`mobile-nav__overlay-item${pathname === item.path ? ' mobile-nav__overlay-item--active' : ''}`}
                      onClick={() => goTo(item.path)}
                    >
                      <span className="mobile-nav__overlay-item-icon">
                        {item.icon}
                        {item.indicator}
                      </span>
                      <span className="mobile-nav__overlay-item-label">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mobile-nav__overlay-footer">
              <button type="button" className="mobile-nav__overlay-signout" onClick={handleLogout}>
                <LogoutIcon />
                Sign out
              </button>
              <button type="button" className="mobile-nav__overlay-close" onClick={toggle}>
                <ArrowIcon className="mobile-nav__overlay-close-icon" />
                Close menu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
