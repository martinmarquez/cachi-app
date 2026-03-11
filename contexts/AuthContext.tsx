import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  token: string | null;
}

const AUTH_URL =
  'https://ep-jolly-glade-akvjb297.neonauth.c-3.us-west-2.aws.neon.tech/neondb/auth';
const TOKEN_KEY = 'cachi_auth_token';
const USER_KEY = 'cachi_user';

// Storage abstraction: SecureStore on native, localStorage on web
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  // On native, browsers don't send Origin automatically, so we add it
  if (Platform.OS !== 'web') {
    headers['Origin'] = 'https://cachi.app';
  }
  return headers;
}

// Get the current origin for callbackURL (required by Better Auth)
function getCallbackURL(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://cachi.app';
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  token: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  async function loadStoredSession() {
    try {
      const storedToken = await storage.getItem(TOKEN_KEY);
      const storedUser = await storage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // No stored session
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const response = await fetch(`${AUTH_URL}/sign-in/email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password, callbackURL: getCallbackURL() }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message ?? 'Error al iniciar sesion');
    }

    const data = await response.json();
    const newToken = data.token ?? data.session?.token ?? data.session?.access_token;
    const newUser: User = {
      id: data.user?.id ?? data.id,
      email: data.user?.email ?? email,
      name: data.user?.name ?? null,
    };

    if (newToken) {
      await storage.setItem(TOKEN_KEY, newToken);
    }
    await storage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  async function signUp(email: string, password: string, name: string) {
    const response = await fetch(`${AUTH_URL}/sign-up/email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, email, password, callbackURL: getCallbackURL() }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = 'Error al crear cuenta';
      try {
        const errorJson = JSON.parse(errorText);
        message = errorJson.message ?? errorJson.error ?? message;
      } catch {}
      throw new Error(message);
    }

    const data = await response.json();
    const newToken = data.token ?? data.session?.token ?? data.session?.access_token;
    const newUser: User = {
      id: data.user?.id ?? data.id,
      email: data.user?.email ?? email,
      name: data.user?.name ?? name,
    };

    if (newToken) {
      await storage.setItem(TOKEN_KEY, newToken);
    }
    await storage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  async function signOut() {
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signOut, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
