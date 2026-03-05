import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

type ExpoFirebaseExtra = {
  firebase?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
};

const firebaseExtra = ((Constants.expoConfig?.extra ?? Constants.manifest2?.extra) as ExpoFirebaseExtra | undefined)?.firebase;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? firebaseExtra?.apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? firebaseExtra?.authDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? firebaseExtra?.projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? firebaseExtra?.storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? firebaseExtra?.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? firebaseExtra?.appId,
};

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const isFirebaseConfigComplete = missingConfigKeys.length === 0;

if (__DEV__) {
  console.log('[Firebase] Runtime config status', {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId ?? null,
    storageBucket: !!firebaseConfig.storageBucket,
    messagingSenderId: !!firebaseConfig.messagingSenderId,
    appId: !!firebaseConfig.appId,
  });
}

if (!isFirebaseConfigComplete) {
  throw new Error(
    `Firebase config is incomplete. Missing: ${missingConfigKeys.join(', ')}. Set EXPO_PUBLIC_FIREBASE_* environment variables and restart Expo.`
  );
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let firebaseAuthInstance;

if (Platform.OS === 'web') {
  firebaseAuthInstance = getAuth(app);
} else {
  try {
    const ReactNativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
    firebaseAuthInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    firebaseAuthInstance = getAuth(app);
  }
}

export const firebaseAuth = firebaseAuthInstance;
export const firebaseDb = getFirestore(app);
export const firebaseStorage = getStorage(app);

const appspotBucket = firebaseConfig.projectId ? `${firebaseConfig.projectId}.appspot.com` : undefined;
const canUseAppspotFallback = !!appspotBucket && appspotBucket !== firebaseConfig.storageBucket;

export const firebaseStorageAppspotFallback = canUseAppspotFallback
  ? getStorage(app, `gs://${appspotBucket}`)
  : null;
