import {
  createProject,
  updateProject,
  geocodeAddress,
} from '@nexus/api';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  HealthStatus,
} from '@nexus/api';

interface SubmitParams {
  title: string;
  health_status: HealthStatus;
  address: string;
  lat: number | null;
  lng: number | null;
  locationMode: 'type' | 'pick';
  editingId: string | null;
}

export async function submitProject(params: SubmitParams): Promise<Project> {
  let { lat, lng } = params;

  if (params.locationMode === 'type') {
    const geo = await geocodeAddress(params.address);
    lat = geo.lat;
    lng = geo.lng;
  }

  if (params.editingId) {
    const payload: UpdateProjectInput = {
      title: params.title,
      health_status: params.health_status,
      lat,
      lng,
    };
    return updateProject(params.editingId, payload);
  }

  const payload: CreateProjectInput = {
    title: params.title,
    health_status: params.health_status,
    lat,
    lng,
    city: null,
    country: null,
  };
  return createProject(payload);
}
