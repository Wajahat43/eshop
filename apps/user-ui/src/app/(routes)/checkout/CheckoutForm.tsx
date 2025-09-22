'use client';

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CheckoutFormProps {
  sessionData: any;
  sessionId: string;
  createPaymentIntent: (sellerData: any) => Promise<any>;
  isCreatingPaymentIntent: boolean;
  paymentIntentError: unknown;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  sessionData,
  sessionId,
  createPaymentIntent,
  isCreatingPaymentIntent,
  paymentIntentError,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const externalErrorMessage =
    paymentIntentError instanceof Error
      ? paymentIntentError.message
      : typeof paymentIntentError === 'string'
      ? paymentIntentError
      : null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Group cart items by shop to create separate payment intents
      const shopGroups = sessionData.cart.reduce((acc: any, item: any) => {
        if (!acc[item.shopId]) {
          acc[item.shopId] = [];
        }
        acc[item.shopId].push(item);
        return acc;
      }, {});

      const createdPaymentIntents: any[] = [];

      // Create payment intents for each shop
      for (const [shopId, items] of Object.entries(shopGroups)) {
        const sellerData = sessionData.sellers.find((s: any) => s.shopId === shopId);
        if (sellerData?.stripeAccountId) {
          const result = await createPaymentIntent(sellerData);
          if (result?.clientSecret) {
            createdPaymentIntents.push({
              shopId,
              clientSecret: result.clientSecret,
              paymentIntentId: result.paymentIntentId,
            });
          }
        }
      }

      if (createdPaymentIntents.length === 0) {
        throw new Error('Failed to create payment intents');
      }

      // Get the card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Process each payment intent

      for (const paymentIntent of createdPaymentIntents) {
        const { error: confirmError } = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Customer Name', // You can get this from user data
              email: 'customer@example.com', // You can get this from user data
            },
          },
        });

        if (confirmError) {
          throw new Error(`Payment failed for shop ${paymentIntent.shopId}: ${confirmError.message}`);
        }
      }

      // All payments successful - redirect to success page
      window.location.href = `/payment-success?sessionId=${sessionId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Element */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Card Details</label>
        <div className="border rounded-md p-3 bg-background">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Error Display */}
      {(error || externalErrorMessage) && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error || externalErrorMessage || 'An error occurred'}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing || isCreatingPaymentIntent}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
          !stripe || isProcessing || isCreatingPaymentIntent
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {isProcessing || isCreatingPaymentIntent ? 'Processing...' : `Pay $${sessionData.totalAmount.toFixed(2)}`}
      </button>

      {/* Security Notice */}
      <div className="text-xs text-muted-foreground text-center">
        🔒 Your payment information is secure and encrypted
      </div>
    </form>
  );
};

export default CheckoutForm;
