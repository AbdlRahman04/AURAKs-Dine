import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Package, Search } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMenuCard from '@/components/admin/AdminMenuCard';
import MenuImageDropzone from '@/components/admin/MenuImageDropzone';
import type { MenuItem, InsertMenuItem } from '@shared/schema';
import { MENU_PAGE_SIZE, useMenuItems } from '@/hooks/useMenuItems';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const categories = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Regional Dishes',
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
  unitCost: string;
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

type MenuImageAction = 'keep' | 'upload' | 'remove' | 'url';

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
    unitCost: item?.unitCost ?? '',
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState('');
  const [imageAction, setImageAction] = useState<MenuImageAction>('keep');

  const buildSubmission = (data: InsertMenuItem) => {
    const body = new FormData();
    body.append('data', JSON.stringify(data));
    body.append('imageAction', imageAction);
    if (selectedImage) body.append('image', selectedImage);
    return body;
  };

  const getMutationError = (error: unknown) => {
    if (!(error instanceof Error)) return 'The menu item could not be saved.';
    const rawMessage = error.message.replace(/^\d+:\s*/, '');
    try {
      const parsed = JSON.parse(rawMessage) as { message?: string };
      return parsed.message || rawMessage;
    } catch {
      return rawMessage;
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertMenuItem) => {
      const response = await apiRequest('POST', '/api/menu', buildSubmission(data));
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/menu'] });
      toast({
        title: 'Success',
        description: 'Menu item created successfully',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: getMutationError(error),
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<MenuItem>) => {
      const response = await apiRequest('PATCH', `/api/menu/${item!.id}`, buildSubmission(data as InsertMenuItem));
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/menu'] });
      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: getMutationError(error),
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
      unitCost: formData.unitCost.trim() ? formData.unitCost : null,
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

    if (imageAction === 'upload' && !selectedImage) {
      setImageError('Choose an image before saving, or remove the image selection.');
      return;
    }

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

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
    setImageError('');
    if (file) {
      setImageAction('upload');
      return;
    }
    setImageAction(item?.imageUrl ? 'remove' : 'keep');
    setFormData((current) => ({ ...current, imageUrl: '' }));
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="admin-menu-form space-y-6">
      <div className="admin-form-grid grid gap-4 md:grid-cols-2">
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
            <SelectContent className="admin-select-content">
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
          <Label htmlFor="unitCost">Unit cost (AED)</Label>
          <Input
            id="unitCost"
            type="number"
            step="0.01"
            min="0"
            value={formData.unitCost}
            onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
            placeholder="Leave blank if unknown"
            data-testid="input-menu-unit-cost"
          />
          <p className="text-xs text-muted-foreground">Used for gross contribution estimates; labor and overhead are excluded.</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Menu Image</Label>
          <MenuImageDropzone
            imageUrl={formData.imageUrl}
            selectedFile={selectedImage}
            disabled={createMutation.isPending || updateMutation.isPending}
            error={imageError}
            onFileChange={handleImageChange}
            onError={setImageError}
          />
          <Label htmlFor="imageUrl">Image URL fallback</Label>
          <Input
            id="imageUrl"
            type="url"
            value={formData.imageUrl || ''}
            disabled={Boolean(selectedImage)}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({ ...formData, imageUrl: value });
              setImageAction(value.trim() ? 'url' : (item ? 'remove' : 'keep'));
            }}
            placeholder="https://… or /menu-images/iced-latte.jpg"
            data-testid="input-menu-image"
          />
          <p className="text-xs text-muted-foreground">
            Uploads are preferred. Use a URL only for an existing hosted or bundled image.
          </p>
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

      <div className="admin-form-section space-y-4">
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

      <div className="admin-form-section space-y-2">
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

      <div className="admin-dialog-footer flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          data-testid="button-save-menu-item"
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Saving image...'
            : `${item ? 'Update' : 'Create'} Menu Item`}
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
  const [deletingItem, setDeletingItem] = useState<{ id: number; name: string } | null>(null);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [page, setPage] = useState(1);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  const { data, isLoading, isFetching } = useMenuItems({
    admin: true,
    page,
    search: debouncedSearchQuery,
    category: selectedCategory,
  });
  const menuItems = data?.items ?? [];

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, selectedCategory]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/menu/${id}`);
      return response.json() as Promise<{ archived?: boolean }>;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/menu'] });
      toast({
        title: 'Success',
        description: result.archived
          ? 'Item archived because it is used in historical orders.'
          : 'Menu item deleted successfully',
      });
      setDeletingItem(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: number, name: string) => {
    setDeletingItem({ id, name });
  };

  if (isLoading) {
    return (
      <div className="admin-shell flex min-h-screen">
        <AdminSidebar />
        <div className="admin-main flex-1 min-w-0 overflow-auto">
          <div className="admin-page-content p-6 space-y-6" aria-label="Loading menu management">
            <div className="admin-page-header flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-80" />
              </div>
              <Skeleton className="h-10 w-36" />
            </div>
            <div className="admin-menu-filters flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full sm:w-48" />
            </div>
            <div className="admin-menu-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="admin-menu-card overflow-hidden rounded-xl border bg-card">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="space-y-3 p-6">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="admin-main admin-menu-page flex-1 min-w-0 overflow-auto">
        <div className="admin-page-content p-6 space-y-6">
          {/* Header */}
          <div className="admin-page-header flex items-center justify-between">
            <div>
              <p className="admin-kicker">Catalog control</p>
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
              <DialogContent className="admin-dialog admin-dialog-form max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="admin-dialog-header">
                  <p className="admin-dialog-kicker">Catalog control</p>
                  <DialogTitle className="admin-dialog-title">Create New Menu Item</DialogTitle>
                  <DialogDescription className="admin-dialog-description">
                    Add a new item to the cafeteria menu
                  </DialogDescription>
                </DialogHeader>
                <MenuItemForm key={createFormKey} onClose={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>

            <Dialog
              open={editingItem !== null}
              onOpenChange={(open) => {
                if (!open) setEditingItem(null);
              }}
            >
              <DialogContent className="admin-dialog admin-dialog-form max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="admin-dialog-header">
                  <p className="admin-dialog-kicker">Catalog control</p>
                  <DialogTitle className="admin-dialog-title">Edit Menu Item</DialogTitle>
                  <DialogDescription className="admin-dialog-description">
                    Update menu item details
                  </DialogDescription>
                </DialogHeader>
                {editingItem && (
                  <MenuItemForm item={editingItem} onClose={() => setEditingItem(null)} />
                )}
              </DialogContent>
            </Dialog>

            <Dialog
              open={deletingItem !== null}
              onOpenChange={(open) => {
                if (!open && !deleteMutation.isPending) setDeletingItem(null);
              }}
            >
              <DialogContent className="admin-dialog admin-dialog-confirm max-w-md">
                <DialogHeader className="admin-dialog-header">
                  <p className="admin-dialog-kicker admin-dialog-kicker-danger">Archive or remove</p>
                  <DialogTitle className="admin-dialog-title">Delete menu item?</DialogTitle>
                  <DialogDescription className="admin-dialog-description">
                    Are you sure you want to delete{' '}
                    <span className="font-medium text-foreground">{deletingItem?.name}</span>?{' '}
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="admin-dialog-footer">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeletingItem(null)}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => deletingItem && deleteMutation.mutate(deletingItem.id)}
                    disabled={!deletingItem || deleteMutation.isPending}
                    data-testid="button-confirm-delete"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete item'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="admin-menu-filters flex flex-col sm:flex-row gap-4">
            <div className="admin-menu-search flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
                data-testid="input-search-menu"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="admin-select-content">
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
          {menuItems.length === 0 ? (
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
            <div className="admin-menu-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <AdminMenuCard
                  key={item.id}
                  item={item}
                  onEdit={setEditingItem}
                  onDelete={(menuItem) => handleDelete(menuItem.id, menuItem.name)}
                />
              ))}
            </div>
          )}

          {data && data.total > 0 && (
            <div className="flex items-center justify-center gap-4" aria-live="polite">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1 || isFetching}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.max(1, Math.ceil(data.total / MENU_PAGE_SIZE))}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
                disabled={!data.hasMore || isFetching}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
