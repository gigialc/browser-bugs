'use client';
import { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  className?: string;
}

export function Icon({ icon: Icon, className }: IconProps) {
  return <Icon className={className} />;
} 