'use client';

import React, { useState } from 'react';
import { ShopInfoForm, CoverBannerUpload } from '../../molecules/shop';
import { Settings, Store, Image as ImageIcon } from 'lucide-react';

const ShopSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'banner'>('info');

  const tabs = [
    {
      id: 'info' as const,
      label: 'Shop Information',
      icon: Store,
    },
    {
      id: 'banner' as const,
      label: 'Cover Banner',
      icon: ImageIcon,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Shop Settings</h2>
            <p className="text-sm text-gray-600">Manage your shop information and appearance</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'info' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Shop Information</h3>
              <p className="text-sm text-gray-600">Update your shop details, description, and contact information.</p>
            </div>
            <ShopInfoForm />
          </div>
        )}

        {activeTab === 'banner' && (
          <div>
            <CoverBannerUpload />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopSettings;
