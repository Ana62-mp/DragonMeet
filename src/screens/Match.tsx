import { useState, useMemo } from 'react';
import {
  CalendarHeart,
  Check,
  X,
  Share2,
  Clock,
  Filter,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/context';
import { Avatar, Card, Badge, EmptyState, PrimaryButton } from '@/components/ui';
import {
  computeMatchSlots,
  mergeConsecutiveSlots,
  formatTime,
  formatDuration,
  type MatchSlot,
} from '@/utils/schedule';
import { DAYS, TIME_START, TIME_END, HOUR_HEIGHT, type DayKey } from '@/types';

type FilterType = 'all-free' | 'partial' | 'all';

export function MatchScreen() {
  const {
    currentUser,
    getFriends,
    selectedMatchIds,
    toggleMatchSelection,
    clearMatchSelection,
    currentDay,
    setCurrentDay,
    getStudentById,
    showToast,
  } = useApp();

  const friends = getFriends();
  const [filter, setFilter] = useState<FilterType>('all-free');
  const [showFilters, setShowFilters] = useState(false);
  const [showShare, setShowShare] = useState<MatchSlot | null>(null);

  const selectedStudents = useMemo(
    () => [currentUser, ...selectedMatchIds.map((id) => getStudentById(id)).filter(Boolean)],
    [currentUser, selectedMatchIds, getStudentById]
  );

  const matchSlots = useMemo(() => {
    if (selectedMatchIds.length === 0) return [];
    const slots = computeMatchSlots(selectedStudents as typeof selectedStudents, currentDay);
    return mergeConsecutiveSlots(slots);
  }, [selectedStudents, currentDay, selectedMatchIds.length]);

  const filteredSlots = useMemo(() => {
    if (filter === 'all') return matchSlots;
    if (filter === 'all-free') return matchSlots.filter((s) => s.status === 'all-free' && s.duration >= 0.25);
    if (filter === 'partial') return matchSlots.filter((s) => s.status === 'partial' && s.duration >= 0.25);
    return matchSlots;
  }, [matchSlots, filter]);

  const totalGridHeight = (TIME_END - TIME_START) * HOUR_HEIGHT;

  const handleShare = (slot: MatchSlot) => {
    setShowShare(slot);
    showToast('Invitación simulada enviada', 'success');
    setTimeout(() => setShowShare(null), 2000);
  };

  if (selectedMatchIds.length === 0) {
    return (
      <div className="min-h-screen bg-usfq-gray-light pb-24 max-w-md mx-auto animate-fade-in">
        <Header currentDay={currentDay} setCurrentDay={setCurrentDay} />
        <div className="px-5 mt-4">
          <div className="bg-gradient-to-br from-usfq-red to-usfq-red-dark rounded-2xl p-5 text-white text-center mb-4">
            <CalendarHeart size={32} className="mx-auto mb-2" />
            <h2 className="font-bold text-lg">Encuentra tu match</h2>
            <p className="text-sm opacity-90 mt-1">
              Selecciona hasta 5 amigos para comparar horarios y encontrar espacios libres en común
            </p>
          </div>

          {friends.length === 0 ? (
            <EmptyState
              icon={<CalendarHeart size={28} />}
              title="Necesitas amigos para hacer match"
              subtitle="Agrega amigos desde la sección de búsqueda para comparar horarios"
            />
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-usfq-gray uppercase tracking-wide mb-2">
                Selecciona amigos
              </p>
              {friends.map((friend) => {
                const isSelected = selectedMatchIds.includes(friend.id);
                return (
                  <Card
                    key={friend.id}
                    className={`p-3 flex items-center gap-3 transition-all ${
                      isSelected ? 'ring-2 ring-usfq-red' : ''
                    }`}
                    onClick={() => toggleMatchSelection(friend.id)}
                  >
                    <Avatar name={friend.name} color={friend.avatarColor} size="md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-usfq-black text-sm">{friend.name}</h3>
                      <p className="text-xs text-usfq-gray truncate">{friend.career}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-usfq-red' : 'bg-gray-200'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-usfq-gray-light pb-24 max-w-md mx-auto animate-fade-in">
      <Header currentDay={currentDay} setCurrentDay={setCurrentDay} />

      <div className="px-5 mt-4 space-y-4">
        {/* Selected participants */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-usfq-gray uppercase tracking-wide">
              Participantes ({selectedStudents.length})
            </span>
            <button
              onClick={clearMatchSelection}
              className="text-xs text-usfq-red font-medium"
            >
              Limpiar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 bg-usfq-gray-light rounded-full pl-1.5 pr-3 py-1">
                <Avatar name={s.name} color={s.avatarColor} size="sm" />
                <span className="text-xs font-medium text-usfq-black">{s.name}</span>
                {s.id !== currentUser.id && (
                  <button
                    onClick={() => toggleMatchSelection(s.id)}
                    className="text-usfq-gray hover:text-usfq-red"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            {selectedMatchIds.length < 5 && (
              <button
                onClick={() => {}}
                className="flex items-center gap-1 text-xs font-medium text-usfq-red border border-dashed border-usfq-red rounded-full px-3 py-1.5"
              >
                + Agregar
              </button>
            )}
          </div>
        </Card>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-xs font-medium text-usfq-gray bg-white px-3 py-2 rounded-lg border border-gray-200"
          >
            <Filter size={14} />
            {filter === 'all-free' ? 'Todos libres' : filter === 'partial' ? 'Parcial' : 'Todo'}
            <ChevronDown size={12} />
          </button>
        </div>

        {showFilters && (
          <Card className="p-3 flex gap-2 animate-scale-in">
            <FilterChip active={filter === 'all-free'} onClick={() => setFilter('all-free')} label="🟢 Todos libres" />
            <FilterChip active={filter === 'partial'} onClick={() => setFilter('partial')} label="🟡 Parcial" />
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Todo" />
          </Card>
        )}

        {/* Visual comparison grid */}
        <Card className="p-0 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
            <CalendarHeart size={14} className="text-usfq-red" />
            <span className="text-xs font-semibold text-usfq-black">Comparación visual</span>
          </div>
          <div className="relative" style={{ height: totalGridHeight }}>
            {/* Hour lines */}
            {Array.from({ length: (TIME_END - TIME_START) + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-gray-50"
                style={{ top: i * HOUR_HEIGHT }}
              >
                <span className="text-[9px] text-usfq-gray font-medium pl-1.5 -mt-2 bg-white">
                  {formatTime(TIME_START + i)}
                </span>
              </div>
            ))}

            {/* For each participant, show a column */}
            <div className="absolute left-10 right-2 top-0 bottom-0 flex gap-0.5">
              {selectedStudents.map((s) => {
                const dayCourses = s.courses.filter((c) => c.day === currentDay);
                return (
                  <div key={s.id} className="flex-1 relative">
                    {/* Name label at top */}
                    <div className="absolute top-0 left-0 right-0 text-center -mt-7">
                      <span className="text-[9px] font-bold" style={{ color: s.color }}>{s.name}</span>
                    </div>
                    {/* Free background */}
                    <div className="absolute inset-0 bg-usfq-green/30 rounded" />
                    {/* Busy blocks */}
                    {dayCourses.map((course) => (
                      <div
                        key={course.id}
                        className="absolute left-0 right-0 rounded"
                        style={{
                          top: (course.start - TIME_START) * HOUR_HEIGHT,
                          height: (course.end - course.start) * HOUR_HEIGHT - 1,
                          backgroundColor: s.color,
                          opacity: 0.85,
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Match results */}
        <div>
          <h2 className="font-bold text-usfq-black text-sm mb-2 flex items-center gap-1.5">
            <Sparkles size={16} className="text-usfq-red" />
            Coincidencias encontradas ({filteredSlots.length})
          </h2>
          <div className="space-y-3">
            {filteredSlots.length === 0 && (
              <EmptyState
                icon={<Clock size={28} />}
                title="No hay coincidencias con este filtro"
                subtitle="Prueba con otro día o cambia el filtro"
              />
            )}
            {filteredSlots.map((slot, idx) => (
              <MatchCard
                key={idx}
                slot={slot}
                students={selectedStudents}
                onShare={() => handleShare(slot)}
                sharing={showShare === slot}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ currentDay, setCurrentDay }: { currentDay: DayKey; setCurrentDay: (d: DayKey) => void }) {
  return (
    <div className="bg-white px-5 pt-12 pb-4 rounded-b-3xl shadow-sm">
      <h1 className="text-xl font-extrabold text-usfq-black mb-3 flex items-center gap-2">
        <CalendarHeart size={20} className="text-usfq-red" />
        Match de horarios
      </h1>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {DAYS.map((day) => (
          <button
            key={day.key}
            onClick={() => setCurrentDay(day.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentDay === day.key
                ? 'bg-usfq-red text-white'
                : 'bg-usfq-gray-light text-usfq-gray'
            }`}
          >
            {day.short}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchCard({
  slot,
  students,
  onShare,
  sharing,
}: {
  slot: MatchSlot;
  students: { id: string; name: string; avatarColor: string }[];
  onShare: () => void;
  sharing: boolean;
}) {
  const dayLabel = DAYS.find((d) => d.key === slot.day)?.label ?? '';
  const availableStudents = students.filter((s) => slot.available.includes(s.id));
  const unavailableStudents = students.filter((s) => slot.unavailable.includes(s.id));

  const statusConfig = {
    'all-free': {
      bg: 'from-green-500 to-green-600',
      badge: <Badge color="green"><Check size={10} /> Todos libres</Badge>,
      icon: '🎉',
      title: '¡It\'s a Match!',
    },
    'partial': {
      bg: 'from-amber-400 to-amber-500',
      badge: <Badge color="amber">Coincidencia parcial</Badge>,
      icon: '⚡',
      title: 'Coincidencia parcial',
    },
    'all-busy': {
      bg: 'from-red-400 to-red-500',
      badge: <Badge color="red">Todos ocupados</Badge>,
      icon: ' busy',
      title: 'Todos ocupados',
    },
  };

  const cfg = statusConfig[slot.status];

  return (
    <Card className={`p-4 animate-slide-up ${slot.status === 'all-free' ? 'ring-1 ring-green-300' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {cfg.badge}
          </div>
          <p className="font-bold text-usfq-black text-sm">
            {dayLabel} — {formatTime(slot.start)} a {formatTime(slot.end)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-usfq-black">{Math.round(slot.duration * 60)}</p>
          <p className="text-[10px] text-usfq-gray font-medium">min juntos</p>
        </div>
      </div>

      {/* Participants */}
      <div className="space-y-1.5">
        {availableStudents.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <Avatar name={s.name} color={s.avatarColor} size="sm" />
            <span className="text-xs font-medium text-usfq-black flex-1">{s.name}</span>
            <Check size={14} className="text-usfq-green-dark" />
          </div>
        ))}
        {unavailableStudents.map((s) => (
          <div key={s.id} className="flex items-center gap-2 opacity-50">
            <Avatar name={s.name} color={s.avatarColor} size="sm" />
            <span className="text-xs font-medium text-usfq-black flex-1">{s.name}</span>
            <X size={14} className="text-usfq-red" />
          </div>
        ))}
      </div>

      {/* Share button */}
      {slot.status !== 'all-busy' && (
        <button
          onClick={onShare}
          className={`mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all ${
            sharing
              ? 'bg-usfq-green-dark text-white'
              : 'bg-usfq-red-light text-usfq-red hover:bg-red-200'
          }`}
        >
          {sharing ? (
            <><Check size={14} /> ¡Invitación enviada!</>
          ) : (
            <><Share2 size={14} /> Compartir coincidencia</>
          )}
        </button>
      )}
    </Card>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
        active ? 'bg-usfq-red text-white' : 'bg-usfq-gray-light text-usfq-gray'
      }`}
    >
      {label}
    </button>
  );
}
