import React from 'react';
import { MapPin, Edit, Trash2, Star } from 'lucide-react';
import { UserAddress } from '../../../../../hooks/useUserAddresses';
import countries from '../../../../../utils/countries';

interface AddressCardProps {
  address: UserAddress;
  onEdit: (address: UserAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  isDeleting?: boolean;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete, onSetDefault, isDeleting = false }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{address.label}</span>
          {address.isDefault && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              <Star className="h-3 w-3" />
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(address)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Edit address"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(address.id)}
            disabled={isDeleting}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            title="Delete address"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-foreground">{address.name}</p>
        <p className="text-sm text-muted-foreground">{address.street}</p>
        <p className="text-sm text-muted-foreground">
          {address.city}, {address.zip}
        </p>
        <p className="text-sm text-muted-foreground">
          {address.country}
          {(() => {
            const countryInfo = countries.find((c) => c.name === address.country);
            return countryInfo ? (
              <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">{countryInfo.code}</span>
            ) : null;
          })()}
        </p>
      </div>

      {!address.isDefault && (
        <button
          onClick={() => onSetDefault(address.id)}
          className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          Set as default
        </button>
      )}
    </div>
  );
};

export default AddressCard;
