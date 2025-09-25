import Link from 'next/link';
import React from 'react';
import { CheckCircle } from 'lucide-react';

const page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Setup Complete!</h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          You have successfully connected your bank account and created your seller account. You're now ready to start
          selling on NextCart!
        </p>

        {/* Action Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Go to Dashboard
        </Link>

        {/* Additional Info */}
        <p className="text-sm text-gray-500 mt-6">
          You can start by creating your first product or setting up your shop details.
        </p>
      </div>
    </div>
  );
};

export default page;
