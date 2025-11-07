import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { ApiResponse } from '../types';
import { log } from '../utils/logger';

export class ApiClient {
  // Generic get document
  static async getDocument<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      } else {
        return null;
      }
    } catch (error) {
      log.error(`Error getting document from ${collectionName}:`, { error });
      throw error;
    }
  }

  // Generic get collection
  static async getCollection<T>(collectionName: string): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) } as T));
    } catch (error) {
      log.error(`Error getting collection ${collectionName}:`, { error });
      throw error;
    }
  }
  //
  // Generic create document
  static async createDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (error) {
      log.error(`Error creating document in ${collectionName}:`, { error });
      throw error;
    }
  }

  // Generic update document
  static async updateDocument<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      log.error(`Error updating document in ${collectionName}:`, { error });
      throw error;
    }
  }

  // Generic delete document
  static async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      log.error(`Error deleting document from ${collectionName}:`, { error });
      throw error;
    }
  }

  // Paginated query
  static async getPaginatedCollection<T>(
    collectionName: string,
    pageSize: number = 20,
    lastDoc?: QueryDocumentSnapshot<DocumentData>,
    orderByField: string = 'createdAt',
    orderDirection: 'asc' | 'desc' = 'desc'
  ): Promise<{ data: T[]; hasMore: boolean; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      let q = query(
        collection(db, collectionName),
        orderBy(orderByField, orderDirection),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) } as T));
      
      return {
        data,
        hasMore: querySnapshot.docs.length === pageSize,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
      };
    } catch (error) {
      log.error(`Error getting paginated collection ${collectionName}:`, { error });
      throw error;
    }
  }
}

// HTTP API client for external services (Mercado Pago, Melhor Envio)
export class HttpApiClient {
  private static baseURL = process.env.REACT_APP_API_BASE_URL || 'https://api.ogni.com/v1';

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`);
      const data = await response.json();
      return {
        data,
        success: response.ok,
        message: response.ok ? undefined : data.message
      };
    } catch (error) {
      log.error(`HTTP GET error for ${endpoint}:`, { error });
      throw error;
    }
  }

  static async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return {
        data,
        success: response.ok,
        message: response.ok ? undefined : data.message
      };
    } catch (error) {
      log.error(`HTTP POST error for ${endpoint}:`, { error });
      throw error;
    }
  }

  static async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return {
        data,
        success: response.ok,
        message: response.ok ? undefined : data.message
      };
    } catch (error) {
      log.error(`HTTP PUT error for ${endpoint}:`, { error });
      throw error;
    }
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return {
        data,
        success: response.ok,
        message: response.ok ? undefined : data.message
      };
    } catch (error) {
      log.error(`HTTP DELETE error for ${endpoint}:`, { error });
      throw error;
    }
  }
}