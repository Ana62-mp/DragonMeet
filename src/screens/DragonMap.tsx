import { useState } from 'react';
import { MapPin, Lock, Eye, EyeOff, Navigation, X } from 'lucide-react';
import { useApp } from '@/context';
import { Avatar, Card, Badge, EmptyState } from '@/components/ui';
import { ZONES } from '@/data';

export function MapScreen() {
  const {
    currentUser,
    getFriends,
    selectedZone,
    setSelectedZone,
    updateCurrentUser,
    showToast,
  } = useApp();

  const friends = getFriends();
  const [selectedZoneInfo, setSelectedZoneInfo] = useState<string | null>(null);

  const shareLocation = currentUser.shareLocation;

  // Friends who share location and are visible to current user
  // (mutual sharing required — in this prototype, both must have shareLocation=true)
  const visibleFriends = friends.filter(
    (f) => f.shareLocation && currentUser.shareLocation
  );

  const friendsInZone = (zoneId: string) =>
    visibleFriends.filter((f) => f.locationZone === zoneId);

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId);
    const zone = ZONES.find((z) => z.id === zoneId);
    showToast(`Ubicación actual: ${zone?.name}`, 'info');
  };

  const toggleLocationSharing = () => {
    const newValue = !shareLocation;
    updateCurrentUser({ shareLocation: newValue });
    showToast(
      newValue ? 'Ubicación activada' : 'Ubicación desactivada',
      newValue ? 'success' : 'info'
    );
  };

  const zoneInfo = selectedZoneInfo ? ZONES.find((z) => z.id === selectedZoneInfo) : null;
  const friendsInSelectedZone = zoneInfo ? friendsInZone(zoneInfo.id) : [];

  return (
    <div className="min-h-screen bg-usfq-gray-light pb-24 max-w-md mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-usfq-black flex items-center gap-2">
              <MapPin size={20} className="text-usfq-red" />
              Dragon Map
            </h1>
            <p className="text-xs text-usfq-gray mt-0.5">Campus USFQ Cumbayá</p>
          </div>
          <button
            onClick={toggleLocationSharing}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all ${
              shareLocation
                ? 'bg-usfq-green text-green-700'
                : 'bg-usfq-gray-light text-usfq-gray'
            }`}
          >
            {shareLocation ? <Eye size={14} /> : <EyeOff size={14} />}
            {shareLocation ? 'Compartiendo' : 'Privado'}
          </button>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {/* Privacy notice */}
        {!shareLocation && (
          <Card className="p-3 flex items-start gap-2 bg-amber-50 border-amber-200">
            <Lock size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 font-medium">
              Tu ubicación está desactivada. Actívala para que tus amigos puedan verte en el mapa. Solo visible entre amigos con permiso mutuo.
            </p>
          </Card>
        )}

        {/* Map */}
        <Card className="p-0 overflow-hidden">
          <div className="relative bg-gradient-to-br from-green-50 to-blue-50" style={{ aspectRatio: '1 / 1' }}>
            {/* SVG schematic campus map */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Background paths */}
              <rect x="0" y="0" width="100" height="100" fill="#f0fdf4" />
              {/* Green areas */}
              <ellipse cx="45" cy="52" rx="12" ry="10" fill="#dcfce7" />
              <ellipse cx="60" cy="70" rx="10" ry="8" fill="#dcfce7" />
              {/* Paths */}
              <line x1="10" y1="50" x2="90" y2="50" stroke="#d1d5db" strokeWidth="0.8" strokeDasharray="2 1" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="#d1d5db" strokeWidth="0.8" strokeDasharray="2 1" />

              {/* Zones */}
              {ZONES.map((zone) => {
                const friendsHere = friendsInZone(zone.id);
                const isUserHere = selectedZone === zone.id;
                const isSelected = selectedZoneInfo === zone.id;
                return (
                  <g
                    key={zone.id}
                    onClick={() => setSelectedZoneInfo(zone.id)}
                    className="cursor-pointer"
                  >
                    {/* Building block */}
                    <rect
                      x={zone.x - 7}
                      y={zone.y - 5}
                      width="14"
                      height="10"
                      rx="2"
                      fill={isUserHere ? '#E11B22' : isSelected ? '#FDE8E8' : '#ffffff'}
                      stroke={isUserHere ? '#E11B22' : '#d1d5db'}
                      strokeWidth="0.5"
                      className="transition-all"
                    />
                    {/* Label */}
                    <text
                      x={zone.x}
                      y={zone.y + 1}
                      textAnchor="middle"
                      fontSize="2.5"
                      fill={isUserHere ? '#ffffff' : '#4b5563'}
                      fontWeight="600"
                    >
                      {zone.name.length > 12 ? zone.name.substring(0, 10) + '...' : zone.name}
                    </text>
                    {/* Friend indicators */}
                    {friendsHere.map((f, i) => (
                      <circle
                        key={f.id}
                        cx={zone.x - 3 + i * 3}
                        cy={zone.y - 3}
                        r="1.8"
                        fill={f.avatarColor}
                        stroke="#fff"
                        strokeWidth="0.5"
                      />
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* Compass */}
            <div className="absolute top-3 right-3 bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
              <Navigation size={14} className="text-usfq-gray" />
            </div>
          </div>
        </Card>

        {/* Zone selector */}
        <Card className="p-4">
          <h3 className="text-xs font-semibold text-usfq-gray uppercase tracking-wide mb-3">
            Mi ubicación (manual)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => handleZoneSelect(zone.id)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all ${
                  selectedZone === zone.id
                    ? 'bg-usfq-red text-white'
                    : 'bg-usfq-gray-light text-usfq-black hover:bg-gray-200'
                }`}
              >
                <MapPin size={12} />
                {zone.name}
              </button>
            ))}
          </div>
          {selectedZone && (
            <button
              onClick={() => {
                setSelectedZone('');
                showToast('Ubicación eliminada', 'info');
              }}
              className="mt-3 text-xs text-usfq-red font-medium flex items-center gap-1"
            >
              <X size={12} /> Dejar de compartir mi zona
            </button>
          )}
        </Card>

        {/* Friends on map */}
        <div>
          <h2 className="font-bold text-usfq-black text-sm mb-2">Amigos en el campus</h2>
          {visibleFriends.length === 0 ? (
            <Card className="p-4">
              {shareLocation ? (
                <p className="text-sm text-usfq-gray text-center">
                  Ningún amigo está compartiendo su ubicación ahora mismo
                </p>
              ) : (
                <p className="text-sm text-usfq-gray text-center">
                  Activa tu ubicación para ver dónde están tus amigos
                </p>
              )}
            </Card>
          ) : (
            <div className="space-y-2">
              {visibleFriends.map((friend) => {
                const zone = ZONES.find((z) => z.id === friend.locationZone);
                return (
                  <Card key={friend.id} className="p-3 flex items-center gap-3">
                    <Avatar name={friend.name} color={friend.avatarColor} size="md" />
                    <div className="flex-1">
                      <h3 className="font-bold text-usfq-black text-sm">{friend.name}</h3>
                      <p className="text-xs text-usfq-gray flex items-center gap-1">
                        <MapPin size={10} />
                        {zone ? zone.name : 'Ubicación no disponible'}
                      </p>
                    </div>
                    <Badge color="green">En línea</Badge>
                  </Card>
                );
              })}
              {/* Friends not sharing */}
              {friends.filter((f) => !f.shareLocation).map((friend) => (
                <Card key={friend.id} className="p-3 flex items-center gap-3 opacity-60">
                  <Avatar name={friend.name} color={friend.avatarColor} size="md" />
                  <div className="flex-1">
                    <h3 className="font-bold text-usfq-black text-sm">{friend.name}</h3>
                    <p className="text-xs text-usfq-gray flex items-center gap-1">
                      <Lock size={10} /> Ubicación privada
                    </p>
                  </div>
                  <Badge color="gray">Privado</Badge>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zone info modal */}
      {zoneInfo && (
        <div
          className="fixed inset-0 bg-black/30 z-[60] flex items-end justify-center"
          onClick={() => setSelectedZoneInfo(null)}
        >
          <Card className="w-full max-w-md rounded-b-none p-5 animate-slide-up" >
            <div className="flex items-center justify-between mb-3" onClick={(e) => e.stopPropagation()}>
              <div>
                <h3 className="font-bold text-usfq-black text-lg">{zoneInfo.name}</h3>
                <p className="text-xs text-usfq-gray">Campus USFQ Cumbayá</p>
              </div>
              <button onClick={() => setSelectedZoneInfo(null)} className="p-1">
                <X size={20} className="text-usfq-gray" />
              </button>
            </div>

            {friendsInSelectedZone.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-usfq-gray uppercase">Amigos aquí</p>
                {friendsInSelectedZone.map((f) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <Avatar name={f.name} color={f.avatarColor} size="sm" />
                    <span className="text-sm font-medium text-usfq-black">{f.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-usfq-gray">No hay amigos compartiendo ubicación en esta zona</p>
            )}

            <button
              onClick={() => {
                handleZoneSelect(zoneInfo.id);
                setSelectedZoneInfo(null);
              }}
              className="mt-4 w-full bg-usfq-red text-white text-sm font-semibold py-2.5 rounded-lg transition-colors hover:bg-usfq-red-dark"
            >
              Estoy aquí
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}
