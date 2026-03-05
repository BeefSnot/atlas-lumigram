import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { firebaseAuth } from '../lib/firebase';

type AuthContextValue = {
  user: User | null;
  isInitializing: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapAuthError(errorCode?: string) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'This email is already in use.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase Authentication settings.';
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not fully configured for this project. In Firebase Console, enable Authentication > Sign-in method > Email/Password and make sure localhost is listed under Authentication > Settings > Authorized domains.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API key. Check your EXPO_PUBLIC_FIREBASE_API_KEY value.';
    default:
      return `Something went wrong. ${errorCode ?? 'Unknown auth error.'}`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setIsInitializing(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isInitializing,
      signInWithEmail: async (email, password) => {
        try {
          await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
        } catch (error) {
          const authError = error as { code?: string; message?: string };

          if (__DEV__) {
            console.error('[Firebase Auth] Sign in failed', authError.code, authError.message);
          }

          const message = mapAuthError(authError.code);
          throw new Error(message);
        }
      },
      registerWithEmail: async (email, password) => {
        try {
          await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
        } catch (error) {
          const authError = error as { code?: string; message?: string };

          if (__DEV__) {
            console.error('[Firebase Auth] Registration failed', authError.code, authError.message);
          }

          const message = mapAuthError(authError.code);
          throw new Error(message);
        }
      },
      logout: async () => {
        await signOut(firebaseAuth);
      },
    }),
    [isInitializing, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
