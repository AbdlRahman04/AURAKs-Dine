import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Clock, CreditCard, Package, Wallet, Banknote, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency, formatTime, generatePickupTimeSlots } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import StudentHeader from '@/components/student/StudentHeader';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import type { MenuItem } from '@shared/schema';
import { useOrderSummary } from '@/hooks/useOrders';

const CardPaymentForm = lazy(() => import('@/components/student/CardPaymentForm'));

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { items, getSubtotal, getTax, getTotal, clearCart } = useCart();
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [clientSecret, setClientSecret] = useState('');
  const [checkoutOrderId, setCheckoutOrderId] = useState<number | null>(null);
  const [checkoutOrderNumber, setCheckoutOrderNumber] = useState<string | undefined>();
  const [step, setStep] = useState<'pickup' | 'payment'>('pickup');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const paymentStepRef = useRef<HTMLDivElement>(null);
  const pickupSelectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { dir, language, t } = useLanguage();

  // Helper function to get localized item name
  const getItemName = (item: MenuItem) => {
    if (language === 'ar' && item.nameAr) {
      return item.nameAr;
    }
    return item.name;
  };

  // Keep the existing discount policy without loading a full order history at checkout.
  const { data: orderSummary, isLoading: isLoadingOrderSummary } = useOrderSummary();
  const isFirstTimeCustomer = !isLoadingOrderSummary && orderSummary?.hasOrders === false;
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

  useEffect(() => {
    if (step === 'payment') {
      paymentStepRef.current?.focus();
    }
  }, [step]);

  const handleContinueToPayment = async () => {
    setCheckoutError(null);
    if (!pickupTime) {
      const message = t('selectPickupTimeDescription');
      setCheckoutError(message);
      toast({
        title: t('selectPickupTime'),
        description: message,
        variant: 'destructive',
      });
      return;
    }

    // If cash payment, skip payment step and go directly to confirmation
    if (paymentMethod === 'cash') {
      setStep('payment');
      return;
    }

    setIsPreparingPayment(true);

    // If card payment, create payment intent
    try {
      if (checkoutOrderId && clientSecret) {
        await apiRequest('PATCH', `/api/orders/${checkoutOrderId}/checkout-details`, {
          pickupTime: pickupTime.toISOString(),
          specialInstructions,
        });
        setStep('payment');
        return;
      }

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
      setCheckoutOrderId(data.orderId);
      setCheckoutOrderNumber(data.orderNumber);
      setStep('payment');
    } catch (error) {
      const message = checkoutOrderId
        ? t('checkoutDetailsSaveFailed')
        : t('checkoutInitializationFailed');
      setCheckoutError(message);
      toast({
        title: t('error'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsPreparingPayment(false);
    }
  };

  const retryPickupSelection = () => {
    setCheckoutError(null);
    pickupSelectionRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
  };

  const handleCashPayment = async () => {
    if (!pickupTime) return;

    setCheckoutError(null);
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

      const response = await apiRequest('POST', '/api/orders/cash', orderData);
      const data = await response.json();

      toast({
        title: t('orderPlaced'),
        description: data.orderNumber
          ? `${t('orderNumber')} ${data.orderNumber}. ${t('cashPaymentDescription')}`
          : t('cashPaymentDescription'),
      });

      clearCart();
      setLocation('/orders');
    } catch (error) {
      const message = t('cashOrderFailed');
      setCheckoutError(message);
      toast({
        title: t('error'),
        description: message,
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
    <div className="student-page-shell student-checkout-page min-h-screen bg-background flex flex-col">
      <StudentHeader />
      <main id="main-content" className="flex-grow">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'pickup' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <span className="font-medium">{t('pickupStep')}</span>
          </div>
          <div className="w-12 border-t border-muted" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
            <span className="font-medium">{t('paymentStep')}</span>
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
                      {t('selectPickupTime')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div ref={pickupSelectionRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.toISOString()}
                          variant={pickupTime?.getTime() === slot.getTime() ? 'default' : 'outline'}
                          onClick={() => {
                            setPickupTime(slot);
                            setCheckoutError(null);
                          }}
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
                    <CardTitle>{t('paymentMethod')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={(value: 'card' | 'cash') => setPaymentMethod(value)}>
                      <div className="flex items-center gap-3 p-4 rounded-lg border hover-elevate cursor-pointer" onClick={() => !checkoutOrderId && setPaymentMethod('card')}>
                        <RadioGroupItem value="card" id="card" disabled={Boolean(checkoutOrderId)} data-testid="radio-payment-card" />
                        <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                            <Wallet className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{t('cardPayment')}</p>
                            <p className="text-sm text-muted-foreground">{t('cardPaymentDescription')}</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center gap-3 p-4 rounded-lg border hover-elevate cursor-pointer" onClick={() => !checkoutOrderId && setPaymentMethod('cash')}>
                        <RadioGroupItem value="cash" id="cash" disabled={Boolean(checkoutOrderId)} data-testid="radio-payment-cash" />
                        <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/10">
                            <Banknote className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium">{t('cashPayment')}</p>
                            <p className="text-sm text-muted-foreground">{t('cashPaymentDescription')}</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                    {checkoutOrderId && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {t('paymentMethodLocked')}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('specialInstructions')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="instructions" className="sr-only">
                      {t('specialInstructions')}
                    </Label>
                    <textarea
                      id="instructions"
                      className="w-full min-h-24 px-3 py-2 rounded-md border bg-background"
                      placeholder={t('addInstructions')}
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      data-testid="textarea-special-instructions"
                    />
                  </CardContent>
                </Card>

                {checkoutError && step === 'pickup' && (
                  <div className="checkout-status checkout-status-error" role="alert" aria-live="assertive">
                    <p>{checkoutError}</p>
                    <Button type="button" variant="outline" size="sm" onClick={retryPickupSelection}>
                      {t('tryAgain')}
                    </Button>
                  </div>
                )}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleContinueToPayment}
                  disabled={isPreparingPayment}
                  aria-busy={isPreparingPayment}
                  data-testid="button-continue-payment"
                >
                  {isPreparingPayment ? t('preparingPayment') : t('continueToPayment')}
                </Button>
              </>
            )}

            {(step === 'payment' || Boolean(clientSecret)) && (
              <Card hidden={step !== 'payment'}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle ref={paymentStepRef} tabIndex={-1} className="checkout-payment-title flex items-center gap-2">
                      {paymentMethod === 'card' ? (
                        <>
                          <CreditCard className="w-5 h-5" />
                          {t('paymentDetails')}
                        </>
                      ) : (
                        <>
                          <Banknote className="w-5 h-5" />
                          {t('confirmCashPayment')}
                        </>
                      )}
                    </CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep('pickup')}
                      className="text-muted-foreground hover:text-foreground"
                      data-testid="button-edit-checkout-details"
                    >
                      {dir === 'rtl' ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : <ArrowLeft className="h-4 w-4" aria-hidden="true" />}
                      <span>{t('editPickupDetails')}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-5 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    {t('checkoutDetailsHelp')}
                  </p>
                  {paymentMethod === 'card' && clientSecret ? (
                    <Suspense fallback={<div className="checkout-status" role="status" aria-live="polite" aria-busy="true"><p>{t('paymentDetailsLoading')}</p></div>}>
                      <CardPaymentForm clientSecret={clientSecret} orderNumber={checkoutOrderNumber} onSuccess={handleOrderSuccess} />
                    </Suspense>
                  ) : paymentMethod === 'cash' ? (
                    <div className="space-y-4">
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <p className="text-sm text-amber-900 dark:text-amber-100">
                          {t('cashPaymentNotice')}
                        </p>
                      </div>
                      {checkoutError && (
                        <div className="checkout-status checkout-status-error" role="alert" aria-live="assertive">
                          <p>{checkoutError}</p>
                          <Button type="button" variant="outline" size="sm" onClick={() => void handleCashPayment()} disabled={isPlacingOrder}>
                            {t('tryAgain')}
                          </Button>
                        </div>
                      )}
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCashPayment}
                        disabled={isPlacingOrder}
                        aria-busy={isPlacingOrder}
                        data-testid="button-confirm-cash-order"
                      >
                        {isPlacingOrder ? t('placingOrder') : t('confirmOrder')}
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
                    {t('orderSummary')}
                  </div>
                  {isFirstTimeCustomer && (
                    <Badge variant="secondary" className="gap-1 bg-vibrant-orange/10 text-vibrant-orange border-vibrant-orange/20">
                      <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
                      10% {t('discount')}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={`${item.menuItem.id}-${index}`} className="flex justify-between text-sm py-1">
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

                <div className="border-t pt-6 space-y-4">
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">{t('subtotal')}</span>
                    <span>{formatCurrency(getSubtotal())}</span>
                  </div>
                  {isFirstTimeCustomer && getDiscountAmount() > 0 && (
                    <div className="flex justify-between text-sm text-vibrant-orange py-1">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {t('firstTimeDiscount')}
                      </span>
                      <span>-{formatCurrency(getDiscountAmount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">{t('tax')}</span>
                    <span>{formatCurrency(getDiscountedTax())}</span>
                  </div>
                  {pickupTime && (
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-muted-foreground">{t('pickupTime')}</span>
                      <span className="flex items-center gap-2 font-medium">
                        {formatTime(pickupTime)}
                        {step === 'payment' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-primary underline-offset-4 hover:underline"
                            onClick={() => setStep('pickup')}
                            data-testid="button-change-pickup-time"
                          >
                            {t('change')}
                          </Button>
                        )}
                      </span>
                    </div>
                  )}
                  {step === 'payment' && (
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-muted-foreground">{t('paymentMethod')}</span>
                      <span className="font-medium">{paymentMethod === 'card' ? t('cardPayment') : t('cashPayment')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-4 mt-4 border-t">
                    <span>{t('total')}</span>
                    <span>{formatCurrency(getDiscountedTotal())}</span>
                  </div>
                  {isFirstTimeCustomer && (
                    <div className="bg-vibrant-orange/10 border border-vibrant-orange/20 rounded-md p-4 mt-4">
                      <p className="text-xs text-vibrant-orange font-medium">
                        {t('firstTimeDiscount')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
