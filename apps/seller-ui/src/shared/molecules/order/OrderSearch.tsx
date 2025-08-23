import React from 'react';
import { Search } from 'lucide-react';

interface OrderSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export const OrderSearch: React.FC<OrderSearchProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Search orders by ID, buyer name, or email...',
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        placeholder={placeholder}
      />
    </div>
  );
};
