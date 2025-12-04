export interface Hike {
  id: number;
  name: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  length: number; // km
  difficulty: string; // Easy, Moderate, Hard
  parkingAvailable: boolean;
  privacy: string; // Public, Private
  description?: string;
  latitude?: number;
  longitude?: number;
  cloudId?: string;
  createdAt: number; // timestamp in ms
  updatedAt: number; // timestamp in ms
}

export interface Observation {
  id: number;
  hikeId: number;
  title: string;
  time: string; // HH:mm
  comments?: string;
  imageUri?: string; // local file path or URL
  latitude?: number;
  longitude?: number;
  cloudId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SearchFilters {
  name?: string;
  location?: string;
  minLength?: number;
  minDate?: string;
  maxDate?: string;
}
