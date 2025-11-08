import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import AdminSidebar from '@/components/admin/AdminSidebar';
import type { MenuItem, InsertMenuItem } from '@shared/schema';

const categories = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Beverages',
  'Snacks',
  'Desserts',
  'Salads',
  'Sandwiches',
  'Specials',
];

const dietaryTags = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'];

type MenuItemFormData = {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: string;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  isSpecial: boolean;
  specialPrice: string | null;
  preparationTime: number;
  dietaryTags: string[];
  allergens: string[];
  nutritionalInfo: unknown | null;
};

function MenuItemForm({
  item,
  onClose,
}: {
  item?: MenuItem;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: item?.name || '',
    nameAr: item?.nameAr || '',
    description: item?.description || '',
    descriptionAr: item?.descriptionAr || '',
    price: item?.price || '0.00',
    category: item?.category || 'Breakfast',
    imageUrl: item?.imageUrl || '',
    isAvailable: item?.isAvailable ?? true,
    isSpecial: item?.isSpecial || false,
    specialPrice: item?.specialPrice || null,
    preparationTime: item?.preparationTime || 15,
    dietaryTags: item?.dietaryTags || [],
    allergens: item?.allergens || [],
    nutritionalInfo: item?.nutritionalInfo || null,
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertMenuItem) => {
      const response = await apiRequest('POST', '/api/menu', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: 'Success',
        description: 'Menu item created successfully',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create menu item',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<MenuItem>) => {
      const response = await apiRequest('PATCH', `/api/menu/${item!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update menu item',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Convert form data to the correct format
    const submitData: InsertMenuItem = {
      name: formData.name,
      nameAr: formData.nameAr || undefined,
      description: formData.description || undefined,
      descriptionAr: formData.descriptionAr || undefined,
      price: formData.price,
      category: formData.category,
      imageUrl: formData.imageUrl || undefined,
      isAvailable: formData.isAvailable,
      isSpecial: formData.isSpecial,
      specialPrice: formData.specialPrice || undefined,
      preparationTime: formData.preparationTime,
      dietaryTags: formData.dietaryTags,
      allergens: formData.allergens,
      nutritionalInfo: formData.nutritionalInfo || undefined,
    };

    if (item) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDietaryToggle = (tag: string) => {
    const current = formData.dietaryTags || [];
    const updated = current.includes(tag)
      ? current.filter((t: string) => t !== tag)
      : [...current, tag];
    setFormData({ ...formData, dietaryTags: updated });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name (English) *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            data-testid="input-menu-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nameAr">Name (Arabic)</Label>
          <Input
            id="nameAr"
            value={formData.nameAr || ''}
            onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
            dir="rtl"
            data-testid="input-menu-name-ar"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (English)</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            data-testid="textarea-menu-description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descriptionAr">Description (Arabic)</Label>
          <Textarea
            id="descriptionAr"
            value={formData.descriptionAr || ''}
            onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
            dir="rtl"
            rows={3}
            data-testid="textarea-menu-description-ar"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger data-testid="select-menu-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (AED) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            data-testid="input-menu-price"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            type="url"
            value={formData.imageUrl || ''}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://..."
            data-testid="input-menu-image"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prepTime">Prep Time (minutes)</Label>
          <Input
            id="prepTime"
            type="number"
            min="1"
            value={formData.preparationTime || 15}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setFormData({ ...formData, preparationTime: isNaN(value) ? 15 : value });
            }}
            data-testid="input-menu-prep-time"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="isAvailable">Available for Order</Label>
            <p className="text-sm text-muted-foreground">
              Turn off to temporarily hide from menu
            </p>
          </div>
          <Switch
            id="isAvailable"
            checked={formData.isAvailable}
            onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
            data-testid="switch-menu-available"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="isSpecial">Special Item</Label>
            <p className="text-sm text-muted-foreground">Mark as today's special</p>
          </div>
          <Switch
            id="isSpecial"
            checked={formData.isSpecial}
            onCheckedChange={(checked) => setFormData({ ...formData, isSpecial: checked })}
            data-testid="switch-menu-special"
          />
        </div>

        {formData.isSpecial && (
          <div className="space-y-2">
            <Label htmlFor="specialPrice">Special Price (AED)</Label>
            <Input
              id="specialPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.specialPrice || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, specialPrice: value === '' ? null : value });
              }}
              placeholder="Leave empty to use regular price"
              data-testid="input-menu-special-price"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Dietary Information</Label>
        <div className="flex flex-wrap gap-2">
          {dietaryTags.map((tag) => (
            <Badge
              key={tag}
              variant={formData.dietaryTags?.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer hover-elevate"
              onClick={() => handleDietaryToggle(tag)}
              data-testid={`badge-dietary-${tag.toLowerCase()}`}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          data-testid="button-save-menu-item"
        >
          {item ? 'Update' : 'Create'} Menu Item
        </Button>
      </div>
    </form>
  );
}

export default function MenuManagementPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [createFormKey, setCreateFormKey] = useState(0);

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/menu/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    },
  });

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nameAr && item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading menu items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Menu Management</h1>
              <p className="text-muted-foreground">Create, edit, and manage menu items</p>
            </div>
            <Dialog 
              open={isCreateDialogOpen} 
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (open) {
                  setCreateFormKey(prev => prev + 1);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button data-testid="button-create-menu-item">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Menu Item</DialogTitle>
                  <DialogDescription>
                    Add a new item to the cafeteria menu
                  </DialogDescription>
                </DialogHeader>
                <MenuItemForm key={createFormKey} onClose={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-menu"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Menu Items Grid */}
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No menu items found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first menu item to get started'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.imageUrl && (
                    <div className="h-48 overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                        {item.nameAr && (
                          <p className="text-sm text-muted-foreground truncate" dir="rtl">
                            {item.nameAr}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Dialog
                          open={editingItem?.id === item.id}
                          onOpenChange={(open) => {
                            if (!open) setEditingItem(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingItem(item)}
                              data-testid={`button-edit-${item.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Menu Item</DialogTitle>
                              <DialogDescription>Update menu item details</DialogDescription>
                            </DialogHeader>
                            <MenuItemForm item={editingItem!} onClose={() => setEditingItem(null)} />
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(item.id, item.name)}
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {item.isSpecial && item.specialPrice ? (
                          <>
                            <span className="text-sm line-through text-muted-foreground">
                              {formatCurrency(parseFloat(item.price || '0'))}
                            </span>
                            <span className="text-lg font-bold text-vibrant-orange">
                              {formatCurrency(parseFloat(item.specialPrice || '0'))}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold">
                            {formatCurrency(parseFloat(item.price || '0'))}
                          </span>
                        )}
                      </div>
                      <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      {item.isSpecial && (
                        <Badge className="text-xs bg-vibrant-orange/10 text-vibrant-orange border-vibrant-orange/20">
                          Special
                        </Badge>
                      )}
                      {item.dietaryTags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
