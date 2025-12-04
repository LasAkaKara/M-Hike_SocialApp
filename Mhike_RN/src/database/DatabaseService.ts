import * as SQLite from 'expo-sqlite';
import { Hike, Observation } from '../types';

export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('mhike.db');
      await this.createTables();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Create hikes table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS hikes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          location TEXT NOT NULL,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          length REAL NOT NULL,
          difficulty TEXT NOT NULL,
          parkingAvailable INTEGER NOT NULL,
          privacy TEXT NOT NULL,
          description TEXT,
          latitude REAL,
          longitude REAL,
          cloudId TEXT,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        );
      `);

      // Create observations table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS observations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hikeId INTEGER NOT NULL,
          title TEXT NOT NULL,
          time TEXT NOT NULL,
          comments TEXT,
          imageUri TEXT,
          latitude REAL,
          longitude REAL,
          cloudId TEXT,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          FOREIGN KEY (hikeId) REFERENCES hikes(id) ON DELETE CASCADE
        );
      `);

      // Create indices
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_hikes_date ON hikes(date DESC, time DESC);
        CREATE INDEX IF NOT EXISTS idx_observations_hikeId ON observations(hikeId);
      `);
    } catch (error) {
      console.error('Create tables error:', error);
      throw error;
    }
  }

  // HIKE OPERATIONS

  async createHike(hike: Omit<Hike, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.runAsync(
        `INSERT INTO hikes 
          (name, location, date, time, length, difficulty, parkingAvailable, 
           privacy, description, latitude, longitude, cloudId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hike.name,
          hike.location,
          hike.date,
          hike.time,
          hike.length,
          hike.difficulty,
          hike.parkingAvailable ? 1 : 0,
          hike.privacy,
          hike.description || null,
          hike.latitude || null,
          hike.longitude || null,
          hike.cloudId || null,
          hike.createdAt,
          hike.updatedAt,
        ]
      );

      return result.lastInsertRowid as number;
    } catch (error) {
      console.error('Create hike error:', error);
      throw error;
    }
  }

  async getHikeById(id: number): Promise<Hike | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM hikes WHERE id = ?',
        [id]
      );

      if (!result) {
        return null;
      }

      return this.mapRowToHike(result);
    } catch (error) {
      console.error('Get hike error:', error);
      throw error;
    }
  }

  async getAllHikes(): Promise<Hike[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM hikes ORDER BY date DESC, time DESC'
      );

      return results.map((row) => this.mapRowToHike(row));
    } catch (error) {
      console.error('Get all hikes error:', error);
      throw error;
    }
  }

  async updateHike(hike: Hike): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `UPDATE hikes SET 
          name = ?, location = ?, date = ?, time = ?, length = ?, 
          difficulty = ?, parkingAvailable = ?, privacy = ?, description = ?,
          latitude = ?, longitude = ?, updatedAt = ?
         WHERE id = ?`,
        [
          hike.name,
          hike.location,
          hike.date,
          hike.time,
          hike.length,
          hike.difficulty,
          hike.parkingAvailable ? 1 : 0,
          hike.privacy,
          hike.description || null,
          hike.latitude || null,
          hike.longitude || null,
          hike.updatedAt,
          hike.id,
        ]
      );
    } catch (error) {
      console.error('Update hike error:', error);
      throw error;
    }
  }

  async deleteHike(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Cascade delete handled by FK
      await this.db.runAsync('DELETE FROM hikes WHERE id = ?', [id]);
    } catch (error) {
      console.error('Delete hike error:', error);
      throw error;
    }
  }

  async searchHikesByName(query: string): Promise<Hike[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM hikes WHERE LOWER(name) LIKE ? ORDER BY date DESC, time DESC',
        [`%${query.toLowerCase()}%`]
      );

      return results.map((row) => this.mapRowToHike(row));
    } catch (error) {
      console.error('Search hikes error:', error);
      throw error;
    }
  }

  async filterHikesByMinLength(minLength: number): Promise<Hike[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM hikes WHERE length >= ? ORDER BY date DESC, time DESC',
        [minLength]
      );

      return results.map((row) => this.mapRowToHike(row));
    } catch (error) {
      console.error('Filter hikes by length error:', error);
      throw error;
    }
  }

  async searchHikesWithFilters(
    name?: string,
    location?: string,
    minLength?: number,
    minDate?: string,
    maxDate?: string
  ): Promise<Hike[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      let query = 'SELECT * FROM hikes WHERE 1=1';
      const params: (string | number)[] = [];

      if (name) {
        query += ' AND LOWER(name) LIKE ?';
        params.push(`%${name.toLowerCase()}%`);
      }

      if (location) {
        query += ' AND LOWER(location) LIKE ?';
        params.push(`%${location.toLowerCase()}%`);
      }

      if (minLength !== undefined) {
        query += ' AND length >= ?';
        params.push(minLength);
      }

      if (minDate) {
        query += ' AND date >= ?';
        params.push(minDate);
      }

      if (maxDate) {
        query += ' AND date <= ?';
        params.push(maxDate);
      }

      query += ' ORDER BY date DESC, time DESC';

      const results = await this.db.getAllAsync<any>(query, params);
      return results.map((row) => this.mapRowToHike(row));
    } catch (error) {
      console.error('Search hikes with filters error:', error);
      throw error;
    }
  }

  // OBSERVATION OPERATIONS

  async createObservation(obs: Omit<Observation, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.runAsync(
        `INSERT INTO observations 
          (hikeId, title, time, comments, imageUri, latitude, longitude, cloudId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          obs.hikeId,
          obs.title,
          obs.time,
          obs.comments || null,
          obs.imageUri || null,
          obs.latitude || null,
          obs.longitude || null,
          obs.cloudId || null,
          obs.createdAt,
          obs.updatedAt,
        ]
      );

      return result.lastInsertRowId as number;
    } catch (error) {
      console.error('Create observation error:', error);
      throw error;
    }
  }

  async getObservationsByHikeId(hikeId: number): Promise<Observation[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM observations WHERE hikeId = ? ORDER BY time ASC',
        [hikeId]
      );

      return results.map((row) => this.mapRowToObservation(row));
    } catch (error) {
      console.error('Get observations error:', error);
      throw error;
    }
  }

  async updateObservation(obs: Observation): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `UPDATE observations SET 
          title = ?, time = ?, comments = ?, imageUri = ?, 
          latitude = ?, longitude = ?, updatedAt = ?
         WHERE id = ?`,
        [
          obs.title,
          obs.time,
          obs.comments || null,
          obs.imageUri || null,
          obs.latitude || null,
          obs.longitude || null,
          obs.updatedAt,
          obs.id,
        ]
      );
    } catch (error) {
      console.error('Update observation error:', error);
      throw error;
    }
  }

  async deleteObservation(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM observations WHERE id = ?', [id]);
    } catch (error) {
      console.error('Delete observation error:', error);
      throw error;
    }
  }

  async deleteAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.execAsync('DELETE FROM observations; DELETE FROM hikes;');
    } catch (error) {
      console.error('Delete all data error:', error);
      throw error;
    }
  }

  // HELPERS

  private mapRowToHike(row: any): Hike {
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      date: row.date,
      time: row.time,
      length: row.length,
      difficulty: row.difficulty,
      parkingAvailable: row.parkingAvailable === 1,
      privacy: row.privacy,
      description: row.description,
      latitude: row.latitude,
      longitude: row.longitude,
      cloudId: row.cloudId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapRowToObservation(row: any): Observation {
    return {
      id: row.id,
      hikeId: row.hikeId,
      title: row.title,
      time: row.time,
      comments: row.comments,
      imageUri: row.imageUri,
      latitude: row.latitude,
      longitude: row.longitude,
      cloudId: row.cloudId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async closeDatabase(): Promise<void> {
    // expo-sqlite doesn't require explicit closing
    this.db = null;
  }
}
