'use client';

import React, { useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, CreditCard, Calendar, Lock, TestTube } from 'lucide-react';

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
  const [isTestMode, setIsTestMode] = useState(false);
  const externalErrorMessage =
    paymentIntentError instanceof Error
      ? paymentIntentError.message
      : typeof paymentIntentError === 'string'
      ? paymentIntentError
      : null;

  const handleTestPayment = () => {
    setIsTestMode(true);
    setError(null);

    // Note: Stripe Elements don't support programmatic value setting for security reasons
    // This is a visual indicator that test mode is active
    // Users will need to manually enter test card details
  };

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

      // Get the card elements
      const cardNumberElement = elements.getElement(CardNumberElement);
      const cardExpiryElement = elements.getElement(CardExpiryElement);
      const cardCvcElement = elements.getElement(CardCvcElement);

      if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
        throw new Error('Card elements not found');
      }

      // Process each payment intent
      for (const paymentIntent of createdPaymentIntents) {
        const { error: confirmError } = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: {
            card: cardNumberElement,
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
        fontFamily: 'system-ui, -apple-system, sans-serif',
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
      {/* Card Details */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">Card Details</label>

        {/* Card Number */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <CreditCard className="h-3 w-3" />
            Card Number
          </label>
          <div className="border border-border/60 rounded-lg p-3 bg-background focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <CardNumberElement
              options={{
                ...cardElementOptions,
                placeholder: '1234 5678 9012 3456',
              }}
            />
          </div>
        </div>

        {/* Expiry and CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Expiry Date
            </label>
            <div className="border border-border/60 rounded-lg p-3 bg-background focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <CardExpiryElement
                options={{
                  ...cardElementOptions,
                  placeholder: 'MM/YY',
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Lock className="h-3 w-3" />
              CVC
            </label>
            <div className="border border-border/60 rounded-lg p-3 bg-background focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <CardCvcElement
                options={{
                  ...cardElementOptions,
                  placeholder: '123',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(error || externalErrorMessage) && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error || externalErrorMessage || 'An error occurred'}</p>
        </div>
      )}

      {/* Test Payment Button */}
      {!isTestMode && (
        <button
          type="button"
          onClick={handleTestPayment}
          className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60"
        >
          <TestTube className="h-4 w-4" />
          Use Test Payment
        </button>
      )}

      {/* Test Mode Instructions */}
      {isTestMode && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <TestTube className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-blue-900">Test Mode Active</h4>
              <p className="text-xs text-blue-700">Use these test card details:</p>
              <div className="text-xs text-blue-600 space-y-1">
                <div>
                  <strong>Card Number:</strong> 4242 4242 4242 4242
                </div>
                <div>
                  <strong>Expiry:</strong> Any future date (e.g., 12/34)
                </div>
                <div>
                  <strong>CVC:</strong> Any 3 digits (e.g., 123)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing || isCreatingPaymentIntent}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
          !stripe || isProcessing || isCreatingPaymentIntent
            ? 'bg-muted/80 text-muted-foreground cursor-not-allowed border border-border/60 shadow-sm'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md active:scale-[0.98]'
        }`}
      >
        {(isProcessing || isCreatingPaymentIntent) && <Loader2 className="h-4 w-4 animate-spin" />}
        {isProcessing || isCreatingPaymentIntent
          ? 'Processing payment...'
          : `Pay $${sessionData.discountedTotal?.toFixed(2) || sessionData.totalAmount?.toFixed(2) || '0.00'}`}
      </button>

      {/* Security Notice */}
      <div className="text-xs text-muted-foreground text-center">
        🔒 Your payment information is secure and encrypted
      </div>
    </form>
  );
};

export default CheckoutForm;
