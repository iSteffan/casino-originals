'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface AppLayoutState {
  sideMenuExpanded: boolean;
  theatreModeActive: boolean;
  effectiveSideMenuExpanded: boolean;
  toggleSideMenu: () => void;
  setTheatreModeActive: (active: boolean) => void;
  registerTheatreExit: (exit: (() => void) | null) => void;
}

const AppLayoutContext = createContext<AppLayoutState | null>(null);

export function AppLayoutProvider({ children }: { children: ReactNode }) {
  const [sideMenuExpanded, setSideMenuExpanded] = useState(true);
  const [theatreModeActive, setTheatreModeActiveState] = useState(false);
  const theatreExitRef = useRef<(() => void) | null>(null);
  const pendingTheatreExitRef = useRef(false);

  const setTheatreModeActive = useCallback((active: boolean) => {
    if (pendingTheatreExitRef.current) {
      if (active) return;
      pendingTheatreExitRef.current = false;
    }
    setTheatreModeActiveState(active);
  }, []);

  const registerTheatreExit = useCallback((exit: (() => void) | null) => {
    theatreExitRef.current = exit;
  }, []);

  const toggleSideMenu = useCallback(() => {
    if (theatreModeActive) {
      pendingTheatreExitRef.current = true;
      setTheatreModeActiveState(false);
      setSideMenuExpanded(true);
      theatreExitRef.current?.();
      return;
    }

    setSideMenuExpanded((current) => !current);
  }, [theatreModeActive]);

  const value = useMemo<AppLayoutState>(
    () => ({
      sideMenuExpanded,
      theatreModeActive,
      effectiveSideMenuExpanded: sideMenuExpanded && !theatreModeActive,
      toggleSideMenu,
      setTheatreModeActive,
      registerTheatreExit,
    }),
    [
      sideMenuExpanded,
      theatreModeActive,
      toggleSideMenu,
      setTheatreModeActive,
      registerTheatreExit,
    ],
  );

  return <AppLayoutContext.Provider value={value}>{children}</AppLayoutContext.Provider>;
}

export function useAppLayoutState(): AppLayoutState {
  const value = useContext(AppLayoutContext);
  if (!value) {
    throw new Error('useAppLayoutState must be used within AppLayoutProvider');
  }
  return value;
}

/** Syncs layout sidebar collapse with a story/game theatreMode flag. */
export function TheatreModeSync({
  theatreMode,
  onExitTheatre,
}: {
  theatreMode: boolean;
  onExitTheatre?: () => void;
}) {
  const { setTheatreModeActive, registerTheatreExit } = useAppLayoutState();

  useEffect(() => {
    setTheatreModeActive(theatreMode);
    return () => setTheatreModeActive(false);
  }, [theatreMode, setTheatreModeActive]);

  useEffect(() => {
    registerTheatreExit(onExitTheatre ?? null);
    return () => registerTheatreExit(null);
  }, [onExitTheatre, registerTheatreExit]);

  return null;
}
