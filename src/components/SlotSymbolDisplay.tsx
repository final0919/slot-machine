import React from 'react';
import { 
  Skull, 
  Eye, 
  Brain, 
  FlaskConical, 
  BookOpen, 
  Flame, 
  Key, 
  Hourglass, 
  Gem, 
  Ghost 
} from 'lucide-react';

interface SlotSymbolDisplayProps {
  id: string;
  size?: number;
  className?: string;
  key?: React.Key;
}

export default function SlotSymbolDisplay({ id, size = 32, className = '' }: SlotSymbolDisplayProps) {
  // Configured colors & custom visual containers to make them highly aesthetic
  const getSymbolConfig = (symbolId: string) => {
    switch (symbolId) {
      case 'skull':
        return {
          icon: Skull,
          bgGradient: 'from-red-950/80 via-red-900/40 to-stone-950',
          borderColor: 'border-red-500/40',
          iconColor: 'text-red-500',
          glowColor: 'shadow-[0_0_20px_rgba(239,68,68,0.45)]'
        };
      case 'eye':
        return {
          icon: Eye,
          bgGradient: 'from-purple-950/80 via-purple-900/40 to-stone-950',
          borderColor: 'border-purple-500/40',
          iconColor: 'text-purple-400',
          glowColor: 'shadow-[0_0_20px_rgba(168,85,247,0.45)]'
        };
      case 'brain':
        return {
          icon: Brain,
          bgGradient: 'from-pink-950/80 via-pink-900/40 to-stone-950',
          borderColor: 'border-pink-500/40',
          iconColor: 'text-pink-400',
          glowColor: 'shadow-[0_0_20px_rgba(236,72,153,0.45)]'
        };
      case 'poison':
        return {
          icon: FlaskConical,
          bgGradient: 'from-green-950/80 via-green-900/40 to-stone-950',
          borderColor: 'border-green-500/40',
          iconColor: 'text-green-400',
          glowColor: 'shadow-[0_0_20px_rgba(34,197,94,0.45)]'
        };
      case 'book':
        return {
          icon: BookOpen,
          bgGradient: 'from-amber-950/80 via-amber-900/40 to-stone-950',
          borderColor: 'border-amber-500/40',
          iconColor: 'text-amber-400',
          glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.45)]'
        };
      case 'candle':
        return {
          icon: Flame,
          bgGradient: 'from-orange-950/80 via-orange-900/40 to-stone-950',
          borderColor: 'border-orange-500/40',
          iconColor: 'text-orange-500',
          glowColor: 'shadow-[0_0_20px_rgba(249,115,22,0.45)]'
        };
      case 'key':
        return {
          icon: Key,
          bgGradient: 'from-slate-900 via-slate-800/40 to-stone-950',
          borderColor: 'border-slate-500/40',
          iconColor: 'text-slate-400',
          glowColor: 'shadow-[0_0_20px_rgba(148,163,184,0.4)]'
        };
      case 'hourglass':
        return {
          icon: Hourglass,
          bgGradient: 'from-yellow-950/80 via-yellow-900/40 to-stone-950',
          borderColor: 'border-yellow-500/40',
          iconColor: 'text-yellow-400',
          glowColor: 'shadow-[0_0_20px_rgba(234,179,8,0.45)]'
        };
      case 'gem':
        return {
          icon: Gem,
          bgGradient: 'from-teal-950/80 via-teal-900/40 to-stone-950',
          borderColor: 'border-teal-500/40',
          iconColor: 'text-teal-400',
          glowColor: 'shadow-[0_0_20px_rgba(20,184,166,0.45)]'
        };
      case 'ghost':
      default:
        return {
          icon: Ghost,
          bgGradient: 'from-sky-950/80 via-sky-900/40 to-stone-950',
          borderColor: 'border-sky-500/40',
          iconColor: 'text-sky-400',
          glowColor: 'shadow-[0_0_20px_rgba(14,165,233,0.45)]'
        };
    }
  };

  const config = getSymbolConfig(id);
  const IconComponent = config.icon;

  return (
    <div 
      className={`relative flex items-center justify-center rounded-full p-2.5 bg-gradient-to-b ${config.bgGradient} border-2 ${config.borderColor} ${config.glowColor} ${className}`}
      style={{ width: size * 1.5, height: size * 1.5 }}
    >
      <IconComponent 
        size={size} 
        className={`${config.iconColor} filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]`} 
      />
      {/* Decorative inner circular gold rings */}
      <div className="absolute inset-1 rounded-full border border-stone-500/10 pointer-events-none" />
    </div>
  );
}
