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
  city: string | null;
  country: string | null;
  locationMode: 'type' | 'pick';
  editingId: string | null;
}

export async function submitProject(params: SubmitParams): Promise<Project> {
  let { lat, lng, city, country } = params;

  if (params.locationMode === 'type') {
    const geo = await geocodeAddress(params.address);
    lat = geo.lat;
    lng = geo.lng;
    city = geo.city;
    country = geo.country;
  }

  if (params.editingId) {
    const payload: UpdateProjectInput = {
      title: params.title,
      health_status: params.health_status,
      lat,
      lng,
      city,
      country,
    };
    return updateProject(params.editingId, payload);
  }

  const payload: CreateProjectInput = {
    title: params.title,
    health_status: params.health_status,
    lat,
    lng,
    city,
    country,
  };
  return createProject(payload);
}
