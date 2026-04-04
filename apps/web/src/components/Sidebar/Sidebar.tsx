import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import MapIcon  from '../../assets/icons/map.svg?react';
import PulseIcon from '../../assets/icons/pulse.svg?react'
import ArrowIcon from '../../assets/icons/arrow.svg?react'
import CalendarIcon from '../../assets/icons/calendar.svg?react'
import './Sidebar.css';
import { useSidebar } from './use-sidebar';
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
    <motion.nav
      className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      <div className="sidebar__logo">
        <span className="sidebar__logo-mark">N</span>
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
              {!collapsed && (
                <motion.span
                  className="sidebar__item-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="app-signout-btn" onClick={handleLogout}>
        Sign out
      </button>

      <button
        type="button"
        className="sidebar__toggle"
        onClick={toggle}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <CollapseIcon collapsed={collapsed} />
      </button>
    </motion.nav>
  );
}
