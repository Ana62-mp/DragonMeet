import { CalendarHeart, Shield, Lock } from 'lucide-react';
import { useApp } from '@/context';

export function LoginScreen() {
  const { login } = useApp();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <div className="flex flex-col items-center text-center animate-fade-in">
        {/* Logo */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-usfq-red to-usfq-red-dark flex items-center justify-center shadow-lg">
            <CalendarHeart size={48} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-usfq-black tracking-tight">
          Dragon Match
        </h1>
        <p className="text-usfq-gray text-sm mt-2 font-medium">
          Match your time. Find your people.
        </p>

        <div className="mt-10 mb-8">
          <p className="text-xl font-bold text-usfq-black">
            Tus horarios. Tus amigos. Tu campus.
          </p>
        </div>

        <button
          onClick={login}
          className="w-full bg-usfq-black text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-gray-800 active:scale-[0.98]"
        >
          <svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1h10v10H1z" fill="#F25022"/>
            <path d="M12 1h10v10H12z" fill="#7FBA00"/>
            <path d="M1 12h10v10H1z" fill="#00A4EF"/>
            <path d="M12 12h10v10H12z" fill="#FFB900"/>
          </svg>
          Continuar con Microsoft 365
        </button>

        <p className="text-xs text-usfq-gray mt-4 font-medium">
          Exclusivo para estudiantes USFQ
        </p>

        <div className="flex items-center gap-2 mt-8 text-xs text-usfq-gray">
          <Lock size={14} />
          <span>Tu privacidad siempre está bajo tu control</span>
        </div>

        <div className="flex items-center gap-2 mt-3 text-xs text-usfq-gray">
          <Shield size={14} />
          <span>Autenticación simulada para prototipo</span>
        </div>
      </div>
    </div>
  );
}
