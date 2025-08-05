'use client';

import { useEffect, useMemo, useState } from 'react';

const LOCATION_STORAGE_KEY = 'location';
const LOCATION_EXPIRATION_DAYS = 20;
const LOCATION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * LOCATION_EXPIRATION_DAYS;

interface LocationData {
  country: string;
  city: string;
  timeStamp: number;
}

const getStoredLocation = (): LocationData | null => {
  try {
    const storedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!storedLocation) return null;

    const locationData: LocationData = JSON.parse(storedLocation);
    if (Date.now() - locationData.timeStamp > LOCATION_EXPIRATION_TIME) return null;

    return locationData;
  } catch (error) {
    console.error('Error parsing stored location:', error);
    return null;
  }
};

const useLocationTracking = () => {
  const [location, setLocation] = useState<{ country: string; city: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored location first
    const storedLocation = getStoredLocation();
    if (storedLocation) {
      setLocation({
        country: storedLocation.country,
        city: storedLocation.city,
      });
      return;
    }

    // Only fetch if we don't have a valid stored location
    setIsLoading(true);
    setError(null);

    fetch('http://ip-api.com/json/')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const newLocation: LocationData = {
          country: data?.country || 'Unknown',
          city: data?.city || 'Unknown',
          timeStamp: Date.now(),
        };

        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
        setLocation({
          country: newLocation.country,
          city: newLocation.city,
        });
      })
      .catch((error) => {
        console.error('Error fetching location:', error);
        setError('Failed to fetch location');
        setLocation(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // Empty dependency array since we only want to run this once

  return useMemo(() => ({ location, isLoading, error }), [location, isLoading, error]);
};

export default useLocationTracking;
