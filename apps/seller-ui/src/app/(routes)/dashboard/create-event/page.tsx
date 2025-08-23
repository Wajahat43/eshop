'use client';

import React from 'react';
import ProductForm from 'apps/seller-ui/src/shared/organisms/ProductForm';

const CreateEventPage = () => {
  return (
    <ProductForm
      mode="event"
      title="Create Event"
      breadcrumbLabel="Create Event"
      onSuccessPath="/dashboard/all-events"
    />
  );
};

export default CreateEventPage;
