import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Clock, CreditCard, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency, formatTime, generatePickupTimeSlots } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import StudentHeader from '@/components/student/StudentHeader';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm({ pickupTime, onSuccess }: { pickupTime: Date; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/orders',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Order Placed Successfully',
          description: 'You will receive a confirmation shortly.',
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          fields: {
            billingDetails: {
              address: 'never'
            }
          }
        }}
      />
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing}
        data-testid="button-place-order"
      >
        {isProcessing ? 'Processing...' : 'Place Order'}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { items, getSubtotal, getTax, getTotal, clearCart } = useCart();
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [step, setStep] = useState<'pickup' | 'payment'>('pickup');
  const { toast } = useToast();

  const timeSlots = generatePickupTimeSlots();

  useEffect(() => {
    if (items.length === 0) {
      setLocation('/menu');
    }
  }, [items, setLocation]);

  const handleContinueToPayment = async () => {
    if (!pickupTime) {
      toast({
        title: 'Select Pickup Time',
        description: 'Please select a pickup time to continue',
        variant: 'destructive',
      });
      return;
    }

    try {
      const orderData = {
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          customizations: item.customizations,
        })),
        pickupTime: pickupTime.toISOString(),
        specialInstructions,
        subtotal: getSubtotal(),
        tax: getTax(),
        total: getTotal(),
      };

      const response = await apiRequest('POST', '/api/create-payment-intent', orderData);
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize payment',
        variant: 'destructive',
      });
    }
  };

  const handleOrderSuccess = () => {
    clearCart();
    setLocation('/orders');
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'pickup' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <span className="font-medium">Pickup Time</span>
          </div>
          <div className="w-12 border-t border-muted" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
            <span className="font-medium">Payment</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 'pickup' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Select Pickup Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.toISOString()}
                          variant={pickupTime?.getTime() === slot.getTime() ? 'default' : 'outline'}
                          onClick={() => setPickupTime(slot)}
                          className="h-auto py-3"
                          data-testid={`button-timeslot-${formatTime(slot)}`}
                        >
                          {formatTime(slot)}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Special Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="instructions" className="sr-only">
                      Special Instructions
                    </Label>
                    <textarea
                      id="instructions"
                      className="w-full min-h-24 px-3 py-2 rounded-md border bg-background"
                      placeholder="Any special requests or dietary requirements..."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      data-testid="textarea-special-instructions"
                    />
                  </CardContent>
                </Card>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleContinueToPayment}
                  data-testid="button-continue-payment"
                >
                  Continue to Payment
                </Button>
              </>
            )}

            {step === 'payment' && clientSecret && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm pickupTime={pickupTime!} onSuccess={handleOrderSuccess} />
                  </Elements>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={`${item.menuItem.id}-${index}`} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span>{formatCurrency(parseFloat(item.menuItem.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(getTax())}</span>
                  </div>
                  {pickupTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pickup Time</span>
                      <span className="font-medium">{formatTime(pickupTime)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
