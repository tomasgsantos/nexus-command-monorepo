import { motion } from 'framer-motion';
import type { AuthUser } from '@nexus/api';
import { PulseIndicator } from '../pulse/components/PulseIndicator';
import { ProjectNodesWidget } from '../pulse/components/ProjectNodesWidget';
import { SchedulerWidget } from '../scheduler/components/SchedulerWidget';
import './CentralCommand.css';

interface CentralCommandProps {
  user: AuthUser;
}

export default function CentralCommand({ user: _user }: CentralCommandProps) {
  return (
    <div className="command-root">
      <motion.header
        className="command-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="command-header__title">Central Command</h1>
        <div className="command-header__status">
          <PulseIndicator active />
          <span className="command-header__status-label">System Status: OK</span>
        </div>
      </motion.header>

      <div className="command-grid">
        <motion.div
          className="command-grid__cell"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <ProjectNodesWidget />
        </motion.div>

        <motion.div
          className="command-grid__cell"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
        >
          <SchedulerWidget />
        </motion.div>
      </div>
    </div>
  );
}
