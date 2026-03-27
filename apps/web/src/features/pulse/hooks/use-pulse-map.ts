import { useState, useCallback } from 'react';
import type { ViewState } from 'react-map-gl';

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? '';
export const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

const DEFAULT_VIEW: ViewState = {
  longitude: -98.5,
  latitude: 39.8,
  zoom: 3.5,
  bearing: 0,
  pitch: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
};

export function usePulseMap() {
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW);

  const onMove = useCallback((evt: { viewState: ViewState }) => {
    setViewState(evt.viewState);
  }, []);

  return { viewState, onMove };
}
