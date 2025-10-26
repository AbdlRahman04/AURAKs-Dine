import { useQuery, useMutation } from '@tanstack/react-query';
import { Heart, ShoppingBag } from 'lucide-react';
import type { MenuItem } from '@shared/schema';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, getCategoryColor } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import StudentHeader from '@/components/student/StudentHeader';

export default function FavoritesPage() {
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: favorites, isLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/favorites/items'],
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (menuItemId: number) => {
      await apiRequest('DELETE', `/api/favorites/${menuItemId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: 'Removed from Favorites',
        description: 'Item has been removed from your favorites.',
      });
    },
  });

  const handleAddToCart = (item: MenuItem) => {
    addItem(item, 1);
    toast({
      title: 'Added to Cart',
      description: `${item.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
          <p className="text-muted-foreground">
            Quick access to your favorite menu items
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <Card key={item.id} className="overflow-hidden hover-elevate" data-testid={`card-favorite-${item.id}`}>
                {/* Image */}
                <div className="relative h-48 bg-muted">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur hover:bg-background"
                    onClick={() => removeFavoriteMutation.mutate(item.id)}
                    data-testid={`button-unfavorite-${item.id}`}
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </Button>
                </div>

                <CardHeader className="gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold line-clamp-1">{item.name}</h3>
                    <Badge className={getCategoryColor(item.category)} variant="secondary">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </CardHeader>

                <CardFooter className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-lg font-semibold">
                      {formatCurrency(item.price)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {item.preparationTime} min
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.isAvailable}
                    data-testid={`button-add-${item.id}`}
                  >
                    {item.isAvailable ? (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        Add
                      </>
                    ) : (
                      'Unavailable'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Heart items from the menu to add them to your favorites
            </p>
            <Button onClick={() => window.location.href = '/menu'} data-testid="button-browse-menu">
              Browse Menu
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
