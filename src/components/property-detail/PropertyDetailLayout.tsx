import type { ReactNode } from 'react';
import './property-detail.css';

interface PropertyDetailLayoutProps {
  profile: ReactNode;
  navigation: ReactNode;
  actions: ReactNode;
  children: ReactNode;
}

/** Presentation only: the existing property view owns data, drafts and actions. */
export function PropertyDetailLayout({ profile, navigation, actions, children }: PropertyDetailLayoutProps) {
  return (
    <div className="pd-layout">
      <aside className="pd-profile">{profile}</aside>
      <div className="pd-toolbar">
        {navigation}
        <div className="pd-actions">{actions}</div>
      </div>
      <div className="pd-workspace">{children}</div>
    </div>
  );
}
