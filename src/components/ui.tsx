import type { ReactNode } from 'react';
import { Check, Info, AlertCircle } from 'lucide-react';
import { useApp } from '@/context';

export function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-slide-up flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium pointer-events-auto ${
            t.type === 'success'
              ? 'bg-white text-usfq-black border-l-4 border-usfq-green-dark'
              : t.type === 'error'
              ? 'bg-white text-usfq-black border-l-4 border-usfq-red'
              : 'bg-white text-usfq-black border-l-4 border-usfq-gray'
          }`}
        >
          {t.type === 'success' && <Check size={18} className="text-usfq-green-dark" />}
          {t.type === 'info' && <Info size={18} className="text-usfq-gray" />}
          {t.type === 'error' && <AlertCircle size={18} className="text-usfq-red" />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function Avatar({
  name,
  color,
  size = 'md',
  showStatus = false,
  isAvailable = false,
}: {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  isAvailable?: boolean;
}) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  return (
    <div className="relative shrink-0">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shadow-sm`}
        style={{ backgroundColor: color }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      {showStatus && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
            isAvailable ? 'bg-usfq-green-dark' : 'bg-usfq-gray'
          }`}
        />
      )}
    </div>
  );
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className} ${onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}`}
    >
      {children}
    </div>
  );
}

export function Badge({ children, color = 'gray' }: { children: ReactNode; color?: 'green' | 'red' | 'gray' | 'amber' | 'blue' }) {
  const colors = {
    green: 'bg-usfq-green text-green-700',
    red: 'bg-usfq-red-light text-red-700',
    gray: 'bg-gray-100 text-gray-600',
    amber: 'bg-usfq-amber text-amber-700',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-usfq-gray-light flex items-center justify-center mb-4 text-usfq-gray">
        {icon}
      </div>
      <p className="text-usfq-black font-semibold text-base">{title}</p>
      {subtitle && <p className="text-usfq-gray text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

export function PrimaryButton({ children, onClick, className = '', disabled }: { children: ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-usfq-red text-white font-semibold py-3.5 rounded-xl transition-all hover:bg-usfq-red-dark active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 ${className}`}
    >
      {children}
    </button>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}
