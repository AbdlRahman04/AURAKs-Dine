import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Clock, CreditCard, Package, Wallet, Banknote, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency, formatTime, generatePickupTimeSlots } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import StudentHeader from '@/components/student/StudentHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import type { OrderWithItems, MenuItem } from '@shared/schema';

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
          },
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [clientSecret, setClientSecret] = useState('');
  const [step, setStep] = useState<'pickup' | 'payment'>('pickup');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  // Helper function to get localized item name
  const getItemName = (item: MenuItem) => {
    if (language === 'ar' && item.nameAr) {
      return item.nameAr;
    }
    return item.name;
  };

  // Check if user is a first-time customer (10% discount)
  const { data: orders, isLoading: isLoadingOrders } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders'],
  });

  // Only apply discount after orders have loaded and confirmed count is 0
  const isFirstTimeCustomer = !isLoadingOrders && (!orders || orders.length === 0);
  const FIRST_TIME_DISCOUNT = 0.10; // 10%

  const getDiscountAmount = () => {
    return isFirstTimeCustomer ? getSubtotal() * FIRST_TIME_DISCOUNT : 0;
  };

  // Calculate tax on post-discount subtotal
  const getDiscountedSubtotal = () => {
    return getSubtotal() - getDiscountAmount();
  };

  const getDiscountedTax = () => {
    return getDiscountedSubtotal() * 0.08; // 8% tax rate
  };

  const getDiscountedTotal = () => {
    return getDiscountedSubtotal() + getDiscountedTax();
  };

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

    // If cash payment, skip payment step and go directly to confirmation
    if (paymentMethod === 'cash') {
      setStep('payment');
      return;
    }

    // If card payment, create payment intent
    try {
      const orderData = {
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          customizations: item.customizations,
          selectedSize: item.selectedSize,
        })),
        pickupTime: pickupTime.toISOString(),
        specialInstructions,
        subtotal: getSubtotal(),
        discount: getDiscountAmount(),
        tax: getDiscountedTax(),
        total: getDiscountedTotal(),
        paymentMethod: 'card',
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

  const handleCashPayment = async () => {
    if (!pickupTime) return;

    setIsPlacingOrder(true);

    try {
      const orderData = {
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          customizations: item.customizations,
          selectedSize: item.selectedSize,
        })),
        pickupTime: pickupTime.toISOString(),
        specialInstructions,
        subtotal: getSubtotal(),
        discount: getDiscountAmount(),
        tax: getDiscountedTax(),
        total: getDiscountedTotal(),
        paymentMethod: 'cash',
      };

      await apiRequest('POST', '/api/orders/cash', orderData);

      toast({
        title: 'Order Placed Successfully',
        description: 'Pay cash when you pick up your order',
      });

      clearCart();
      setLocation('/orders');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order',
        variant: 'destructive',
      });
    } finally {
      setIsPlacingOrder(false);
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
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={(value: 'card' | 'cash') => setPaymentMethod(value)}>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border hover-elevate cursor-pointer" onClick={() => setPaymentMethod('card')}>
                        <RadioGroupItem value="card" id="card" data-testid="radio-payment-card" />
                        <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                            <Wallet className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Card Payment</p>
                            <p className="text-sm text-muted-foreground">Pay with credit/debit card or Apple Pay</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-lg border hover-elevate cursor-pointer" onClick={() => setPaymentMethod('cash')}>
                        <RadioGroupItem value="cash" id="cash" data-testid="radio-payment-cash" />
                        <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/10">
                            <Banknote className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium">Cash on Pickup</p>
                            <p className="text-sm text-muted-foreground">Pay when you collect your order</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
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

            {step === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {paymentMethod === 'card' ? (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Payment Details
                      </>
                    ) : (
                      <>
                        <Banknote className="w-5 h-5" />
                        Confirm Cash Payment
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentMethod === 'card' && clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm pickupTime={pickupTime!} onSuccess={handleOrderSuccess} />
                    </Elements>
                  ) : paymentMethod === 'cash' ? (
                    <div className="space-y-4">
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <p className="text-sm text-amber-900 dark:text-amber-100">
                          Please have the exact amount ready when you pick up your order.
                        </p>
                      </div>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCashPayment}
                        disabled={isPlacingOrder}
                        data-testid="button-confirm-cash-order"
                      >
                        {isPlacingOrder ? 'Placing Order...' : 'Confirm Order'}
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Summary
                  </div>
                  {isFirstTimeCustomer && (
                    <Badge variant="secondary" className="bg-vibrant-orange/10 text-vibrant-orange border-vibrant-orange/20">
                      <Sparkles className="w-3 h-3 mr-1" />
                      10% OFF
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={`${item.menuItem.id}-${index}`} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {getItemName(item.menuItem)}
                        {item.selectedSize && ` (${item.selectedSize})`}
                      </span>
                      <span>
                        {(() => {
                          let price = parseFloat(item.menuItem.price);
                          if (item.selectedSize && item.menuItem.sizeVariants) {
                            const sizeVariants = item.menuItem.sizeVariants as Array<{ name: string; priceModifier: string }>;
                            const selectedVariant = sizeVariants.find(v => v.name === item.selectedSize);
                            if (selectedVariant) {
                              price += parseFloat(selectedVariant.priceModifier);
                            }
                          }
                          return formatCurrency(price * item.quantity);
                        })()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(getSubtotal())}</span>
                  </div>
                  {isFirstTimeCustomer && getDiscountAmount() > 0 && (
                    <div className="flex justify-between text-sm text-vibrant-orange">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        First-Time Discount (10%)
                      </span>
                      <span>-{formatCurrency(getDiscountAmount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(getDiscountedTax())}</span>
                  </div>
                  {pickupTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pickup Time</span>
                      <span className="font-medium">{formatTime(pickupTime)}</span>
                    </div>
                  )}
                  {step === 'payment' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="font-medium">{paymentMethod === 'card' ? 'Card' : 'Cash on Pickup'}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(getDiscountedTotal())}</span>
                  </div>
                  {isFirstTimeCustomer && (
                    <div className="bg-vibrant-orange/10 border border-vibrant-orange/20 rounded-md p-3 mt-2">
                      <p className="text-xs text-vibrant-orange font-medium">
                        Welcome! Enjoy 10% off your first order 🎉
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
