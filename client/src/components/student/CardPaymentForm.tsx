import { useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

type CardPaymentFormProps = {
  clientSecret: string;
  orderNumber?: string;
  onSuccess: () => void;
};

function PaymentForm({ orderNumber, onSuccess }: Omit<CardPaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = (message: string) => {
    setErrorMessage(message);
    toast({ title: t('paymentFailed'), description: message, variant: 'destructive' });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);
    let paymentWasSuccessful = false;

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/orders` },
        redirect: 'if_required',
      });

      if (error) {
        showError(error.message ?? t('paymentFailed'));
      } else if (paymentIntent?.status === 'succeeded') {
        paymentWasSuccessful = true;
        let confirmedOrderNumber = orderNumber;

        try {
          const response = await apiRequest('POST', '/api/payments/confirm', {
            paymentIntentId: paymentIntent.id,
          });
          const confirmation = await response.json() as { orderNumber?: string };
          confirmedOrderNumber = confirmation.orderNumber ?? confirmedOrderNumber;
        } catch {
          toast({
            title: t('paymentSuccessful'),
            description: t('paymentStatusRefreshFailed'),
            variant: 'destructive',
          });
          onSuccess();
          return;
        }

        toast({
          title: t('paymentSuccessful'),
          description: confirmedOrderNumber
            ? `${t('orderNumber')} ${confirmedOrderNumber}. ${t('paymentSuccessfulMessage')}`
            : t('paymentSuccessfulMessage'),
        });
        onSuccess();
      } else if (paymentIntent?.status === 'processing') {
        toast({ title: t('paymentPending'), description: t('paymentProcessingMessage') });
        onSuccess();
      } else {
        showError(t('paymentFailed'));
      }
    } catch {
      showError(paymentWasSuccessful ? t('paymentStatusRefreshFailed') : t('errorOccurred'));
      if (paymentWasSuccessful) onSuccess();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isProcessing}>
      {errorMessage && (
        <div className="checkout-status checkout-status-error" role="alert" aria-live="assertive">
          <p>{errorMessage}</p>
        </div>
      )}
      <PaymentElement
        options={{
          fields: { billingDetails: { address: 'never' } },
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />
      <Button type="submit" className="w-full" size="lg" disabled={!stripe || isProcessing} data-testid="button-place-order">
        {isProcessing ? t('processingOrder') : t('placeOrder')}
      </Button>
    </form>
  );
}

export default function CardPaymentForm({ clientSecret, orderNumber, onSuccess }: CardPaymentFormProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm orderNumber={orderNumber} onSuccess={onSuccess} />
    </Elements>
  );
}
