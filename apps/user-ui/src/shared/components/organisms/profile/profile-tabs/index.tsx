import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NavItem from '../../../atoms/nav-item';
import { User, Package, Inbox, Bell, MapPin, Lock, LogOut } from 'lucide-react';
import useLogout from '../../../../../hooks/useLogout';
import LogoutConfirmation from '../../../molecules/profile/logout-confirmation';

interface TabItem {
  key: string;
  label: string;
  icon: any;
  danger?: boolean;
}

const tabs: TabItem[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'orders', label: 'My Orders', icon: Package },
  { key: 'inbox', label: 'Inbox', icon: Inbox },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'shipping', label: 'Shipping Address', icon: MapPin },
  { key: 'password', label: 'Change Password', icon: Lock },
  { key: 'logout', label: 'Logout', icon: LogOut, danger: true },
];

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  const router = useRouter();
  const { logout } = useLogout();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleTabClick = (tabKey: string) => {
    if (tabKey === 'inbox') {
      router.push('/inbox');
      return;
    }

    if (tabKey === 'logout') {
      setShowLogoutConfirmation(true);
      return;
    }

    onTabChange(tabKey);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirmation(false);
    logout();
  };

  return (
    <>
      <div className="w-64 space-y-2">
        {tabs.map((tab) => (
          <NavItem
            key={tab.key}
            label={tab.label}
            icon={tab.icon}
            active={activeTab === tab.key}
            danger={tab.danger}
            onClick={() => handleTabClick(tab.key)}
          />
        ))}
      </div>

      <LogoutConfirmation
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default ProfileTabs;
