import React from 'react';
import UserProfileInfo from '../../../molecules/profile/user-profile-info';
import AddressManagement from '../address-management';
import { UserOrdersPage } from '../user-orders';
import PasswordManagement from '../password-management';

interface ProfileContentProps {
  activeTab: string;
  user: any;
}

const ProfileContent: React.FC<ProfileContentProps> = ({ activeTab, user }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <UserProfileInfo user={user} />;

      case 'orders':
        return <UserOrdersPage />;

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground">Notifications content will be displayed here</p>
            </div>
          </div>
        );

      case 'shipping':
        return <AddressManagement />;

      case 'password':
        return <PasswordManagement />;

      default:
        return <UserProfileInfo user={user} />;
    }
  };

  return <div className="flex-1">{renderContent()}</div>;
};

export default ProfileContent;
