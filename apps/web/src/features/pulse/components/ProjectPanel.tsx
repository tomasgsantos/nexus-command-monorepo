import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectWithOwner } from '@nexus/api';
import { PulseIndicator } from './PulseIndicator';

interface ProjectPanelProps {
  project: ProjectWithOwner | null;
  onClose: () => void;
}

const HEALTH_LABELS: Record<ProjectWithOwner['health_status'], string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  failing: 'Failing',
};

export function ProjectPanel({ project, onClose }: ProjectPanelProps) {
  return (
    <AnimatePresence>
      {project && (
        <motion.aside
          className="project-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="project-panel__header">
            <h2 className="project-panel__title">{project.title}</h2>
            <button type="button" className="project-panel__close" onClick={onClose}>
              &times;
            </button>
          </div>

          <div className="project-panel__status">
            <PulseIndicator active={project.health_status === 'on_track'} />
            <span className={`project-panel__badge project-panel__badge--${project.health_status}`}>
              {HEALTH_LABELS[project.health_status]}
            </span>
          </div>

          <dl className="project-panel__details">
            <div className="project-panel__row">
              <dt>Owner</dt>
              <dd>{project.owner_display_name}</dd>
            </div>
            {project.city && (
              <div className="project-panel__row">
                <dt>Location</dt>
                <dd>{project.city}, {project.country}</dd>
              </div>
            )}
            {project.lat != null && project.lng != null && (
              <div className="project-panel__row">
                <dt>Coordinates</dt>
                <dd>{project.lat.toFixed(4)}, {project.lng.toFixed(4)}</dd>
              </div>
            )}
            <div className="project-panel__row">
              <dt>Last Updated</dt>
              <dd className="project-panel__muted">&mdash;</dd>
            </div>
          </dl>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
