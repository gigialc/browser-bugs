'use client';

import { Play, Plus, Settings } from 'lucide-react';

type IconName = 'play' | 'plus' | 'settings';

interface IconProps {
  name: IconName;
  className?: string;
}

const iconMap = {
  play: Play,
  plus: Plus,
  settings: Settings,
};

export default function ClientIcon({ name, className = '' }: IconProps) {
  const IconComponent = iconMap[name];
  return <IconComponent className={className} />;
} 