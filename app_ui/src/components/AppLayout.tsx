import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import React from 'react';

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children || <Outlet />}
    </div>
  );
}