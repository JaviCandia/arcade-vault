"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface SessionUser {
  name: string;
}

interface UserContextValue {
  user: SessionUser | null;
  login: (user: SessionUser | null) => void;
  signOut: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const STORAGE_KEY = "av_user";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // localStorage unavailable — stay in memory-only state.
    }
  }, []);

  const login = (nextUser: SessionUser | null) => {
    setUser(nextUser);
    try {
      if (nextUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable — degrade to in-memory state only.
    }
  };

  const signOut = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable — nothing to clean up.
    }
  };

  return <UserContext.Provider value={{ user, login, signOut }}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
