import {
  User,
  Mail,
  BookOpen,
  GraduationCap,
  Calendar,
  MapPin,
  Users,
  Lock,
  LogOut,
  Bell,
  Shield,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/context';
import { Avatar, Card } from '@/components/ui';

export function ProfileScreen() {
  const {
    currentUser,
    updateCurrentUser,
    logout,
    setScreen,
    getFriends,
    getPendingRequests,
    showToast,
  } = useApp();

  const friends = getFriends();
  const pending = getPendingRequests();

  const toggleShareSchedule = () => {
    const newValue = !currentUser.shareSchedule;
    updateCurrentUser({ shareSchedule: newValue });
    showToast(
      newValue ? 'Horario visible para amigos' : 'Horario oculto',
      newValue ? 'success' : 'info'
    );
  };

  const toggleShareLocation = () => {
    const newValue = !currentUser.shareLocation;
    updateCurrentUser({ shareLocation: newValue });
    showToast(
      newValue ? 'Ubicación activada' : 'Ubicación desactivada',
      newValue ? 'success' : 'info'
    );
  };

  return (
    <div className="min-h-screen bg-usfq-gray-light pb-24 max-w-md mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 rounded-b-3xl shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Avatar name={currentUser.name} color={currentUser.avatarColor} size="lg" />
          <h1 className="text-xl font-extrabold text-usfq-black mt-3">{currentUser.name}</h1>
          <p className="text-xs text-usfq-gray mt-1">{currentUser.email}</p>
          <div className="flex gap-2 mt-3">
            <span className="text-xs font-medium text-usfq-gray bg-usfq-gray-light px-3 py-1 rounded-full">
              {currentUser.career}
            </span>
            <span className="text-xs font-medium text-usfq-gray bg-usfq-gray-light px-3 py-1 rounded-full">
              {currentUser.semester}º semestre
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {/* Privacy section */}
        <div>
          <h2 className="text-xs font-semibold text-usfq-gray uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Shield size={14} /> Privacidad
          </h2>
          <Card className="divide-y divide-gray-100">
            <ToggleRow
              icon={<Calendar size={18} />}
              title="Compartir horario con amigos"
              subtitle="Los amigos pueden ver tu calendario académico"
              value={currentUser.shareSchedule}
              onChange={toggleShareSchedule}
            />
            <ToggleRow
              icon={<MapPin size={18} />}
              title="Compartir ubicación general"
              subtitle="Solo visible entre amigos con permiso mutuo"
              value={currentUser.shareLocation}
              onChange={toggleShareLocation}
            />
            <ActionRow
              icon={<Users size={18} />}
              title="Contactos autorizados"
              subtitle={`${friends.length} amigos · ${pending.length} solicitudes`}
              onClick={() => setScreen('friends')}
            />
            <ActionRow
              icon={<Lock size={18} />}
              title="Desactivar ubicación"
              subtitle={currentUser.shareLocation ? 'Actualmente activa' : 'Ya desactivada'}
              onClick={() => {
                if (currentUser.shareLocation) {
                  toggleShareLocation();
                } else {
                  showToast('La ubicación ya está desactivada', 'info');
                }
              }}
            />
          </Card>
        </div>

        {/* Account info */}
        <div>
          <h2 className="text-xs font-semibold text-usfq-gray uppercase tracking-wide mb-2">
            Cuenta
          </h2>
          <Card className="divide-y divide-gray-100">
            <InfoRow icon={<Mail size={18} />} label="Correo" value={currentUser.email} />
            <InfoRow icon={<BookOpen size={18} />} label="Carrera" value={currentUser.career} />
            <InfoRow icon={<GraduationCap size={18} />} label="Semestre" value={`${currentUser.semester}º`} />
          </Card>
        </div>

        {/* Management */}
        <div>
          <h2 className="text-xs font-semibold text-usfq-gray uppercase tracking-wide mb-2">
            Gestión
          </h2>
          <Card className="divide-y divide-gray-100">
            <ActionRow
              icon={<Users size={18} />}
              title="Administrar amistades"
              subtitle="Ver, eliminar y gestionar amigos"
              onClick={() => setScreen('friends')}
            />
            <ActionRow
              icon={<Calendar size={18} />}
              title="Mi horario"
              subtitle="Ver calendario académico"
              onClick={() => setScreen('schedule')}
            />
          </Card>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-usfq-red bg-white py-3.5 rounded-2xl border border-red-200 transition-all hover:bg-usfq-red-light active:scale-[0.98]"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>

        <p className="text-center text-xs text-usfq-gray mt-4">
          Dragon Match v1.0 · Prototipo USFQ
        </p>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className="p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-usfq-gray-light flex items-center justify-center text-usfq-gray shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-usfq-black">{title}</p>
        <p className="text-xs text-usfq-gray mt-0.5">{subtitle}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-all shrink-0 ${
          value ? 'bg-usfq-red' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
            value ? 'left-6' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-usfq-gray-light flex items-center justify-center text-usfq-gray shrink-0">
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-semibold text-sm text-usfq-black">{title}</p>
        <p className="text-xs text-usfq-gray mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight size={18} className="text-usfq-gray shrink-0" />
    </button>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-usfq-gray-light flex items-center justify-center text-usfq-gray shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-usfq-gray font-medium">{label}</p>
        <p className="text-sm text-usfq-black font-semibold mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}
