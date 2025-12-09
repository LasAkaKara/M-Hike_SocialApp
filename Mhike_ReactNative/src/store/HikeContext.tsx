/**
 * Hike Context for state management
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as db from '../services/database';
import { initializeDatabase } from '../services/database';
import { deleteImageFromCache, ensureImageDirectoryExists } from '../services/imageService';
import { Hike, HikeContextType, Observation, SearchFilters } from '../types';

const HikeContext = createContext<HikeContextType | undefined>(undefined);

// Global state to track database initialization
let databaseInitialized = false;
let databaseInitializing = false;
let initializationPromise: Promise<void> | null = null;

export const ensureDatabaseInitialized = async (): Promise<void> => {
  if (databaseInitialized) {
    return;
  }

  if (databaseInitializing && initializationPromise) {
    return initializationPromise;
  }

  databaseInitializing = true;
  initializationPromise = (async () => {
    try {
      await initializeDatabase();
      await ensureImageDirectoryExists();
      databaseInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      databaseInitialized = true; // Mark as initialized even on error
    } finally {
      databaseInitializing = false;
    }
  })();

  return initializationPromise;
};

export const HikeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [observations, setObservations] = useState<{ [hikeId: number]: Observation[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all data on initialization
  useEffect(() => {
    const initAndLoad = async () => {
      await ensureDatabaseInitialized();
      await loadAllData();
    };
    initAndLoad();
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allHikes = await db.getAllHikes();
      setHikes(allHikes);

      const allObservations = await db.getAllObservations();
      const observationsByHike: { [hikeId: number]: Observation[] } = {};

      for (const obs of allObservations) {
        if (!observationsByHike[obs.hikeId]) {
          observationsByHike[obs.hikeId] = [];
        }
        observationsByHike[obs.hikeId].push(obs);
      }

      setObservations(observationsByHike);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addHike = useCallback(
    async (hike: Omit<Hike, 'id' | 'createdAt' | 'updatedAt' | 'cloudId' | 'syncStatus'>) => {
      try {
        setError(null);
        const newHike = await db.createHike(hike);
        setHikes((prev) => [newHike, ...prev]);
        return newHike;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add hike';
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const updateHike = useCallback(async (hike: Hike) => {
    try {
      setError(null);
      await db.updateHike(hike);
      setHikes((prev) =>
        prev.map((h) => (h.id === hike.id ? hike : h)),
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update hike';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteHike = useCallback(async (id: number) => {
    try {
      setError(null);

      // Delete associated images
      const hikeObservations = observations[id] || [];
      for (const obs of hikeObservations) {
        if (obs.imageUri) {
          await deleteImageFromCache(obs.imageUri);
        }
      }

      await db.deleteHike(id);
      setHikes((prev) => prev.filter((h) => h.id !== id));
      setObservations((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete hike';
      setError(errorMessage);
      throw err;
    }
  }, [observations]);

  const getHike = useCallback(
    (id: number) => hikes.find((h) => h.id === id),
    [hikes],
  );

  const searchHikes = useCallback(async (filters: SearchFilters) => {
    try {
      setError(null);
      const results = await db.searchHikesWithFilters(filters);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search hikes';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const addObservation = useCallback(
    async (
      hikeId: number,
      observation: Omit<Observation, 'id' | 'createdAt' | 'updatedAt' | 'cloudId' | 'syncStatus'>,
    ) => {
      try {
        console.log('[HikeContext] addObservation called with:', { hikeId, title: observation.title, imageUri: observation.imageUri });
        setError(null);
        const newObservation = await db.createObservation(hikeId, observation);
        console.log('[HikeContext] addObservation result:', newObservation);

        setObservations((prev) => ({
          ...prev,
          [hikeId]: [...(prev[hikeId] || []), newObservation],
        }));

        return newObservation;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add observation';
        console.log('[HikeContext] addObservation error:', errorMessage);
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const updateObservation = useCallback(async (observation: Observation) => {
    try {
      setError(null);
      await db.updateObservation(observation);

      setObservations((prev) => ({
        ...prev,
        [observation.hikeId]: prev[observation.hikeId].map((obs) =>
          obs.id === observation.id ? observation : obs,
        ),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update observation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteObservation = useCallback(async (id: number, hikeId: number) => {
    try {
      setError(null);

      // Delete image if exists
      const obs = observations[hikeId]?.find((o) => o.id === id);
      if (obs?.imageUri) {
        await deleteImageFromCache(obs.imageUri);
      }

      await db.deleteObservation(id);

      setObservations((prev) => ({
        ...prev,
        [hikeId]: prev[hikeId].filter((obs) => obs.id !== id),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete observation';
      setError(errorMessage);
      throw err;
    }
  }, [observations]);

  const getObservations = useCallback(
    (hikeId: number) => observations[hikeId] || [],
    [observations],
  );

  const value: HikeContextType = {
    hikes,
    observations,
    loading,
    error,
    addHike,
    updateHike,
    deleteHike,
    getHike,
    searchHikes,
    addObservation,
    updateObservation,
    deleteObservation,
    getObservations,
    loadAllData,
  };

  return <HikeContext.Provider value={value}>{children}</HikeContext.Provider>;
};

/**
 * Hook to use the Hike context
 */
export const useHikes = (): HikeContextType => {
  const context = useContext(HikeContext);
  if (!context) {
    throw new Error('useHikes must be used within a HikeProvider');
  }
  return context;
};
