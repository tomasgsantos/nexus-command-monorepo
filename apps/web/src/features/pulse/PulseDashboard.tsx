import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Map, { Marker } from 'react-map-gl';
import type { MapLayerMouseEvent } from 'react-map-gl';
import type { ProjectWithOwner, AuthUser } from '@nexus/api';
import { useRealtimeFeed } from './hooks/use-realtime-feed';
import { usePulseMap, MAPBOX_TOKEN, MAP_STYLE } from './hooks/use-pulse-map';
import { useProjectForm } from './hooks/use-project-form';
import { Button, TextHoverAnimation } from '@nexus/ui';
import { ProjectPanel } from './components/ProjectPanel';
import { ProjectFormModal } from './components/ProjectFormModal';
import { RealtimeNotification } from './components/RealtimeNotification';
import { KpiCard } from './components/KpiCard';
import { PulseIndicator } from './components/PulseIndicator';
import 'mapbox-gl/dist/mapbox-gl.css';
import './PulseDashboard.css';

interface PulseDashboardProps {
  user: AuthUser;
}

function computeKpis(projects: ProjectWithOwner[]) {
  const total = projects.length;
  const onTrack = projects.filter((p) => p.health_status === 'on_track').length;
  const atRisk = projects.filter((p) => p.health_status === 'at_risk').length;
  const failing = projects.filter((p) => p.health_status === 'failing').length;
  return { total, onTrack, atRisk, failing };
}

export default function PulseDashboard({ user }: PulseDashboardProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectWithOwner | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { projects, loading, error, refresh, notification, clearNotification } = useRealtimeFeed();
  const { viewState, onMove } = usePulseMap();
  const form = useProjectForm();
  const isAdmin = user.profile.role === 'admin';

  const handleNodeClick = useCallback((project: ProjectWithOwner) => {
    setSelectedProject(project);
  }, []);

  const handleNewProject = useCallback(() => {
    form.initCreate();
    setModalOpen(true);
  }, [form]);

  const handleEditProject = useCallback((project: ProjectWithOwner) => {
    form.initEdit(project);
    setSelectedProject(null);
    setModalOpen(true);
  }, [form]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleSubmitSuccess = useCallback(() => {
    setModalOpen(false);
    refresh();
  }, [refresh]);

  const handleProjectDeleted = useCallback(() => {
    setSelectedProject(null);
    refresh();
  }, [refresh]);

  const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
    if (modalOpen && form.locationMode === 'pick') {
      form.setMapCoordinates(e.lngLat.lat, e.lngLat.lng);
    }
  }, [modalOpen, form]);

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
        onClick={handleMapClick}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        cursor={modalOpen && form.locationMode === 'pick' ? 'crosshair' : undefined}
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

        {modalOpen && form.locationMode === 'pick' && form.fields.lat != null && form.fields.lng != null && (
          <Marker
            longitude={form.fields.lng}
            latitude={form.fields.lat}
            anchor="bottom"
          >
            <div className="pulse-map-marker--pick-preview" />
          </Marker>
        )}
      </Map>

      <RealtimeNotification notification={notification} onDismiss={clearNotification} />

      <motion.header
        className="pulse-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="pulse-header__title-group">
          <PulseIndicator active={!loading} />
          <TextHoverAnimation text='The Pulse' fontSize={28}  />
        </div>

        {isAdmin && (
          <Button onClick={handleNewProject}>
            + New Project
          </Button>
        )}
      </motion.header>

      <div className="pulse-kpi-bar">
        <KpiCard label="Total Projects" value={kpis.total} index={0} />
        <KpiCard label="On Track" value={kpis.onTrack} secondary={`${kpis.total ? Math.round((kpis.onTrack / kpis.total) * 100) : 0}%`} index={1} />
        <KpiCard label="At Risk" value={kpis.atRisk} index={2} />
        <KpiCard label="Failing" value={kpis.failing} index={3} />
      </div>

      <ProjectPanel
        project={selectedProject}
        userRole={user.profile.role}
        onClose={() => setSelectedProject(null)}
        onEdit={handleEditProject}
        onDeleted={handleProjectDeleted}
      />

      {isAdmin && (
        <ProjectFormModal
          open={modalOpen}
          form={form}
          onClose={handleModalClose}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}

      {modalOpen && form.locationMode === 'pick' && (
        <div className="pulse-pick-hint">
          Click anywhere on the map to drop a pin — then confirm in the form
        </div>
      )}

      {loading && <div className="pulse-loading">Loading projects&hellip;</div>}
    </div>
  );
}
