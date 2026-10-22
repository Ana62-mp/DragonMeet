import { useMemo } from 'react';
import {
  CalendarHeart,
  Users,
  MapPin,
  Calendar,
  Clock,
  MapPin as PinIcon,
  Building,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context';
import { Avatar, Card, Badge } from '@/components/ui';
import {
  getTodayKey,
  getNextClass,
  countFreeHours,
  getAvailableFriends,
  formatTime,
  formatDuration,
  computeMatchSlots,
  mergeConsecutiveSlots,
} from '@/utils/schedule';
import { DAYS } from '@/types';

export function HomeScreen() {
  const { currentUser, getFriends, setScreen, students, getStudentById } = useApp();
  const today = getTodayKey();
  const friends = getFriends();
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  const nextClass = getNextClass(currentUser, today);
  const freeHours = countFreeHours(currentUser, today);
  const availableFriends = getAvailableFriends(friends, today, currentHour);

  const dateStr = now.toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Find best match: merge consecutive all-free or partial slots where all friends are available
  const bestMatch = useMemo(() => {
    if (friends.length === 0) return null;

    // Use first 3 friends for the highlighted match
    const matchFriends = friends.slice(0, 3);
    const allStudents = [currentUser, ...matchFriends];
    const slots = computeMatchSlots(allStudents, today);
    const merged = mergeConsecutiveSlots(slots);

    const allFree = merged.filter((s) => s.status === 'all-free' && s.duration >= 0.5);
    if (allFree.length > 0) {
      const best = allFree.sort((a, b) => b.duration - a.duration)[0];
      return { slot: best, friends: matchFriends };
    }

    const partial = merged.filter((s) => s.status === 'partial' && s.duration >= 0.5);
    if (partial.length > 0) {
      const best = partial.sort((a, b) => b.available.length - a.available.length || b.duration - a.duration)[0];
      return { slot: best, friends: matchFriends };
    }

    return null;
  }, [friends, currentUser, today]);

  const dayLabel = DAYS.find((d) => d.key === today)?.label ?? '';

  return (
    <div className="min-h-screen bg-usfq-gray-light pb-24 max-w-md mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-usfq-black">
              ¡Hola, {currentUser.name}! <span className="inline-block">👋</span>
            </h1>
            <p className="text-usfq-gray text-sm mt-1 font-medium">
              ¿Con quién hacemos match hoy?
            </p>
          </div>
          <Avatar name={currentUser.name} color={currentUser.avatarColor} size="md" />
        </div>
        <p className="text-xs text-usfq-gray mt-3 capitalize">
          {dateStr}
        </p>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {/* Next class */}
        {nextClass && (
          <Card className="p-4 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-usfq-red-light flex items-center justify-center">
                <Calendar size={16} className="text-usfq-red" />
              </div>
              <span className="text-xs font-semibold text-usfq-gray uppercase tracking-wide">
                Próxima clase
              </span>
            </div>
            <h3 className="font-bold text-usfq-black text-base">{nextClass.name}</h3>
            <div className="flex items-center gap-3 mt-2 text-sm text-usfq-gray">
              <span className="flex items-center gap-1">
                <Clock size={14} /> {formatTime(nextClass.start)} - {formatTime(nextClass.end)}
              </span>
              <span className="flex items-center gap-1">
                <Building size={14} /> {nextClass.building}
              </span>
            </div>
          </Card>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-usfq-green-dark" />
              <span className="text-xs font-semibold text-usfq-gray uppercase">Horas libres</span>
            </div>
            <p className="text-2xl font-extrabold text-usfq-black">
              {formatDuration(freeHours)}
            </p>
            <p className="text-xs text-usfq-gray mt-0.5">{dayLabel}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-usfq-blue" />
              <span className="text-xs font-semibold text-usfq-gray uppercase">Disponibles</span>
            </div>
            <p className="text-2xl font-extrabold text-usfq-black">{availableFriends.length}</p>
            <p className="text-xs text-usfq-gray mt-0.5">amigos libres ahora</p>
          </Card>
        </div>

        {/* Best match highlight */}
        {bestMatch && (
          <Card
            className="p-5 bg-gradient-to-br from-usfq-red to-usfq-red-dark text-white border-0 animate-scale-in"
            onClick={() => setScreen('match')}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} />
              <span className="text-sm font-semibold">¡Tienes un match!</span>
            </div>
            <p className="text-lg font-bold">
              {bestMatch.friends.map((f) => f.name).join(', ')}{' '}
              {bestMatch.slot.status === 'all-free' ? 'están libres contigo' : 'están parcialmente libres'}
            </p>
            <p className="text-sm opacity-90 mt-1">
              de {formatTime(bestMatch.slot.start)} a {formatTime(bestMatch.slot.end)} ({formatDuration(bestMatch.slot.duration)})
            </p>
            <p className="text-sm font-medium mt-2 opacity-90">
              {bestMatch.slot.status === 'all-free' ? '¿Un almuerzo juntos?' : '¿Se reúnen un rato?'}
            </p>
            <div className="flex items-center gap-1 mt-3 text-sm font-semibold">
              Ver detalles <ArrowRight size={16} />
            </div>
          </Card>
        )}

        {/* Available friends */}
        {availableFriends.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-usfq-black text-sm">Amigos disponibles ahora</h2>
              <button onClick={() => setScreen('match')} className="text-xs text-usfq-red font-medium">
                Ver todos
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {availableFriends.map((f) => (
                <div key={f.id} className="flex flex-col items-center gap-1.5 min-w-[64px]">
                  <Avatar name={f.name} color={f.avatarColor} size="md" showStatus isAvailable />
                  <span className="text-xs font-medium text-usfq-black">{f.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main CTA */}
        <button
          onClick={() => setScreen('match')}
          className="w-full bg-usfq-red text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-usfq-red-dark active:scale-[0.98] shadow-md"
        >
          <CalendarHeart size={20} />
          Encontrar Match
        </button>

        {/* Quick access */}
        <div className="grid grid-cols-3 gap-3">
          <QuickAccess icon={<Calendar size={20} />} label="Horarios" onClick={() => setScreen('schedule')} />
          <QuickAccess icon={<Users size={20} />} label="Amigos" onClick={() => setScreen('friends')} />
          <QuickAccess icon={<PinIcon size={20} />} label="Mapa" onClick={() => setScreen('map')} />
        </div>
      </div>
    </div>
  );
}

function QuickAccess({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 bg-white rounded-2xl py-4 shadow-sm border border-gray-100 transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="w-10 h-10 rounded-xl bg-usfq-gray-light flex items-center justify-center text-usfq-red">
        {icon}
      </div>
      <span className="text-xs font-semibold text-usfq-black">{label}</span>
    </button>
  );
}
