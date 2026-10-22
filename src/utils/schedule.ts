import type { Student, Course, DayKey } from '../types';
import { TIME_START, TIME_END } from '../types';

export interface FreeSlot {
  start: number;
  end: number;
  duration: number;
}

export interface MatchSlot {
  day: DayKey;
  start: number;
  end: number;
  duration: number;
  available: string[];
  unavailable: string[];
  status: 'all-free' | 'partial' | 'all-busy';
}

export function getCoursesForDay(student: Student, day: DayKey): Course[] {
  return student.courses
    .filter((c) => c.day === day)
    .sort((a, b) => a.start - b.start);
}

export function getFreeSlots(student: Student, day: DayKey): FreeSlot[] {
  const courses = getCoursesForDay(student, day);
  const slots: FreeSlot[] = [];
  let cursor = TIME_START;

  for (const course of courses) {
    if (course.start > cursor) {
      slots.push({ start: cursor, end: course.start, duration: course.start - cursor });
    }
    cursor = Math.max(cursor, course.end);
  }

  if (cursor < TIME_END) {
    slots.push({ start: cursor, end: TIME_END, duration: TIME_END - cursor });
  }

  return slots;
}

export function isFreeAt(student: Student, day: DayKey, time: number): boolean {
  return !student.courses.some(
    (c) => c.day === day && time >= c.start && time < c.end
  );
}

export function getBusyIntervals(
  students: Student[],
  day: DayKey
): { start: number; end: number }[] {
  const points = new Set<number>();
  students.forEach((s) => {
    s.courses
      .filter((c) => c.day === day)
      .forEach((c) => {
        points.add(c.start);
        points.add(c.end);
      });
  });
  points.add(TIME_START);
  points.add(TIME_END);

  const sorted = Array.from(points).sort((a, b) => a - b);
  const intervals: { start: number; end: number }[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    intervals.push({ start: sorted[i], end: sorted[i + 1] });
  }

  return intervals;
}

export function computeMatchSlots(
  students: Student[],
  day: DayKey
): MatchSlot[] {
  const intervals = getBusyIntervals(students, day);
  const slots: MatchSlot[] = [];

  for (const interval of intervals) {
    const mid = (interval.start + interval.end) / 2;
    const available: string[] = [];
    const unavailable: string[] = [];

    for (const student of students) {
      if (isFreeAt(student, day, mid)) {
        available.push(student.id);
      } else {
        unavailable.push(student.id);
      }
    }

    const status: MatchSlot['status'] =
      available.length === students.length
        ? 'all-free'
        : available.length === 0
        ? 'all-busy'
        : 'partial';

    slots.push({
      day,
      start: interval.start,
      end: interval.end,
      duration: interval.end - interval.start,
      available,
      unavailable,
      status,
    });
  }

  return slots;
}

export function mergeConsecutiveSlots(slots: MatchSlot[]): MatchSlot[] {
  if (slots.length === 0) return [];
  const merged: MatchSlot[] = [slots[0]];

  for (let i = 1; i < slots.length; i++) {
    const last = merged[merged.length - 1];
    const cur = slots[i];

    if (
      last.end === cur.start &&
      last.status === cur.status &&
      last.available.length === cur.available.length &&
      last.available.every((a) => cur.available.includes(a))
    ) {
      merged[merged.length - 1] = {
        ...last,
        end: cur.end,
        duration: cur.end - last.start,
      };
    } else {
      merged.push(cur);
    }
  }

  return merged;
}

export function formatTime(time: number): string {
  const h = Math.floor(time);
  const m = Math.round((time - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function formatDuration(hours: number): string {
  const mins = Math.round(hours * 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export function getTodayKey(): DayKey {
  const jsDay = new Date().getDay();
  const map: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const day = map[jsDay];
  if (day === 'sat' || day === 'sun') return 'mon';
  return day;
}

export function getNextClass(student: Student, day: DayKey): Course | null {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const courses = getCoursesForDay(student, day);
  const isToday = getTodayKey() === day;

  if (isToday) {
    const upcoming = courses.filter((c) => c.start > currentHour);
    if (upcoming.length > 0) return upcoming[0];
  }

  return courses.length > 0 ? courses[0] : null;
}

export function countFreeHours(student: Student, day: DayKey): number {
  return getFreeSlots(student, day).reduce((sum, s) => sum + s.duration, 0);
}

export function getAvailableFriends(
  friends: Student[],
  day: DayKey,
  currentTime: number
): Student[] {
  return friends.filter((f) => isFreeAt(f, day, currentTime));
}
