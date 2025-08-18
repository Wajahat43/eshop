import React from 'react';
import { User, Mail, Calendar, Users, MapPin } from 'lucide-react';

interface UserProfileInfoProps {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    following?: string[];
    avatar?: {
      url: string;
    } | null;
  };
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ user }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar.url}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-border">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Email</span>
              </div>
              <p className="text-foreground">{user.email}</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Following</span>
              </div>
              <p className="text-foreground">{user.following?.length || 0} shops</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Joined</span>
              </div>
              <p className="text-foreground">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">User ID:</span>
            <span className="text-sm font-mono text-foreground">{user.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Email:</span>
            <span className="text-sm text-foreground">{user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Member since:</span>
            <span className="text-sm text-foreground">{formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
