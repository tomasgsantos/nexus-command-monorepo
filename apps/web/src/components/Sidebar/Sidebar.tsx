import { motion } from 'framer-motion';
import MapIcon  from '../../assets/icons/map.svg?react';
import PulseIcon from '../../assets/icons/pulse.svg?react'
import ArrowIcon from '../../assets/icons/arrow.svg?react'
import './Sidebar.css';
import { useSidebar } from './use-sidebar';

export type NavPage = 'pulse' | 'map';

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ReactNode;
  indicator?: React.ReactNode;
}

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  handleLogout: () => void;
}

const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
  <ArrowIcon className={`sidebar__collapse-icon${collapsed ? ' sidebar__collapse-icon--flipped' : ''}`} />
);

export function Sidebar({ activePage, onNavigate, handleLogout }: SidebarProps) {
  const {collapsed, toggle} = useSidebar();
  const navItems: NavItem[] = [
    {
      id: 'pulse',
      label: 'The Pulse',
      icon: <PulseIcon />,
      indicator: <span className="sidebar__pulse-dot" />,
    },
    {
      id: 'map',
      label: 'Map',
      icon: <MapIcon />,
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
          <li key={item.id}>
            <button
              type="button"
              className={`sidebar__item${activePage === item.id ? ' sidebar__item--active' : ''}`}
              onClick={() => onNavigate(item.id)}
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
