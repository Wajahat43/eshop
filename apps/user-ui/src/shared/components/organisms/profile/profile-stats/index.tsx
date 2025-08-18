import React from 'react';
import StatCard from '../../../atoms/stat-card';
import { Package, Clock, CheckCircle } from 'lucide-react';

interface ProfileStatsProps {
  totalOrders: number;
  processingOrders: number;
  completedOrders: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ totalOrders, processingOrders, completedOrders }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Total Orders" count={totalOrders} icon={Package} />
      <StatCard title="Processing Orders" count={processingOrders} icon={Clock} />
      <StatCard title="Completed Orders" count={completedOrders} icon={CheckCircle} />
    </div>
  );
};

export default ProfileStats;
