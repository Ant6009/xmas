// Firebase Database Service
// This module provides functions to interact with Firebase Realtime Database

import { database, isConfigured } from './firebase.config';
import { ref, set, get, onValue, off } from 'firebase/database';

const ITEMS_PATH = 'party-items';
const STORAGE_KEY = 'party-items-local';

// Fallback to localStorage when Firebase not configured
const useLocalStorage = !isConfigured;

/**
 * Load items from Firebase or localStorage
 * @returns {Promise<Array>} Array of items
 */
export const loadItems = async () => {
  try {
    if (useLocalStorage) {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }

    const itemsRef = ref(database, ITEMS_PATH);
    const snapshot = await get(itemsRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error loading items:', error);
    throw error;
  }
};

/**
 * Save items to Firebase or localStorage
 * @param {Array} items - Array of items to save
 * @returns {Promise<void>}
 */
export const saveItems = async (items) => {
  try {
    if (useLocalStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return;
    }

    const itemsRef = ref(database, ITEMS_PATH);
    await set(itemsRef, items);
  } catch (error) {
    console.error('Error saving items:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for items
 * @param {Function} callback - Function to call when data changes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToItems = (callback) => {
  if (useLocalStorage) {
    // No real-time updates with localStorage
    return () => {};
  }

  const itemsRef = ref(database, ITEMS_PATH);

  const unsubscribe = onValue(itemsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  }, (error) => {
    console.error('Error in real-time listener:', error);
  });

  // Return cleanup function
  return () => off(itemsRef, 'value', unsubscribe);
};

/**
 * Initialize the database with default items (only if empty)
 * @param {Array} defaultItems - Default items to set
 * @returns {Promise<void>}
 */
export const initializeItems = async (defaultItems) => {
  try {
    if (useLocalStorage) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultItems));
      }
      return;
    }

    const itemsRef = ref(database, ITEMS_PATH);
    const snapshot = await get(itemsRef);

    // Only initialize if database is empty
    if (!snapshot.exists()) {
      await set(itemsRef, defaultItems);
    }
  } catch (error) {
    console.error('Error initializing items:', error);
    throw error;
  }
};

