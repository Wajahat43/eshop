'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Home, ShoppingBag } from 'lucide-react';
import { useStore } from 'apps/user-ui/src/store';

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [showConfetti, setShowConfetti] = useState(false);
  const { clearCart } = useStore();

  useEffect(() => {
    // Clear the cart when payment is successful
    clearCart();

    // Trigger confetti effect when component mounts
    if (!showConfetti) {
      setShowConfetti(true);

      // Dynamically import canvas-confetti to avoid build issues if not installed
      const loadConfetti = async () => {
        try {
          const confetti = (await import('canvas-confetti')).default;

          // Fire multiple confetti bursts for a more dramatic effect
          const duration = 3 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

          function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
          }

          const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // since particles fall down, start a bit higher than random
            confetti(
              Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
              }),
            );
            confetti(
              Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
              }),
            );
          }, 250);

          // Cleanup
          setTimeout(() => clearInterval(interval), duration);
        } catch (error) {
          console.log('Canvas confetti not available:', error);
          // Fallback: just show success without confetti
        }
      };

      loadConfetti();
    }
  }, [showConfetti, clearCart]);

  const steps = [
    {
      icon: Package,
      title: 'Order Confirmed',
      description: 'Your order has been successfully placed and confirmed',
      status: 'completed',
    },
    {
      icon: Truck,
      title: 'Processing',
      description: "We're preparing your items for shipping",
      status: 'current',
    },
    {
      icon: CheckCircle,
      title: 'Shipped',
      description: 'Your order will be delivered soon',
      status: 'pending',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600 mb-2">Thank you for your purchase</p>
          {sessionId && (
            <p className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-md inline-block">
              Order ID: {sessionId}
            </p>
          )}
        </div>

        {/* Order Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">What happens next?</h2>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : step.status === 'current'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      step.status === 'completed'
                        ? 'text-green-900'
                        : step.status === 'current'
                        ? 'text-blue-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      step.status === 'completed'
                        ? 'text-green-700'
                        : step.status === 'current'
                        ? 'text-blue-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
                {step.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Continue Shopping</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span>View Orders</span>
          </Link>

          <Link
            href="/cart"
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Back to Cart</span>
          </Link>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Customer Support</h4>
              <p className="text-sm text-gray-600 mb-2">
                Our support team is here to help with any questions about your order.
              </p>
              <a href="mailto:support@nextcart.com" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                support@nextcart.com
              </a>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Order Tracking</h4>
              <p className="text-sm text-gray-600 mb-2">
                You will receive shipping confirmation with tracking details via email.
              </p>
              <p className="text-sm text-gray-500">Estimated delivery: 3-5 business days</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>A confirmation email has been sent to your registered email address.</p>
          <p className="mt-1">Thank you for choosing NextCart! 🎉</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
