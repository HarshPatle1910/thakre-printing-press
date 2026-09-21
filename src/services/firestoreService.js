import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Generic Firestore CRUD service.
 * All methods operate on the shared db instance.
 */
const firestoreService = {
  // --- Single Document ---
  async getDocument(collectionName, docId) {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id };
    }
    return null;
  },

  async setDocument(collectionName, docId, data, merge = true) {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge });
    return { ...data, id: docId };
  },

  async updateDocument(collectionName, docId, data) {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    return { ...data, id: docId };
  },

  async deleteDocument(collectionName, docId) {
    if (!docId) {
      throw new Error(`deleteDocument requires docId, received: ${docId}`);
    }
    const cleanId = String(docId).trim();
    const docRef = doc(db, collectionName, cleanId);
    await deleteDoc(docRef);
    return true;
  },

  // --- Collection ---
  async getCollection(collectionName, constraints = []) {
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
  },

  async addDocument(collectionName, data) {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { ...data, id: docRef.id };
  },

  // --- Real-time ---
  subscribeToDocument(collectionName, docId, callback, errorCallback) {
    return onSnapshot(
      doc(db, collectionName, docId),
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ ...docSnap.data(), id: docSnap.id });
        } else {
          callback(null);
        }
      },
      errorCallback
    );
  },

  subscribeToCollection(collectionName, constraints = [], callback, errorCallback) {
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
        callback(items);
      },
      errorCallback
    );
  },

  // --- Batch ---
  async batchUpdate(operations) {
    const batch = writeBatch(db);
    operations.forEach(({ type, collectionName, docId, data }) => {
      const docRef = doc(db, collectionName, docId);
      switch (type) {
        case 'set':
          batch.set(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
          break;
        case 'update':
          batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    });
    await batch.commit();
  },

  // --- Counter ---
  async incrementCounter(collectionName, docId, field, amount = 1) {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { [field]: increment(amount), updatedAt: serverTimestamp() }, { merge: true });
  },

  // --- Helpers ---
  where,
  orderBy,
  limit,
  serverTimestamp,
};

export default firestoreService;
