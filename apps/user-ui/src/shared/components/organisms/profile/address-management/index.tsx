import React, { useState } from 'react';
import { Plus, MapPin, Loader2 } from 'lucide-react';
import {
  useUserAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  UserAddress,
  CreateAddressData,
} from '../../../../../hooks/useUserAddresses';
import AddressCard from '../../../molecules/profile/address-card';
import AddAddressDialog from '../../../molecules/profile/add-address-dialog';

const AddressManagement: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  const { data: addresses = [], isLoading, error } = useUserAddresses();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();

  const handleAddAddress = (data: CreateAddressData) => {
    addAddressMutation.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setEditingAddress(null);
      },
    });
  };

  const handleUpdateAddress = (data: CreateAddressData) => {
    if (editingAddress) {
      updateAddressMutation.mutate(
        { ...data, id: editingAddress.id },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingAddress(null);
          },
        },
      );
    }
  };

  const handleDeleteAddress = (id: string) => {
    setDeletingAddressId(id);
    deleteAddressMutation.mutate(id, {
      onSuccess: () => {
        setDeletingAddressId(null);
      },
    });
  };

  const handleSetDefaultAddress = (id: string) => {
    setDefaultAddressMutation.mutate(id);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
  };

  const handleSubmit = (data: CreateAddressData) => {
    if (editingAddress) {
      handleUpdateAddress(data);
    } else {
      handleAddAddress(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load addresses. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Shipping Addresses</h2>
          <p className="text-muted-foreground">Manage your delivery addresses</p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </button>
      </div>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No addresses yet</h3>
          <p className="text-muted-foreground mb-4">Add your first shipping address to get started</p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
              onSetDefault={handleSetDefaultAddress}
              isDeleting={deletingAddressId === address.id}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Address Dialog */}
      <AddAddressDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        address={editingAddress}
        isLoading={addAddressMutation.isPending || updateAddressMutation.isPending}
      />
    </div>
  );
};

export default AddressManagement;
