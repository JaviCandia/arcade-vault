"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";

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

let cachedUser: SessionUser | null | undefined;
const listeners = new Set<() => void>();

function readUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getSnapshot(): SessionUser | null {
  if (cachedUser === undefined) cachedUser = readUser();
  return cachedUser;
}

function getServerSnapshot(): SessionUser | null {
  return null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function writeUser(next: SessionUser | null) {
  cachedUser = next;
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable — degrade to in-memory state only.
  }
  listeners.forEach((listener) => listener());
}

export function UserProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = useCallback((nextUser: SessionUser | null) => writeUser(nextUser), []);
  const signOut = useCallback(() => writeUser(null), []);

  return <UserContext.Provider value={{ user, login, signOut }}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
