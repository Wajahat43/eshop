import Link from 'next/link';
import React from 'react';

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h3 className="text-2xl font-bold mb-4">
        You have successfully connected your bank account. And crated Your account.
      </h3>
      <Link
        href="/seller/dashboard"
        className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default page;
