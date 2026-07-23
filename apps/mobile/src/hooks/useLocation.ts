import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

const PHOENIX_CENTER = { latitude: 33.4484, longitude: -112.074 };

export function useLocation() {
  const [location, setLocation] = useState(PHOENIX_CENTER);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        if (!cancelled) {
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      } catch (err) {
        // No fix available (simulator with no location set, GPS off, timeout).
        // The Phoenix-metro default already in state is the intended fallback.
        console.warn('[location] unavailable, using Phoenix metro default:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return location;
}
