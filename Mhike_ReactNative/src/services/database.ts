/**
 * SQLite Database Service
 * Handles all database operations for Hike and Observation entities
 */

import * as SQLite from 'expo-sqlite';
import { Hike, Observation, SearchFilters } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables if they don't exist
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('mhike.db');

    // Create Hike table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS hikes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cloudId TEXT,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        length REAL NOT NULL,
        difficulty TEXT NOT NULL,
        parkingAvailable INTEGER NOT NULL,
        description TEXT,
        privacy TEXT NOT NULL DEFAULT 'Public',
        syncStatus INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        latitude REAL,
        longitude REAL
      );
      
      CREATE TABLE IF NOT EXISTS observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cloudId TEXT,
        hikeId INTEGER NOT NULL,
        title TEXT NOT NULL,
        time TEXT NOT NULL,
        comments TEXT,
        imageUri TEXT,
        cloudImageUrl TEXT,
        latitude REAL,
        longitude REAL,
        status TEXT NOT NULL DEFAULT 'Open',
        confirmations INTEGER NOT NULL DEFAULT 0,
        disputes INTEGER NOT NULL DEFAULT 0,
        syncStatus INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (hikeId) REFERENCES hikes(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_observations_hikeId ON observations(hikeId);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

/**
 * Get database instance
 */
const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
};

// ==================== HIKE OPERATIONS ====================

export const createHike = async (
  hike: Omit<Hike, 'id' | 'createdAt' | 'updatedAt' | 'cloudId' | 'syncStatus'>,
): Promise<Hike> => {
  const db = getDatabase();
  const now = Date.now();

  const result = await db.runAsync(
    `INSERT INTO hikes (
      name, location, date, time, length, difficulty, parkingAvailable,
      description, privacy, syncStatus, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      hike.name,
      hike.location,
      hike.date,
      hike.time,
      hike.length,
      hike.difficulty,
      hike.parkingAvailable ? 1 : 0,
      hike.description || null,
      hike.privacy,
      0,
      now,
      now,
    ],
  );

  const insertedId = (result.lastInsertRowid || result.lastInsertRowId) as number;
  const createdHike = await getHikeById(insertedId);
  if (!createdHike) throw new Error('Failed to retrieve created hike');
  return createdHike;
};

export const getHikeById = async (id: number): Promise<Hike | null> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<any>(
    'SELECT * FROM hikes WHERE id = ?',
    [id],
  );

  if (!result) return null;

  return mapHikeRow(result);
};

export const getAllHikes = async (): Promise<Hike[]> => {
  const db = getDatabase();
  const results = await db.getAllAsync<any>(
    'SELECT * FROM hikes ORDER BY date DESC, time DESC',
  );

  return results.map(mapHikeRow);
};

export const updateHike = async (hike: Hike): Promise<void> => {
  const db = getDatabase();
  const now = Date.now();

  await db.runAsync(
    `UPDATE hikes SET
      name = ?, location = ?, date = ?, time = ?, length = ?,
      difficulty = ?, parkingAvailable = ?, description = ?,
      privacy = ?, updatedAt = ?
    WHERE id = ?`,
    [
      hike.name,
      hike.location,
      hike.date,
      hike.time,
      hike.length,
      hike.difficulty,
      hike.parkingAvailable ? 1 : 0,
      hike.description || null,
      hike.privacy,
      now,
      hike.id,
    ],
  );
};

export const deleteHike = async (id: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM hikes WHERE id = ?', [id]);
};

export const searchHikesByName = async (query: string): Promise<Hike[]> => {
  const db = getDatabase();
  const lowerQuery = `%${query.toLowerCase()}%`;
  const results = await db.getAllAsync<any>(
    'SELECT * FROM hikes WHERE LOWER(name) LIKE ? ORDER BY date DESC, time DESC',
    [lowerQuery],
  );

  return results.map(mapHikeRow);
};

export const searchHikesByLocation = async (location: string): Promise<Hike[]> => {
  const db = getDatabase();
  const lowerLocation = `%${location.toLowerCase()}%`;
  const results = await db.getAllAsync<any>(
    'SELECT * FROM hikes WHERE LOWER(location) LIKE ? ORDER BY date DESC, time DESC',
    [lowerLocation],
  );

  return results.map(mapHikeRow);
};

export const searchHikesByDate = async (date: string): Promise<Hike[]> => {
  const db = getDatabase();
  const results = await db.getAllAsync<any>(
    'SELECT * FROM hikes WHERE date = ? ORDER BY time DESC',
    [date],
  );

  return results.map(mapHikeRow);
};

export const filterHikesByMinLength = async (minLength: number): Promise<Hike[]> => {
  const db = getDatabase();
  const results = await db.getAllAsync<any>(
    'SELECT * FROM hikes WHERE length >= ? ORDER BY date DESC, time DESC',
    [minLength],
  );

  return results.map(mapHikeRow);
};

export const searchHikesWithFilters = async (filters: SearchFilters): Promise<Hike[]> => {
  const db = getDatabase();
  let query = 'SELECT * FROM hikes WHERE 1=1';
  const params: any[] = [];

  if (filters.name && filters.name.trim()) {
    query += ' AND LOWER(name) LIKE ?';
    params.push(`%${filters.name.toLowerCase()}%`);
  }

  if (filters.location && filters.location.trim()) {
    query += ' AND LOWER(location) LIKE ?';
    params.push(`%${filters.location.toLowerCase()}%`);
  }

  if (filters.minLength !== undefined && filters.minLength > 0) {
    query += ' AND length >= ?';
    params.push(filters.minLength);
  }

  if (filters.date && filters.date.trim()) {
    query += ' AND date = ?';
    params.push(filters.date);
  }

  query += ' ORDER BY date DESC, time DESC';

  const results = await db.getAllAsync<any>(query, params);
  return results.map(mapHikeRow);
};

// ==================== OBSERVATION OPERATIONS ====================

export const createObservation = async (
  hikeId: number,
  observation: Omit<
    Observation,
    'id' | 'createdAt' | 'updatedAt' | 'cloudId' | 'syncStatus'
  >,
): Promise<Observation> => {
  const db = getDatabase();
  const now = Date.now();

  console.log('[Database] Creating observation:', {
    hikeId,
    title: observation.title,
    imageUri: observation.imageUri,
  });

  const result = await db.runAsync(
    `INSERT INTO observations (
      hikeId, title, time, comments, imageUri, status, confirmations, disputes,
      syncStatus, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      hikeId,
      observation.title,
      observation.time,
      observation.comments || null,
      observation.imageUri || null,
      observation.status,
      observation.confirmations || 0,
      observation.disputes || 0,
      0,
      now,
      now,
    ],
  );

  console.log('[Database] Insert result:', result);

  const insertedId = (result.lastInsertRowid || result.lastInsertRowId) as number;
  console.log('[Database] Using inserted ID:', insertedId);

  const createdObservation = await getObservationById(insertedId);
  if (!createdObservation) {
    console.log('[Database] Failed to retrieve created observation with ID:', insertedId);
    throw new Error('Failed to retrieve created observation');
  }
  console.log('[Database] Successfully created observation:', createdObservation);
  return createdObservation;
};

export const getObservationById = async (id: number): Promise<Observation | null> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<any>(
    'SELECT * FROM observations WHERE id = ?',
    [id],
  );

  if (!result) return null;
  return mapObservationRow(result);
};

export const getObservationsByHikeId = async (hikeId: number): Promise<Observation[]> => {
  const db = getDatabase();
  const results = await db.getAllAsync<any>(
    'SELECT * FROM observations WHERE hikeId = ? ORDER BY time DESC',
    [hikeId],
  );

  return results.map(mapObservationRow);
};

export const updateObservation = async (observation: Observation): Promise<void> => {
  const db = getDatabase();
  const now = Date.now();

  await db.runAsync(
    `UPDATE observations SET
      title = ?, time = ?, comments = ?, imageUri = ?, status = ?,
      confirmations = ?, disputes = ?, updatedAt = ?
    WHERE id = ?`,
    [
      observation.title,
      observation.time,
      observation.comments || null,
      observation.imageUri || null,
      observation.status,
      observation.confirmations || 0,
      observation.disputes || 0,
      now,
      observation.id,
    ],
  );
};

export const deleteObservation = async (id: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM observations WHERE id = ?', [id]);
};

export const getAllObservations = async (): Promise<Observation[]> => {
  const db = getDatabase();
  const results = await db.getAllAsync<any>(
    'SELECT * FROM observations ORDER BY hikeId DESC, time DESC',
  );

  return results.map(mapObservationRow);
};

// ==================== HELPER FUNCTIONS ====================

const mapHikeRow = (row: any): Hike => ({
  id: row.id,
  cloudId: row.cloudId,
  name: row.name,
  location: row.location,
  date: row.date,
  time: row.time,
  length: row.length,
  difficulty: row.difficulty,
  parkingAvailable: row.parkingAvailable === 1,
  description: row.description,
  privacy: row.privacy,
  syncStatus: row.syncStatus,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  latitude: row.latitude,
  longitude: row.longitude,
});

const mapObservationRow = (row: any): Observation => ({
  id: row.id,
  cloudId: row.cloudId,
  hikeId: row.hikeId,
  title: row.title,
  time: row.time,
  comments: row.comments,
  imageUri: row.imageUri,
  cloudImageUrl: row.cloudImageUrl,
  latitude: row.latitude,
  longitude: row.longitude,
  status: row.status,
  confirmations: row.confirmations,
  disputes: row.disputes,
  syncStatus: row.syncStatus,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

/**
 * Clear all data from database (for development/testing)
 */
export const clearDatabase = async (): Promise<void> => {
  const db = getDatabase();
  await db.execAsync(`
    DELETE FROM observations;
    DELETE FROM hikes;
  `);
};
