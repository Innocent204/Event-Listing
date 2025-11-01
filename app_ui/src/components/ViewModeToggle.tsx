import { ViewMode } from '../types/event';
import { Button } from './ui/button';
import { List, Calendar, MapPin } from 'lucide-react';
import React from 'react';

interface ViewModeToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ currentMode, onModeChange }: ViewModeToggleProps) {
  const modes = [
    { id: 'list' as ViewMode, label: 'List', icon: List },
    { id: 'calendar' as ViewMode, label: 'Calendar', icon: Calendar },
    { id: 'map' as ViewMode, label: 'Map', icon: MapPin },
  ];

  return (
    <div className="flex border rounded-lg p-1 bg-muted">
      {modes.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={currentMode === id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange(id)}
          className="flex items-center gap-2 flex-1"
        >
          <Icon className="w-4 h-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}