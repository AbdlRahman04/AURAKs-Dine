import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Heart, AlertCircle, Info } from 'lucide-react';
import type { MenuItem } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, getCategoryColor } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages'];

export default function MenuBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { addItem } = useCart();
  const { language } = useLanguage();
  
  // Helper function to get localized item name with fallback
  const getItemName = (item: MenuItem) => {
    return language === 'ar' && item.nameAr ? item.nameAr : item.name;
  };
  
  // Helper function to get localized item description with fallback
  const getItemDescription = (item: MenuItem) => {
    return language === 'ar' && item.descriptionAr ? item.descriptionAr : item.description;
  };

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu'],
  });

  const { data: favorites } = useQuery<number[]>({
    queryKey: ['/api/favorites'],
  });

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];

    return menuItems.filter(item => {
      const itemName = getItemName(item);
      const itemDesc = getItemDescription(item);
      
      const matchesSearch =
        itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemDesc?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory && item.isAvailable;
    });
  }, [menuItems, searchQuery, selectedCategory, language]);

  const handleAddToCart = () => {
    if (selectedItem) {
      addItem(selectedItem, quantity, customizations || undefined, selectedSize || undefined);
      setSelectedItem(null);
      setQuantity(1);
      setCustomizations('');
      setSelectedSize('');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filter Bar */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search menu items..."
            className="pl-10 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-menu-search"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="snap-start flex-shrink-0"
              data-testid={`button-category-${category.toLowerCase()}`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter to find what you're looking for
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover-elevate cursor-pointer"
              onClick={() => setSelectedItem(item)}
              data-testid={`card-menu-item-${item.id}`}
            >
              {/* Image */}
              <div className="relative h-48 bg-muted">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={getItemName(item)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
                {item.isSpecial && (
                  <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                    Special Offer
                  </Badge>
                )}
                {favorites?.includes(item.id) && (
                  <Heart className="absolute top-2 right-2 w-6 h-6 text-red-500 fill-red-500" />
                )}
              </div>

              <CardHeader className="gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold line-clamp-1">{getItemName(item)}</h3>
                  <Badge className={getCategoryColor(item.category)} variant="secondary">
                    {item.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {getItemDescription(item)}
                </p>
              </CardHeader>

              <CardFooter className="flex items-center justify-between gap-4">
                <div>
                  {item.isSpecial && item.specialPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-destructive">
                        {formatCurrency(item.specialPrice)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-semibold">
                      {formatCurrency(item.price)}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {item.preparationTime} min
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item);
                  }}
                  data-testid={`button-add-${item.id}`}
                >
                  Add
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{getItemName(selectedItem)}</DialogTitle>
                <DialogDescription>{getItemDescription(selectedItem)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Image */}
                {selectedItem.imageUrl && (
                  <div className="relative h-64 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedItem.imageUrl}
                      alt={getItemName(selectedItem)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Nutritional Info */}
                {selectedItem.nutritionalInfo && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold">Nutritional Information</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      {Object.entries(selectedItem.nutritionalInfo as Record<string, number>).map(
                        ([key, value]) => (
                          <div key={key}>
                            <p className="text-muted-foreground capitalize">{key}</p>
                            <p className="font-medium">{value}g</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Allergens */}
                {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                        Allergen Warning
                      </h4>
                    </div>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Contains: {selectedItem.allergens.join(', ')}
                    </p>
                  </div>
                )}

                {/* Dietary Tags */}
                {selectedItem.dietaryTags && selectedItem.dietaryTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.dietaryTags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Size Selection */}
                {selectedItem.sizeVariants && Array.isArray(selectedItem.sizeVariants) && selectedItem.sizeVariants.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Select Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(selectedItem.sizeVariants as Array<{ name: string; priceModifier: string }>).map((variant) => {
                        const priceModifier = parseFloat(variant.priceModifier);
                        const basePrice = parseFloat(selectedItem.isSpecial && selectedItem.specialPrice
                          ? selectedItem.specialPrice
                          : selectedItem.price);
                        const sizePrice = basePrice + priceModifier;
                        
                        return (
                          <Button
                            key={variant.name}
                            variant={selectedSize === variant.name ? 'default' : 'outline'}
                            className="flex flex-col h-auto py-3"
                            onClick={() => setSelectedSize(variant.name)}
                            data-testid={`button-size-${variant.name.toLowerCase()}`}
                          >
                            <span className="font-semibold">{variant.name}</span>
                            <span className="text-xs opacity-80">
                              {formatCurrency(sizePrice)}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity and Customizations */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        data-testid="button-decrease-quantity"
                      >
                        -
                      </Button>
                      <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                        data-testid="button-increase-quantity"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Special Instructions (Optional)
                    </label>
                    <Input
                      placeholder="e.g., No onions, extra sauce..."
                      value={customizations}
                      onChange={(e) => setCustomizations(e.target.value)}
                      data-testid="input-customizations"
                    />
                  </div>
                </div>

                {/* Price and Add Button */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">
                      {(() => {
                        const basePrice = parseFloat(selectedItem.isSpecial && selectedItem.specialPrice
                          ? selectedItem.specialPrice
                          : selectedItem.price);
                        
                        let finalPrice = basePrice;
                        
                        // Add size modifier if size is selected
                        if (selectedSize && selectedItem.sizeVariants) {
                          const sizeVariants = selectedItem.sizeVariants as Array<{ name: string; priceModifier: string }>;
                          const selectedVariant = sizeVariants.find(v => v.name === selectedSize);
                          if (selectedVariant) {
                            finalPrice += parseFloat(selectedVariant.priceModifier);
                          }
                        }
                        
                        return formatCurrency(finalPrice * quantity);
                      })()}
                    </p>
                  </div>
                  <Button size="lg" onClick={handleAddToCart} data-testid="button-add-to-cart">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
