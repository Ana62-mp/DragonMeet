import { Home, Calendar, CalendarHeart, MapPin, User, Users } from 'lucide-react';
import type { Screen } from '@/types';
import { useApp } from '@/context';

const TABS: { screen: Screen; label: string; icon: typeof Home }[] = [
  { screen: 'home', label: 'Inicio', icon: Home },
  { screen: 'schedule', label: 'Horario', icon: Calendar },
  { screen: 'match', label: 'Match', icon: CalendarHeart },
  { screen: 'map', label: 'Mapa', icon: MapPin },
  { screen: 'profile', label: 'Perfil', icon: User },
];

export const FRIENDS_TAB: { screen: Screen; label: string; icon: typeof Users } = {
  screen: 'friends',
  label: 'Amigos',
  icon: Users,
};

export function BottomNav() {
  const { screen, setScreen } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-1.5 flex justify-around items-center z-50 max-w-md mx-auto">
      {TABS.map((tab) => {
        const isActive = screen === tab.screen;
        const Icon = tab.icon;
        return (
          <button
            key={tab.screen}
            onClick={() => setScreen(tab.screen)}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-2 min-w-[60px] transition-all"
          >
            <Icon
              size={22}
              className={isActive ? 'text-usfq-red' : 'text-usfq-gray'}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={`text-[10px] font-medium ${
                isActive ? 'text-usfq-red' : 'text-usfq-gray'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
