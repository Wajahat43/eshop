'use client';

import { ChevronRight, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useDiscountCodes, CreateDiscountCodeData } from '../../../../hooks/useDiscountCodes';
import { Dialog } from '../../../../shared/components';
import { CreateDiscountCode, DiscountCodesList } from '../../../../shared/organisms';

const Page = () => {
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading: loading, error, createDiscountCode, deleteDiscountCode } = useDiscountCodes();
  const discountCodes = data?.discountCodes || [];

  const handleCreateDiscountCode = async (data: CreateDiscountCodeData) => {
    try {
      await createDiscountCode.mutateAsync(data);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to create discount code:', error);
    }
  };

  const handleDeleteDiscountCode = async (id: string) => {
    await deleteDiscountCode.mutateAsync(id);
  };

  return (
    <div className="w-full min-h-svh p-8 bg-background text-foreground">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-semibold font-sans">Discount Codes</h2>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:scale-102 flex items-center gap-2 transition-transform"
            onClick={() => setShowModal(true)}
          >
            <PlusIcon size={16} />
            Create Discount Code
          </button>
        </div>
      </div>

      {/**Bread crumbs */}
      <div className="flex items-center text-muted-foreground">
        <Link href={'/dashboard'} className="cursor-pointer hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={16} />
        <span className="cursor-pointer">Discount Codes</span>
      </div>

      {/* Error Display */}
      {(error || createDiscountCode.error || deleteDiscountCode.error) && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
          {error?.message || createDiscountCode.error?.message || deleteDiscountCode.error?.message}
        </div>
      )}

      <div className="mt-8 p-6 rounded-lg bg-card border border-border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Your Discount Codes</h3>
        <DiscountCodesList discountCodes={discountCodes} onDelete={handleDeleteDiscountCode} isLoading={loading} />
      </div>

      {/* Create Discount Code Dialog */}
      <Dialog isOpen={showModal} onClose={() => setShowModal(false)} title="Create Discount Code" size="md">
        <CreateDiscountCode
          onSubmit={handleCreateDiscountCode}
          onCancel={() => setShowModal(false)}
          isLoading={createDiscountCode.isPending}
        />
      </Dialog>
    </div>
  );
};

export default Page;
