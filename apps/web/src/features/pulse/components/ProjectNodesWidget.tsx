import { useNavigate } from 'react-router-dom';
import Map, { Marker } from 'react-map-gl';
import { useRealtimeFeed } from '../hooks/use-realtime-feed';
import { usePulseMap, MAPBOX_TOKEN, MAP_STYLE } from '../hooks/use-pulse-map';
import { AppRoute } from '../../../constants/routes';
import 'mapbox-gl/dist/mapbox-gl.css';
import './ProjectNodesWidget.css';

export function ProjectNodesWidget() {
  const { projects, loading } = useRealtimeFeed();
  const { viewState, onMove } = usePulseMap();
  const navigate = useNavigate();

  const geoProjects = projects.filter((p) => p.lat != null && p.lng != null);

  return (
    <div className="project-nodes-widget">
      <div className="project-nodes-widget__header">
        <span className="project-nodes-widget__title">Active Project Nodes</span>
        <span className="project-nodes-widget__live-badge">Live Data</span>
      </div>

      <div className="project-nodes-widget__map">
        {!loading && (
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
                  className={`project-nodes-widget__marker project-nodes-widget__marker--${project.health_status}`}
                />
              </Marker>
            ))}
          </Map>
        )}
      </div>

      <button
        type="button"
        className="project-nodes-widget__expand"
        onClick={() => navigate(AppRoute.Map)}
      >
        View Full Map →
      </button>
    </div>
  );
}
