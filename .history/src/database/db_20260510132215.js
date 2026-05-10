import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

const db = SQLite.openDatabaseAsync('notes.db');

export const initDatabase = async () => {
  const database = await db;
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      username        TEXT    NOT NULL UNIQUE,
      email           TEXT    NOT NULL UNIQUE,
      password_hash   TEXT    NOT NULL,
      created_at      TEXT    NOT NULL
    );
  `);
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

    try {
    await database.execAsync(`ALTER TABLE notes ADD COLUMN drawing TEXT DEFAULT '';`);
    console.log('✅ Colonne drawing ajoutée');
  } catch (e) {
    // L'erreur est normale si la colonne existe déjà — on l'ignore
  }
 
  console.log('✅ Base de données initialisée');
};

export const addNote = async (title, content, drawing = '') => {
  const database = await db;
  const now = new Date().toISOString();
  const result = await database.runAsync(
    'INSERT INTO notes (title, content, drawing, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [title, content, drawing, now, now]
  );
  return result.lastInsertRowId;
};

export const getAllNotes = async () => {
  const database = await db;
  return await database.getAllAsync('SELECT * FROM notes ORDER BY updated_at DESC');
};

export const getNoteById = async (id) => {
  const database = await db;
  return await database.getFirstAsync('SELECT * FROM notes WHERE id = ?', [id]);
};

export const updateNote = async (id, title, content, drawing = '') => {
  const database = await db;
  const now = new Date().toISOString();
  await database.runAsync(
    'UPDATE notes SET title = ?, content = ?, drawing = ?, updated_at = ? WHERE id = ?',
    [title, content, drawing, now, id]
  );
};

export const deleteNote = async (id) => {
  const database = await db;
  await database.runAsync('DELETE FROM notes WHERE id = ?', [id]);
};
