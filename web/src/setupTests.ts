// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Browser APIs
Object.defineProperty(window, 'navigator', {
  value: {
    serviceWorker: {
      register: jest.fn(),
      ready: Promise.resolve({
        active: { postMessage: jest.fn() },
        waiting: null,
        onupdatefound: null,
      }),
    },
    permissions: {
      query: jest.fn().mockResolvedValue({ state: 'granted' }),
    },
  },
  writable: true,
});

Object.defineProperty(window, 'Notification', {
  value: {
    requestPermission: jest.fn().mockResolvedValue('granted'),
    permission: 'granted',
  },
  writable: true,
});

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock shared services
jest.mock('../../shared/services/analytics', () => ({
  AnalyticsService: {
    trackEvent: jest.fn(),
    trackPageView: jest.fn(),
  },
}));

jest.mock('../../shared/utils/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../shared/services/api', () => ({
  HttpApiClient: class {
    get = jest.fn();
    post = jest.fn();
    put = jest.fn();
    delete = jest.fn();
  },
}));