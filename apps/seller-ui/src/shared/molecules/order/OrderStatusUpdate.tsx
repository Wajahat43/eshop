import React, { useState } from 'react';
import { useUpdateOrderStatus } from '../../../hooks/useOrders';
import { Order, UpdateOrderStatusRequest } from '../../../hooks/useOrders';
import { Package, Truck, CheckCircle, XCircle, Clock, AlertCircle, X } from 'lucide-react';

interface OrderStatusUpdateProps {
  order: Order;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'PAID', label: 'Paid', icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'PROCESSING', label: 'Processing', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { value: 'SHIPPED', label: 'Shipped', icon: Truck, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { value: 'DELIVERED', label: 'Delivered', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'CANCELLED', label: 'Cancelled', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  { value: 'REFUNDED', label: 'Refunded', icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
] as const;

export const OrderStatusUpdate: React.FC<OrderStatusUpdateProps> = ({ order, onSuccess, onCancel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formData, setFormData] = useState<UpdateOrderStatusRequest>({
    status: order.status,
    trackingNumber: order.trackingNumber || '',
    estimatedDelivery: order.estimatedDelivery || '',
  });

  const updateOrderStatus = useUpdateOrderStatus();

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts((prev: Toast[]) => [...prev, { id, type, message }]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev: Toast[]) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev: Toast[]) => prev.filter((toast) => toast.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateOrderStatus.mutateAsync({
        orderId: order.id,
        data: formData,
      });

      setIsOpen(false);
      addToast('success', 'Order status updated successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update order status:', error);
      addToast('error', 'Failed to update order status. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setFormData({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      estimatedDelivery: order.estimatedDelivery || '',
    });
    onCancel?.();
  };

  const currentStatus = statusOptions.find((option) => option.value === order.status);

  return (
    <div className="space-y-4">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-sm ${
              toast.type === 'success'
                ? 'bg-green-100 border border-green-200 text-green-800'
                : 'bg-red-100 border border-red-200 text-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Current Status Display */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-3">Current Status</h3>
        <div className="flex items-center gap-3">
          {currentStatus && (
            <>
              <div className={`w-10 h-10 ${currentStatus.bgColor} rounded-lg flex items-center justify-center`}>
                <currentStatus.icon className={`h-5 w-5 ${currentStatus.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-lg font-semibold text-foreground">{currentStatus.label}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Update Status Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Update Order Status
      </button>

      {/* Status Update Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Update Order Status</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">New Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev: UpdateOrderStatusRequest) => ({
                      ...prev,
                      status: e.target.value as Order['status'],
                    }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tracking Number */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) =>
                    setFormData((prev: UpdateOrderStatusRequest) => ({ ...prev, trackingNumber: e.target.value }))
                  }
                  placeholder="Enter tracking number (optional)"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Estimated Delivery */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Estimated Delivery</label>
                <input
                  type="datetime-local"
                  value={formData.estimatedDelivery}
                  onChange={(e) =>
                    setFormData((prev: UpdateOrderStatusRequest) => ({ ...prev, estimatedDelivery: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateOrderStatus.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateOrderStatus.isPending ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
