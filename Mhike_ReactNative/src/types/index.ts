/**
 * Type definitions for M-Hike application
 */

export interface Hike {
  id: number;
  cloudId: string | null;
  name: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  length: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  parkingAvailable: boolean;
  description?: string;
  privacy: 'Public' | 'Private';
  syncStatus: number; // 0 = local only, 1 = synced
  createdAt: number;
  updatedAt: number;
  latitude?: number;
  longitude?: number;
}

export interface Observation {
  id: number;
  cloudId: string | null;
  hikeId: number;
  title: string;
  time: string; // HH:mm
  comments?: string;
  imageUri: string | null;
  cloudImageUrl: string | null;
  latitude?: number;
  longitude?: number;
  status: 'Open' | 'Verified' | 'Disputed';
  confirmations: number;
  disputes: number;
  syncStatus: number; // 0 = local only, 1 = synced
  createdAt: number;
  updatedAt: number;
}

export interface SearchFilters {
  name?: string;
  location?: string;
  minLength?: number;
  date?: string; // YYYY-MM-DD
}

export interface HikeContextType {
  hikes: Hike[];
  observations: { [hikeId: number]: Observation[] };
  loading: boolean;
  error: string | null;
  addHike: (hike: Omit<Hike, 'id' | 'createdAt' | 'updatedAt' | 'cloudId' | 'syncStatus'>) => Promise<Hike>;
  updateHike: (hike: Hike) => Promise<void>;
  deleteHike: (id: number) => Promise<void>;
  getHike: (id: number) => Hike | undefined;
  searchHikes: (filters: SearchFilters) => Promise<Hike[]>;
  addObservation: (hikeId: number, observation: Omit<Observation, 'id' | 'createdAt' | 'updatedAt' | 'cloudId' | 'syncStatus'>) => Promise<Observation>;
  updateObservation: (observation: Observation) => Promise<void>;
  deleteObservation: (id: number, hikeId: number) => Promise<void>;
  getObservations: (hikeId: number) => Observation[];
  loadAllData: () => Promise<void>;
}
