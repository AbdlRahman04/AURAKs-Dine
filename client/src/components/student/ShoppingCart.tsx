import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency, getOptimizedImageUrl } from '@/lib/utils';
import { useEffect, type RefObject } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { preloadStudentPage } from '@/lib/studentRoutePrefetch';
import type { MenuItem } from '@shared/schema';

interface ShoppingCartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement>;
}

export default function ShoppingCart({ open, onOpenChange, triggerRef }: ShoppingCartProps) {
  const { items, updateQuantity, removeItem, getSubtotal, getTax, getTotal, getItemCount } = useCart();
  const [, setLocation] = useLocation();
  const { language, dir, t } = useLanguage();

  useEffect(() => {
    if (open && items.length > 0) {
      preloadStudentPage('/checkout');
    }
  }, [items.length, open]);

  const getItemName = (item: MenuItem) => {
    if (language === 'ar' && item.nameAr) {
      return item.nameAr;
    }
    return item.name;
  };

  const handleCheckout = () => {
    onOpenChange(false);
    setLocation('/checkout');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={dir === 'rtl' ? 'left' : 'right'}
        className="student-cart-sheet w-full sm:max-w-lg flex flex-col"
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          onOpenChange(false);
        }}
        onKeyDownCapture={(event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          event.stopPropagation();
          onOpenChange(false);
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <SheetHeader className="student-cart-header">
          <p className="menu-kicker">{t('readyWhenYouAre')}</p>
          <SheetTitle className="flex items-center gap-3">
            <span className="student-cart-title-icon" aria-hidden="true">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <span>{t('yourCart')}</span>
            <Badge variant="secondary" className="student-cart-items-badge">
              {getItemCount()} {t('cartItemCount')}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="student-cart-empty flex-1 flex flex-col items-center justify-center text-center">
            <div className="student-cart-empty-icon" aria-hidden="true">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3>{t('cartEmpty')}</h3>
            <p>{t('cartEmptyDescription')}</p>
            <Button onClick={() => onOpenChange(false)} data-testid="button-continue-shopping">
              {t('continueShopping')}
            </Button>
          </div>
        ) : (
          <>
            <div className="student-cart-items flex-1 overflow-y-auto py-4">
              {items.map((item, index) => (
                <article
                  key={`${item.menuItem.id}-${index}`}
                  className="student-cart-item"
                  data-testid={`cart-item-${item.menuItem.id}`}
                >
                  <div className="student-cart-thumbnail">
                    {item.menuItem.imageUrl ? (
                      <img
                        src={getOptimizedImageUrl(item.menuItem.imageUrl, 240)}
                        alt={getItemName(item.menuItem)}
                        loading="lazy"
                        decoding="async"
                        width="240"
                        height="180"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                          event.currentTarget.parentElement?.setAttribute('data-image-fallback', 'true');
                        }}
                      />
                    ) : (
                      <span>{t('noImage')}</span>
                    )}
                  </div>

                  <div className="student-cart-item-details">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4>{getItemName(item.menuItem)}</h4>
                        <p>{formatCurrency(item.menuItem.price)}</p>
                      </div>
                      <p className="student-cart-item-total">
                        {formatCurrency(parseFloat(item.menuItem.price) * item.quantity)}
                      </p>
                    </div>

                    {item.customizations && (
                      <p className="student-cart-note">{t('cartNote')}: {item.customizations}</p>
                    )}

                    <div className="student-cart-controls">
                      <div className="student-quantity-control" aria-label={`${t('quantityFor')} ${getItemName(item.menuItem)}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          aria-label={`${t('decreaseItemQuantity')} ${getItemName(item.menuItem)}`}
                          data-testid={`button-decrease-${item.menuItem.id}`}
                        >
                          <Minus className="w-4 h-4" aria-hidden="true" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          aria-label={`${t('increaseItemQuantity')} ${getItemName(item.menuItem)}`}
                          data-testid={`button-increase-${item.menuItem.id}`}
                        >
                          <Plus className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="student-remove-button"
                        onClick={() => removeItem(item.menuItem.id)}
                        aria-label={`${t('removeItem')} ${getItemName(item.menuItem)}`}
                        data-testid={`button-remove-${item.menuItem.id}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <SheetFooter className="student-cart-footer flex-col gap-4">
              <div className="student-cart-summary w-full">
                <div>
                  <span>{t('subtotal')}</span>
                  <span data-testid="text-subtotal">{formatCurrency(getSubtotal())}</span>
                </div>
                <div>
                  <span>{t('tax')}</span>
                  <span data-testid="text-tax">{formatCurrency(getTax())}</span>
                </div>
                <div className="student-cart-total">
                  <span>{t('total')}</span>
                  <span data-testid="text-total">{formatCurrency(getTotal())}</span>
                </div>
              </div>
              <Button
                className="student-cart-checkout w-full"
                size="lg"
                onClick={handleCheckout}
                onPointerDown={() => preloadStudentPage('/checkout')}
                onMouseEnter={() => preloadStudentPage('/checkout')}
                onFocus={() => preloadStudentPage('/checkout')}
                data-testid="button-checkout"
              >
                {t('proceedToCheckout')}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
