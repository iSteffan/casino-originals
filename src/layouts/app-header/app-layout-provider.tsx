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
  mobileMenuOpen: boolean;
  theatreModeActive: boolean;
  /** Height/fill layout; stays true while the sidebar finishes opening on exit. */
  theatreLayoutActive: boolean;
  effectiveSideMenuExpanded: boolean;
  toggleSideMenu: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setTheatreModeActive: (active: boolean) => void;
  registerTheatreExit: (exit: (() => void) | null) => void;
}

const AppLayoutContext = createContext<AppLayoutState | null>(null);

const DESKTOP_SIDEBAR_QUERY = '(width >= 64rem)';
/** Matches `.ds-app-sidebar` width transition (`--ds-duration-slow`). */
const SIDEBAR_WIDTH_TRANSITION_MS = 300;

export function AppLayoutProvider({ children }: { children: ReactNode }) {
  const [sideMenuExpanded, setSideMenuExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theatreModeActive, setTheatreModeActiveState] = useState(false);
  const [theatreLayoutActive, setTheatreLayoutActive] = useState(false);
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

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((current) => !current);
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTheatreLayoutActive(theatreModeActive);
    }, SIDEBAR_WIDTH_TRANSITION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [theatreModeActive]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_SIDEBAR_QUERY);
    const sync = () => {
      if (mediaQuery.matches) setMobileMenuOpen(false);
    };

    sync();
    mediaQuery.addEventListener('change', sync);
    return () => mediaQuery.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const value = useMemo<AppLayoutState>(
    () => ({
      sideMenuExpanded,
      mobileMenuOpen,
      theatreModeActive,
      theatreLayoutActive,
      effectiveSideMenuExpanded: sideMenuExpanded && !theatreModeActive,
      toggleSideMenu,
      toggleMobileMenu,
      closeMobileMenu,
      setTheatreModeActive,
      registerTheatreExit,
    }),
    [
      sideMenuExpanded,
      mobileMenuOpen,
      theatreModeActive,
      theatreLayoutActive,
      toggleSideMenu,
      toggleMobileMenu,
      closeMobileMenu,
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
