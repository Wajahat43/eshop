import React, { useState } from 'react';
import { Trash2, Copy, Check } from 'lucide-react';
import { DiscountCode } from '../../hooks/useDiscountCodes';
import { Tooltip } from '../components';

interface DiscountCodesListProps {
  discountCodes: DiscountCode[];
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const DiscountCodesList: React.FC<DiscountCodesListProps> = ({ discountCodes, onDelete, isLoading = false }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDeleteDiscountCode = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this discount code?')) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Failed to delete discount code:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (discountCodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">No discount codes found. Create your first one!</div>
    );
  }

  return (
    <div className="grid gap-4">
      {discountCodes.map((code: DiscountCode) => (
        <div
          key={code.id}
          className="border border-border rounded-md p-4 flex justify-between items-center bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-card-foreground">{code.public_name}</h4>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">
                {code.discountType}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Code: <code className="bg-muted px-2 py-1 rounded text-foreground font-mono">{code.discountCode}</code>
              </span>
              <span>
                Value: {code.discountValue}
                {code.discountType === 'percentage' ? '%' : '$'}
              </span>
              <span>Created: {formatDate(code.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content={copiedCode === code.discountCode ? 'Copied!' : 'Copy code'}>
              <button
                onClick={() => copyToClipboard(code.discountCode)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors relative"
              >
                {copiedCode === code.discountCode ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              </button>
            </Tooltip>
            <Tooltip content="Delete">
              <button
                onClick={() => handleDeleteDiscountCode(code.id)}
                className="p-2 text-destructive hover:text-destructive/80 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  );
};
