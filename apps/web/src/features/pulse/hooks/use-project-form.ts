import { useState, useCallback } from 'react';
import type { Project, HealthStatus } from '@nexus/api';
import { reverseGeocode } from '../utils/reverse-geocode';
import { submitProject } from '../utils/submit-project';

export type LocationMode = 'type' | 'pick';

interface FormFields {
  title: string;
  health_status: HealthStatus;
  address: string;
  lat: number | null;
  lng: number | null;
  city: string | null;
  country: string | null;
}

interface FormState {
  fields: FormFields;
  locationMode: LocationMode;
  submitting: boolean;
  error: string | null;
}

const EMPTY_FIELDS: FormFields = {
  title: '',
  health_status: 'on_track',
  address: '',
  lat: null,
  lng: null,
  city: null,
  country: null,
};

export interface UseProjectFormReturn {
  fields: FormFields;
  locationMode: LocationMode;
  submitting: boolean;
  error: string | null;
  editingId: string | null;
  setField: <K extends keyof FormFields>(key: K, value: FormFields[K]) => void;
  setLocationMode: (mode: LocationMode) => void;
  setMapCoordinates: (lat: number, lng: number) => void;
  initCreate: () => void;
  initEdit: (project: Project) => void;
  submit: () => Promise<Project>;
  validate: () => string | null;
}

export function useProjectForm(): UseProjectFormReturn {
  const [state, setState] = useState<FormState>({
    fields: EMPTY_FIELDS,
    locationMode: 'type',
    submitting: false,
    error: null,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const setField = useCallback(<K extends keyof FormFields>(key: K, value: FormFields[K]) => {
    setState((s) => ({ ...s, fields: { ...s.fields, [key]: value }, error: null }));
  }, []);

  const setLocationMode = useCallback((mode: LocationMode) => {
    setState((s) => ({ ...s, locationMode: mode }));
  }, []);

  const setMapCoordinates = useCallback((lat: number, lng: number) => {
    setState((s) => ({
      ...s,
      fields: { ...s.fields, lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` },
    }));
    reverseGeocode(lat, lng).then((result) => {
      if (result.address) {
        setState((s) => ({
          ...s,
          fields: {
            ...s.fields,
            address: result.address!,
            city: result.city,
            country: result.country,
          },
        }));
      }
    });
  }, []);

  const initCreate = useCallback(() => {
    setState({ fields: EMPTY_FIELDS, locationMode: 'type', submitting: false, error: null });
    setEditingId(null);
  }, []);

  const initEdit = useCallback((project: Project) => {
    setState({
      fields: {
        title: project.title,
        health_status: project.health_status,
        address: [project.city, project.country].filter(Boolean).join(', '),
        lat: project.lat,
        lng: project.lng,
        city: project.city,
        country: project.country,
      },
      locationMode: 'type',
      submitting: false,
      error: null,
    });
    setEditingId(project.id);
  }, []);

  function validate(): string | null {
    if (!state.fields.title.trim()) return 'Title is required';
    if (state.locationMode === 'type' && !state.fields.address.trim()) return 'Address is required';
    if (state.locationMode === 'pick' && (state.fields.lat == null || state.fields.lng == null)) {
      return 'Click the map to pick a location';
    }
    return null;
  }

  async function submit(): Promise<Project> {
    const validationError = validate();
    if (validationError) {
      setState((s) => ({ ...s, error: validationError }));
      throw new Error(validationError);
    }

    setState((s) => ({ ...s, submitting: true, error: null }));

    try {
      return await submitProject({
        ...state.fields,
        locationMode: state.locationMode,
        editingId,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setState((s) => ({ ...s, error: msg, submitting: false }));
      throw err;
    }
  }

  return {
    fields: state.fields,
    locationMode: state.locationMode,
    submitting: state.submitting,
    error: state.error,
    editingId,
    setField,
    setLocationMode,
    setMapCoordinates,
    initCreate,
    initEdit,
    submit,
    validate,
  };
}
