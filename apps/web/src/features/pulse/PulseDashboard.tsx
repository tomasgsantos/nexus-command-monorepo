import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Map, { Marker } from 'react-map-gl';
import type { ProjectWithOwner } from '@nexus/api';
import { useRealtimeFeed } from './hooks/use-realtime-feed';
import { usePulseMap, MAPBOX_TOKEN, MAP_STYLE } from './hooks/use-pulse-map';
import { ProjectPanel } from './components/ProjectPanel';
import { KpiCard } from './components/KpiCard';
import { PulseIndicator } from './components/PulseIndicator';
import 'mapbox-gl/dist/mapbox-gl.css';
import './pulse.css';

function computeKpis(projects: ProjectWithOwner[]) {
  const total = projects.length;
  const onTrack = projects.filter((p) => p.health_status === 'on_track').length;
  const atRisk = projects.filter((p) => p.health_status === 'at_risk').length;
  const failing = projects.filter((p) => p.health_status === 'failing').length;
  return { total, onTrack, atRisk, failing };
}

export default function PulseDashboard() {
  const [selectedProject, setSelectedProject] = useState<ProjectWithOwner | null>(null);
  const { projects, loading, error } = useRealtimeFeed();
  const { viewState, onMove } = usePulseMap();

  const handleNodeClick = useCallback((project: ProjectWithOwner) => {
    setSelectedProject(project);
  }, []);

  const kpis = computeKpis(projects);

  if (error) {
    return (
      <div className="pulse-error">
        <p>Failed to load dashboard: {error}</p>
      </div>
    );
  }

  const geoProjects = projects.filter((p) => p.lat != null && p.lng != null);

  return (
    <div className="pulse-root">
      <Map
        {...viewState}
        onMove={onMove}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {geoProjects.map((project) => (
          <Marker
            key={project.id}
            longitude={project.lng!}
            latitude={project.lat!}
            anchor="center"
          >
            <div
              className={`pulse-map-marker pulse-map-marker--${project.health_status}`}
              onClick={(e) => { e.stopPropagation(); handleNodeClick(project); }}
            />
          </Marker>
        ))}
      </Map>

      <motion.header
        className="pulse-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="pulse-header__title-group">
          <PulseIndicator active={!loading} />
          <h1 className="pulse-header__title">The Pulse</h1>
        </div>
      </motion.header>

      <div className="pulse-kpi-bar">
        <KpiCard label="Total Projects" value={kpis.total} index={0} />
        <KpiCard label="On Track" value={kpis.onTrack} secondary={`${kpis.total ? Math.round((kpis.onTrack / kpis.total) * 100) : 0}%`} index={1} />
        <KpiCard label="At Risk" value={kpis.atRisk} index={2} />
        <KpiCard label="Failing" value={kpis.failing} index={3} />
      </div>

      <ProjectPanel project={selectedProject} onClose={() => setSelectedProject(null)} />

      {loading && <div className="pulse-loading">Loading projects&hellip;</div>}
    </div>
  );
}
