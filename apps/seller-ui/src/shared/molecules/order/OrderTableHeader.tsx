import React from 'react';

export const OrderTableHeader: React.FC = () => {
  return (
    <thead className="bg-muted/50">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Order ID
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Buyer
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Total
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Status
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );
};
