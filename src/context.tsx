import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Student, Friendship, Screen, DayKey } from './types';
import { MOCK_STUDENTS } from './data';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextValue {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  currentUser: Student;
  students: Student[];
  friendships: Friendship[];
  screen: Screen;
  setScreen: (s: Screen) => void;
  selectedMatchIds: string[];
  toggleMatchSelection: (id: string) => void;
  clearMatchSelection: () => void;
  currentDay: DayKey;
  setCurrentDay: (d: DayKey) => void;
  selectedZone: string;
  setSelectedZone: (z: string) => void;
  sendFriendRequest: (toId: string) => void;
  respondFriendRequest: (id: string, status: 'accepted' | 'rejected') => void;
  removeFriend: (friendId: string) => void;
  getFriends: () => Student[];
  getPendingRequests: () => Friendship[];
  getSentPending: () => Friendship[];
  getStudentById: (id: string) => Student | undefined;
  updateCurrentUser: (patch: Partial<Student>) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'dragon-match-state-v1';

interface PersistedState {
  isLoggedIn: boolean;
  friendships: Friendship[];
  students: Student[];
  shareLocation: boolean;
  shareSchedule: boolean;
  selectedZone: string;
}

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

let toastCounter = 0;

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = loadState();

  const [isLoggedIn, setIsLoggedIn] = useState(persisted?.isLoggedIn ?? false);
  const [friendships, setFriendships] = useState<Friendship[]>(persisted?.friendships ?? [
    {
      id: 'f-init-1',
      fromId: 'mateo',
      toId: 'ana',
      status: 'accepted',
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'f-init-2',
      fromId: 'sofia',
      toId: 'ana',
      status: 'accepted',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'f-init-3',
      fromId: 'diego',
      toId: 'ana',
      status: 'accepted',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'f-init-4',
      fromId: 'valentina',
      toId: 'ana',
      status: 'pending',
      createdAt: Date.now() - 3600000,
    },
  ]);
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [currentDay, setCurrentDay] = useState<DayKey>('mon');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const baseStudents = MOCK_STUDENTS;
  const students: Student[] = baseStudents.map((s) => {
    if (persisted) {
      const saved = persisted.students.find((ps) => ps.id === s.id);
      if (saved) return { ...s, ...saved };
    }
    return s;
  });

  const [selectedZone, setSelectedZoneState] = useState<string>(persisted?.selectedZone ?? '');

  const currentUser = students.find((s) => s.id === 'ana')!;

  useEffect(() => {
    saveState({
      isLoggedIn,
      friendships,
      students,
      shareLocation: currentUser.shareLocation,
      shareSchedule: currentUser.shareSchedule,
      selectedZone,
    });
  }, [isLoggedIn, friendships, students, selectedZone]);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const login = () => {
    setIsLoggedIn(true);
    setScreen('home');
    showToast('¡Bienvenida a Dragon Match!', 'success');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setScreen('home');
    showToast('Sesión cerrada', 'info');
  };

  const toggleMatchSelection = (id: string) => {
    setSelectedMatchIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) {
        showToast('Máximo 5 amigos en un match', 'error');
        return prev;
      }
      return [...prev, id];
    });
  };

  const clearMatchSelection = () => setSelectedMatchIds([]);

  const sendFriendRequest = (toId: string) => {
    const exists = friendships.some(
      (f) =>
        (f.fromId === currentUser.id && f.toId === toId) ||
        (f.fromId === toId && f.toId === currentUser.id)
    );
    if (exists) {
      showToast('Ya existe una solicitud con esta persona', 'error');
      return;
    }
    setFriendships((prev) => [
      ...prev,
      {
        id: `f-${Date.now()}`,
        fromId: currentUser.id,
        toId,
        status: 'pending',
        createdAt: Date.now(),
      },
    ]);
    showToast('Solicitud de amistad enviada', 'success');
  };

  const respondFriendRequest = (id: string, status: 'accepted' | 'rejected') => {
    setFriendships((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status } : f))
    );
    showToast(
      status === 'accepted' ? '¡Ahora son amigos!' : 'Solicitud rechazada',
      status === 'accepted' ? 'success' : 'info'
    );
  };

  const removeFriend = (friendId: string) => {
    setFriendships((prev) =>
      prev.filter(
        (f) =>
          !(
            (f.fromId === currentUser.id && f.toId === friendId) ||
            (f.fromId === friendId && f.toId === currentUser.id)
          )
      )
    );
    showToast('Amistad eliminada', 'info');
  };

  const getFriends = (): Student[] => {
    const friendIds = friendships
      .filter(
        (f) =>
          f.status === 'accepted' &&
          (f.fromId === currentUser.id || f.toId === currentUser.id)
      )
      .map((f) => (f.fromId === currentUser.id ? f.toId : f.fromId));
    return students.filter((s) => friendIds.includes(s.id));
  };

  const getPendingRequests = (): Friendship[] =>
    friendships.filter(
      (f) => f.toId === currentUser.id && f.status === 'pending'
    );

  const getSentPending = (): Friendship[] =>
    friendships.filter(
      (f) => f.fromId === currentUser.id && f.status === 'pending'
    );

  const getStudentById = (id: string) => students.find((s) => s.id === id);

  const updateCurrentUser = (patch: Partial<Student>) => {
    saveState({
      isLoggedIn,
      friendships,
      students: students.map((s) =>
        s.id === currentUser.id ? { ...s, ...patch } : s
      ),
      shareLocation: patch.shareLocation ?? currentUser.shareLocation,
      shareSchedule: patch.shareSchedule ?? currentUser.shareSchedule,
      selectedZone,
    });
    // Force re-render via state update
    setFriendships((prev) => [...prev]);
  };

  const updateStudent = (id: string, patch: Partial<Student>) => {
    saveState({
      isLoggedIn,
      friendships,
      students: students.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      shareLocation: currentUser.shareLocation,
      shareSchedule: currentUser.shareSchedule,
      selectedZone,
    });
    setFriendships((prev) => [...prev]);
  };

  const setSelectedZone = (z: string) => {
    setSelectedZoneState(z);
    if (z) {
      updateCurrentUser({ locationZone: z });
    } else {
      updateCurrentUser({ locationZone: undefined });
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        currentUser,
        students,
        friendships,
        screen,
        setScreen,
        selectedMatchIds,
        toggleMatchSelection,
        clearMatchSelection,
        currentDay,
        setCurrentDay,
        selectedZone,
        setSelectedZone,
        sendFriendRequest,
        respondFriendRequest,
        removeFriend,
        getFriends,
        getPendingRequests,
        getSentPending,
        getStudentById,
        updateCurrentUser,
        updateStudent,
        toasts,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
