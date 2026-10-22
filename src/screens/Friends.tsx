import { useState } from 'react';
import {
  Search,
  UserPlus,
  Check,
  X,
  Clock,
  Trash2,
  Calendar,
  MapPin,
  Mail,
  Lock,
  ShieldOff,
} from 'lucide-react';
import { useApp } from '@/context';
import { Avatar, Card, Badge, EmptyState } from '@/components/ui';
import { isFreeAt, formatTime, getTodayKey } from '@/utils/schedule';

type Tab = 'friends' | 'requests' | 'search';

export function FriendsScreen() {
  const {
    currentUser,
    students,
    getFriends,
    getPendingRequests,
    getSentPending,
    sendFriendRequest,
    respondFriendRequest,
    removeFriend,
    getStudentById,
    setScreen,
    showToast,
  } = useApp();

  const [tab, setTab] = useState<Tab>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const friends = getFriends();
  const pendingRequests = getPendingRequests();
  const sentPending = getSentPending();
  const today = getTodayKey();

  const searchResults = searchQuery.trim()
    ? students.filter(
        (s) =>
          s.id !== currentUser.id &&
          (s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const isFriend = (id: string) =>
    friends.some((f) => f.id === id);
  const isPending = (id: string) =>
    [...pendingRequests, ...sentPending].some(
      (f) => (f.fromId === id || f.toId === id)
    );

  return (
    <div className="min-h-screen bg-usfq-gray-light pb-24 max-w-md mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 rounded-b-3xl shadow-sm">
        <h1 className="text-xl font-extrabold text-usfq-black mb-3">Amigos</h1>
        <div className="flex gap-2">
          <TabButton active={tab === 'friends'} onClick={() => setTab('friends')} label={`Amigos (${friends.length})`} />
          <TabButton active={tab === 'requests'} onClick={() => setTab('requests')} label={`Solicitudes (${pendingRequests.length})`} />
          <TabButton active={tab === 'search'} onClick={() => setTab('search')} label="Buscar" />
        </div>
      </div>

      <div className="px-5 mt-4">
        {/* Friends tab */}
        {tab === 'friends' && (
          <div className="space-y-3 animate-fade-in">
            {friends.length === 0 ? (
              <EmptyState
                icon={<UserPlus size={28} />}
                title="Aún no tienes amigos"
                subtitle="Busca estudiantes por su correo institucional para enviar solicitudes"
              />
            ) : (
              friends.map((friend) => {
                const available = isFreeAt(friend, today, new Date().getHours());
                return (
                  <Card key={friend.id} className="p-4 animate-slide-up">
                    <div className="flex items-start gap-3">
                      <Avatar name={friend.name} color={friend.avatarColor} size="md" showStatus isAvailable={available} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-usfq-black text-sm truncate">{friend.name}</h3>
                          {available ? (
                            <Badge color="green">Libre</Badge>
                          ) : (
                            <Badge color="red">Ocupado</Badge>
                          )}
                        </div>
                        <p className="text-xs text-usfq-gray mt-0.5 truncate">{friend.career}</p>
                        <p className="text-xs text-usfq-gray truncate">{friend.email}</p>

                        {/* Location status */}
                        <div className="mt-2">
                          {friend.shareLocation ? (
                            <Badge color="blue">
                              <MapPin size={10} /> Comparte ubicación
                            </Badge>
                          ) : (
                            <Badge color="gray">
                              <Lock size={10} /> Ubicación privada
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => setScreen('match')}
                            className="flex items-center gap-1 text-xs font-medium text-usfq-red bg-usfq-red-light px-3 py-1.5 rounded-lg transition-colors hover:bg-red-200"
                          >
                            <Calendar size={12} /> Comparar
                          </button>
                          <button
                            onClick={() => {
                              if (friend.shareLocation) {
                                setScreen('map');
                              } else {
                                showToast(`${friend.name} no comparte su ubicación`, 'info');
                              }
                            }}
                            className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                              friend.shareLocation
                                ? 'text-usfq-blue bg-blue-50 hover:bg-blue-100'
                                : 'text-usfq-gray bg-gray-100'
                            }`}
                          >
                            <MapPin size={12} /> Ubicación
                          </button>
                          <button
                            onClick={() => removeFriend(friend.id)}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg transition-colors hover:bg-red-100 hover:text-usfq-red ml-auto"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Requests tab */}
        {tab === 'requests' && (
          <div className="space-y-3 animate-fade-in">
            {pendingRequests.length === 0 && sentPending.length === 0 ? (
              <EmptyState
                icon={<Clock size={28} />}
                title="No hay solicitudes pendientes"
                subtitle="Cuando recibas o envíes solicitudes, aparecerán aquí"
              />
            ) : (
              <>
                {pendingRequests.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-usfq-gray uppercase tracking-wide mb-2">Recibidas</p>
                    {pendingRequests.map((req) => {
                      const fromStudent = getStudentById(req.fromId);
                      if (!fromStudent) return null;
                      return (
                        <Card key={req.id} className="p-4 animate-slide-up">
                          <div className="flex items-center gap-3">
                            <Avatar name={fromStudent.name} color={fromStudent.avatarColor} size="md" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-usfq-black text-sm">{fromStudent.name}</h3>
                              <p className="text-xs text-usfq-gray truncate">{fromStudent.career}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => respondFriendRequest(req.id, 'accepted')}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-white bg-usfq-green-dark py-2 rounded-lg transition-colors hover:bg-green-600"
                            >
                              <Check size={14} /> Aceptar
                            </button>
                            <button
                              onClick={() => respondFriendRequest(req.id, 'rejected')}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-usfq-gray bg-gray-100 py-2 rounded-lg transition-colors hover:bg-gray-200"
                            >
                              <X size={14} /> Rechazar
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                  </>
                )}
                {sentPending.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-usfq-gray uppercase tracking-wide mt-4 mb-2">Enviadas</p>
                    {sentPending.map((req) => {
                      const toStudent = getStudentById(req.toId);
                      if (!toStudent) return null;
                      return (
                        <Card key={req.id} className="p-4 opacity-75">
                          <div className="flex items-center gap-3">
                            <Avatar name={toStudent.name} color={toStudent.avatarColor} size="md" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-usfq-black text-sm">{toStudent.name}</h3>
                              <p className="text-xs text-usfq-gray truncate">{toStudent.email}</p>
                            </div>
                            <Badge color="amber">Pendiente</Badge>
                          </div>
                        </Card>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Search tab */}
        {tab === 'search' && (
          <div className="animate-fade-in">
            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-usfq-gray" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por correo institucional..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-usfq-black placeholder:text-usfq-gray focus:outline-none focus:border-usfq-red transition-colors"
              />
            </div>

            {!searchQuery.trim() && (
              <div className="text-center py-8">
                <Mail size={32} className="text-usfq-gray mx-auto mb-3" />
                <p className="text-sm text-usfq-gray font-medium">
                  Busca estudiantes por correo o nombre
                </p>
                <p className="text-xs text-usfq-gray mt-1">
                  Ejemplo: @est.usfq.edu.ec
                </p>
              </div>
            )}

            <div className="space-y-2">
              {searchResults.map((student) => {
                const friend = isFriend(student.id);
                const pending = isPending(student.id);
                return (
                  <Card key={student.id} className="p-3 flex items-center gap-3">
                    <Avatar name={student.name} color={student.avatarColor} size="md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-usfq-black text-sm">{student.name}</h3>
                      <p className="text-xs text-usfq-gray truncate">{student.email}</p>
                      <p className="text-xs text-usfq-gray truncate">{student.career}</p>
                    </div>
                    {friend ? (
                      <Badge color="green"><Check size={10} /> Amigo</Badge>
                    ) : pending ? (
                      <Badge color="amber">Pendiente</Badge>
                    ) : (
                      <button
                        onClick={() => sendFriendRequest(student.id)}
                        className="flex items-center gap-1 text-xs font-medium text-white bg-usfq-red px-3 py-1.5 rounded-lg transition-colors hover:bg-usfq-red-dark"
                      >
                        <UserPlus size={12} /> Agregar
                      </button>
                    )}
                  </Card>
                );
              })}
              {searchQuery.trim() && searchResults.length === 0 && (
                <EmptyState
                  icon={<Search size={28} />}
                  title="Sin resultados"
                  subtitle="Intenta con otro nombre o correo"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
        active ? 'bg-usfq-red text-white' : 'bg-usfq-gray-light text-usfq-gray'
      }`}
    >
      {label}
    </button>
  );
}
