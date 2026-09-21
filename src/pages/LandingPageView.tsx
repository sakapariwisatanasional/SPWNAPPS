import React from 'react';
import { LandingPage } from '../components/landing/LandingPage';
import { CurrentUser, KridaType } from '../types';

interface LandingPageViewProps {
  onOpenAuth: (tab?: 'login' | 'register') => void;
  currentUser?: CurrentUser;
  onNavigateKrida?: (krida: KridaType) => void;
  onNavigateStore?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onOpenAuth,
  currentUser,
  onNavigateKrida,
  onNavigateStore,
}) => {
  return (
    <div className="min-h-screen bg-slate-950">
      <LandingPage
        onOpenAuth={onOpenAuth}
        currentUser={currentUser}
        onNavigateKrida={onNavigateKrida}
        onNavigateStore={onNavigateStore}
      />
    </div>
  );
};

export default LandingPageView;
