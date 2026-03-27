import type { Project } from '@nexus/api';
import { PulseIndicator } from './PulseIndicator';

interface ProjectNodeProps {
  project: Project;
  onClick: (project: Project) => void;
}

export function ProjectNode({ project, onClick }: ProjectNodeProps) {
  const healthClass = `project-node--${project.health_status}`;

  return (
    <button
      type="button"
      className={`project-node ${healthClass}`}
      onClick={() => onClick(project)}
    >
      <PulseIndicator />
      <span className="project-node__title">{project.title}</span>
    </button>
  );
}
