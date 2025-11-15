import React from 'react';
import { Outlet } from 'react-router-dom';
import AuthGate from '../components/auth/AuthGate';
import EncryptionGate from '../components/encryption/EncryptionGate';

/**
 * Layout for authenticated app pages.
 * 
 * Wraps all app routes with:
 * - AuthGate: Handles onboarding flow (username, welcome, membership)
 * - EncryptionGate: Handles encryption setup
 * - App shell: Sidebar, navigation, etc. (rendered by children)
 */
const AppLayout: React.FC = () => {
  return (
    <AuthGate>
      <EncryptionGate>
        <div className="app-layout">
          <Outlet />
        </div>
      </EncryptionGate>
    </AuthGate>
  );
};

export default AppLayout;
