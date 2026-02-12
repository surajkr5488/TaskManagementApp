
import Realm from 'realm';
import {schemas} from './schemas';

let realmInstance: Realm | null = null;

export const initializeRealm = async (): Promise<Realm> => {
  if (realmInstance) {
    return realmInstance;
  }

  try {
    realmInstance = await Realm.open({
      schema: schemas,
      schemaVersion: 1,
      migration: (oldRealm, newRealm) => {

        if (oldRealm.schemaVersion < 1) {

        }
      },
    });
    return realmInstance;
  } catch (error) {
    console.error('Failed to initialize Realm:', error);
    throw error;
  }
};

export const getRealm = (): Realm => {
  if (!realmInstance) {
    throw new Error('Realm not initialized. Call initializeRealm first.');
  }
  return realmInstance;
};

export const closeRealm = (): void => {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
    realmInstance = null;
  }
};

