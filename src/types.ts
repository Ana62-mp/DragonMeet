export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'mon', label: 'Lunes', short: 'Lun' },
  { key: 'tue', label: 'Martes', short: 'Mar' },
  { key: 'wed', label: 'Miércoles', short: 'Mié' },
  { key: 'thu', label: 'Jueves', short: 'Jue' },
  { key: 'fri', label: 'Viernes', short: 'Vie' },
];

export const TIME_START = 7;
export const TIME_END = 20;
export const HOUR_HEIGHT = 56;

export interface Course {
  id: string;
  name: string;
  day: DayKey;
  start: number;
  end: number;
  building: string;
  color: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  career: string;
  semester: number;
  avatarColor: string;
  color: string;
  courses: Course[];
  locationZone?: string;
  shareLocation: boolean;
  shareSchedule: boolean;
}

export interface Friendship {
  id: string;
  fromId: string;
  toId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export type Screen = 'home' | 'schedule' | 'match' | 'map' | 'profile' | 'friends';

export interface AppState {
  isLoggedIn: boolean;
  currentUserId: string;
  students: Student[];
  friendships: Friendship[];
}
