import { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Building, Clock } from 'lucide-react';
import { useApp } from '@/context';
import { Card } from '@/components/ui';
import { DAYS, TIME_START, TIME_END, HOUR_HEIGHT, type DayKey } from '@/types';
import { getCoursesForDay, formatTime, getFreeSlots, formatDuration, getTodayKey } from '@/utils/schedule';

export function ScheduleScreen() {
  const { currentUser } = useApp();
  const [selectedDay, setSelectedDay] = useState<DayKey>(getTodayKey());
  const [syncing, setSyncing] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const courses = getCoursesForDay(currentUser, selectedDay);
  const freeSlots = getFreeSlots(currentUser, selectedDay);
  const totalHours = TIME_END - TIME_START;
  const totalGridHeight = totalHours * HOUR_HEIGHT;

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-usfq-gray-light pb-24 max-w-md mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-extrabold text-usfq-black">Mi horario</h1>
            <p className="text-xs text-usfq-gray mt-0.5">
              Semestra {weekOffset === 0 ? 'actual' : weekOffset > 0 ? `+${weekOffset}` : weekOffset}
            </p>
          </div>
          <button
            onClick={handleSync}
            className="flex items-center gap-1.5 text-xs font-medium text-usfq-gray bg-usfq-gray-light px-3 py-2 rounded-lg transition-colors hover:bg-gray-200"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={18} className="text-usfq-gray" />
          </button>
          <div className="flex gap-1">
            {DAYS.map((day) => (
              <button
                key={day.key}
                onClick={() => setSelectedDay(day.key)}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-all ${
                  selectedDay === day.key
                    ? 'bg-usfq-red text-white'
                    : 'text-usfq-gray hover:bg-gray-100'
                }`}
              >
                <span className="text-[10px] font-medium">{day.short}</span>
                <span className="text-sm font-bold">
                  {getTodayKey() === day.key && weekOffset === 0 ? '•' : day.short.charAt(0)}
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronRight size={18} className="text-usfq-gray" />
          </button>
        </div>
      </div>

      <div className="px-5 mt-4">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-usfq-red" />
            <span className="text-usfq-gray font-medium">Clases</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-usfq-green" />
            <span className="text-usfq-gray font-medium">Libre</span>
          </div>
        </div>

        {/* Timeline */}
        <Card className="p-0 overflow-hidden">
          <div className="relative" style={{ height: totalGridHeight }}>
            {/* Hour lines */}
            {Array.from({ length: totalHours + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-gray-100 flex items-center"
                style={{ top: i * HOUR_HEIGHT }}
              >
                <span className="text-[10px] text-usfq-gray font-medium pl-2 -mt-2 bg-white px-1">
                  {formatTime(TIME_START + i)}
                </span>
              </div>
            ))}

            {/* Free slots background */}
            {freeSlots.map((slot, i) => (
              <div
                key={`free-${i}`}
                className="absolute left-12 right-2 rounded-lg bg-usfq-green/60 border border-usfq-green-dark/20"
                style={{
                  top: (slot.start - TIME_START) * HOUR_HEIGHT + 2,
                  height: slot.duration * HOUR_HEIGHT - 4,
                }}
              >
                {slot.duration >= 0.75 && (
                  <span className="text-[10px] text-green-700 font-medium px-2 py-1">
                    Libre · {formatDuration(slot.duration)}
                  </span>
                )}
              </div>
            ))}

            {/* Courses */}
            {courses.map((course) => (
              <div
                key={course.id}
                className="absolute left-12 right-2 rounded-lg shadow-sm overflow-hidden animate-scale-in"
                style={{
                  top: (course.start - TIME_START) * HOUR_HEIGHT + 2,
                  height: (course.end - course.start) * HOUR_HEIGHT - 4,
                  backgroundColor: course.color,
                }}
              >
                <div className="p-2 text-white h-full flex flex-col">
                  <p className="text-xs font-bold leading-tight line-clamp-2">{course.name}</p>
                  {(course.end - course.start) >= 1 && (
                    <div className="mt-auto flex items-center gap-2 text-[10px] opacity-90">
                      <span className="flex items-center gap-0.5">
                        <Clock size={9} /> {formatTime(course.start)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Building size={9} /> {course.building}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-extrabold text-usfq-black">{courses.length}</p>
            <p className="text-xs text-usfq-gray font-medium mt-0.5">Clases hoy</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-extrabold text-usfq-green-dark">{formatDuration(freeSlots.reduce((s, x) => s + x.duration, 0))}</p>
            <p className="text-xs text-usfq-gray font-medium mt-0.5">Tiempo libre</p>
          </Card>
        </div>

        {/* Course list */}
        <h2 className="font-bold text-usfq-black text-sm mt-5 mb-2">Materias del día</h2>
        <div className="space-y-2">
          {courses.map((course) => (
            <Card key={course.id} className="p-3 flex items-center gap-3">
              <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: course.color }} />
              <div className="flex-1">
                <p className="font-semibold text-sm text-usfq-black">{course.name}</p>
                <p className="text-xs text-usfq-gray mt-0.5">
                  {formatTime(course.start)} - {formatTime(course.end)} · {course.building}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
