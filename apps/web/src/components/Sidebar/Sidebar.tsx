import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import MapIcon from '../../assets/icons/map.svg?react';
import PulseIcon from '../../assets/icons/pulse.svg?react';
import ArrowIcon from '../../assets/icons/arrow.svg?react';
import CalendarIcon from '../../assets/icons/calendar.svg?react';
import LogoutIcon from '../../assets/icons/logout.svg?react';
import './Sidebar.css';
import { useSidebar } from './use-sidebar';
import { useIsMobile } from './use-mobile';
import { MobileNav } from './MobileNav';
import { AppRoute } from '../../constants/routes';

interface NavItem {
  path: AppRoute;
  label: string;
  icon: React.ReactNode;
  indicator?: React.ReactNode;
}

interface SidebarProps {
  handleLogout: () => void;
}

const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
  <ArrowIcon className={`sidebar__collapse-icon${collapsed ? ' sidebar__collapse-icon--flipped' : ''}`} />
);

export function Sidebar({ handleLogout }: SidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileNav handleLogout={handleLogout} />;
  }

  return <DesktopSidebar handleLogout={handleLogout} />;
}

function DesktopSidebar({ handleLogout }: SidebarProps) {
  const { collapsed, toggle } = useSidebar();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems: NavItem[] = [
    {
      path: AppRoute.Pulse,
      label: 'The Pulse',
      icon: <PulseIcon />,
      indicator: <span className="sidebar__pulse-dot" />,
    },
    {
      path: AppRoute.Map,
      label: 'Map',
      icon: <MapIcon />,
    },
    {
      path: AppRoute.Scheduler,
      label: 'Scheduler',
      icon: <CalendarIcon />,
    },
  ];

  return (
    <nav
      className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}
      onTransitionEnd={() => window.dispatchEvent(new Event('resize'))}
    >
      <div className="sidebar__logo">
        <span className="sidebar__logo-mark">N</span>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              className="sidebar__logo-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              Nexus
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <ul className="sidebar__nav">
        {navItems.map((item) => (
          <li key={item.path}>
            <button
              type="button"
              className={`sidebar__item${pathname === item.path ? ' sidebar__item--active' : ''}`}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar__item-icon">
                {item.icon}
                {item.indicator}
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="sidebar__item-label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar__actions">
        <AnimatePresence>
          <motion.button
            type="button"
            className="app-signout-btn"
            onClick={handleLogout}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <LogoutIcon />
          </motion.button>
        </AnimatePresence>

        <button
          type="button"
          className="sidebar__toggle"
          onClick={toggle}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </div>
    </nav>
  );
}
