import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, FilterX, Heart, AlertCircle, Info, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import type { MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, getOptimizedImageUrl } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { MENU_PAGE_SIZE, useMenuItems } from "@/hooks/useMenuItems";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const CATEGORIES = ["All", "Breakfast", "Lunch", "Regional Dishes", "Snacks", "Beverages"];

export default function MenuBrowser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [page, setPage] = useState(1);
  const itemDialogTriggerRef = useRef<HTMLButtonElement | null>(null);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  const { addItem } = useCart();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const getItemName = (item: MenuItem) =>
    language === "ar" && item.nameAr ? item.nameAr : item.name;

  const getItemDescription = (item: MenuItem) =>
    language === "ar" && item.descriptionAr
      ? item.descriptionAr
      : item.description;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      All: t("all"),
      Breakfast: t("breakfast"),
      Lunch: t("lunch"),
      "Regional Dishes": t("regionalDishes"),
      Snacks: t("snacks"),
      Beverages: t("beverages"),
    };
    return labels[category] ?? category;
  };

  const getNutritionLabel = (key: string) => {
    const labels: Record<string, string> = {
      carbs: t("carbs"),
      carbohydrates: t("carbs"),
      calories: t("calories"),
      fat: t("fat"),
      protein: t("protein"),
    };
    return labels[key.toLowerCase()] ?? key;
  };

  const getSizeLabel = (size: string) => {
    if (language !== "ar") return size;
    const labels: Record<string, string> = {
      small: t("small"),
      medium: t("medium"),
      large: t("large"),
      regular: t("regular"),
    };
    return labels[size.toLowerCase()] ?? size;
  };

  const getAllergenLabel = (allergen: string) => {
    if (language !== "ar") return allergen;
    const labels: Record<string, string> = {
      gluten: "الجلوتين",
      dairy: "منتجات الألبان",
      sesame: "السمسم",
      "tree nuts": "المكسرات الشجرية",
      peanuts: "الفول السوداني",
      eggs: "البيض",
      soy: "الصويا",
      fish: "السمك",
      shellfish: "المحار والقشريات",
    };
    return labels[allergen.toLowerCase()] ?? allergen;
  };

  const { data, isLoading, isFetching, isError, refetch } = useMenuItems({
    page,
    search: debouncedSearchQuery,
    category: selectedCategory,
  });
  const menuItems = data?.items ?? [];

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, selectedCategory]);

  const { data: favorites } = useQuery<number[]>({
    queryKey: ["/api/favorites"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  type FavoritePayload = { menuItemId: number; itemName: string };

  const invalidateFavorites = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["/api/favorites"],
        exact: true,
      }),
      queryClient.invalidateQueries({
        queryKey: ["/api/favorites/items"],
        exact: true,
      }),
    ]);
  };

  const addFavoriteMutation = useMutation<void, Error, FavoritePayload>({
    mutationFn: async ({ menuItemId }) => {
      await apiRequest("POST", "/api/favorites", { menuItemId });
    },
    onSuccess: async (_, variables) => {
      await invalidateFavorites();
      toast({
        title: t("addedToFavoritesTitle"),
        description: `${variables.itemName} ${t("addedToFavoritesDescription")}`,
      });
    },
    onError: (error) => {
      toast({
        title: t("unableAddFavorite"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation<void, Error, FavoritePayload>({
    mutationFn: async ({ menuItemId }) => {
      await apiRequest("DELETE", `/api/favorites/${menuItemId}`);
    },
    onSuccess: async (_, variables) => {
      await invalidateFavorites();
      toast({
        title: t("removedFromFavoritesTitle"),
        description: `${variables.itemName} ${t("removedFromFavoritesDescription")}`,
      });
    },
    onError: (error) => {
      toast({
        title: t("unableRemoveFavorite"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openItem = (item: MenuItem, trigger?: HTMLButtonElement) => {
    itemDialogTriggerRef.current = trigger ?? null;
    setSelectedItem(item);
    setQuantity(1);
    setCustomizations("");
    setSelectedSize("");
  };

  const closeItemDialog = () => {
    setSelectedItem(null);
    window.setTimeout(() => itemDialogTriggerRef.current?.focus(), 0);
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    if (!isAuthenticated) {
      setSelectedItem(null);
      setAuthPromptOpen(true);
      return;
    }

    addItem(
      selectedItem,
      quantity,
      customizations || undefined,
      selectedSize || undefined,
    );

    closeItemDialog();
    setQuantity(1);
    setCustomizations("");
    setSelectedSize("");
  };

  const handleFavoriteToggle = (item: MenuItem, isFavorite: boolean) => {
    const payload = { menuItemId: item.id, itemName: getItemName(item) };
    isFavorite
      ? removeFavoriteMutation.mutate(payload)
      : addFavoriteMutation.mutate(payload);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setPage(1);
  };

  if (isLoading) {
    return (
      <section className="menu-browser menu-shell" aria-labelledby="menu-browser-title">
        <div className="menu-loading-heading">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-full max-w-xl" />
        </div>
        <div className="menu-item-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-label={language === "ar" ? "جارٍ تحميل أصناف القائمة" : "Loading menu items"}>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="menu-card menu-card-skeleton">
              <Skeleton className="w-full aspect-[4/3] rounded-none" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="menu-browser" className="menu-browser menu-shell" aria-labelledby="menu-browser-title">
      <div className="menu-browser-heading">
        <div className="menu-browser-heading-copy">
          <p className="menu-kicker">{t("menuSectionKicker")}</p>
          <h2 id="menu-browser-title">{t("menuSectionTitle")}</h2>
          <p className="menu-browser-intro">
            {t("menuSectionDescription")}
          </p>
        </div>
      </div>

      <div className="menu-controls" role="search">
        <div className="menu-search-wrap">
          <Search className="menu-search-icon" aria-hidden="true" />
          <Input
            type="search"
            placeholder={t("searchMenu")}
            className="menu-search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            aria-label={t("searchMenuLabel")}
            data-testid="input-menu-search"
          />
        </div>

        <div className="menu-category-list" aria-label={t("menuSectionKicker")}>
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant="ghost"
              onClick={() => {
                setSelectedCategory(category);
                setPage(1);
              }}
              className={`menu-filter-pill ${selectedCategory === category ? "is-active" : ""}`}
              aria-pressed={selectedCategory === category}
              data-testid={`button-category-${category.toLowerCase()}`}
            >
              {getCategoryLabel(category)}
            </Button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="menu-state-card" role="alert">
          <div className="menu-state-icon" aria-hidden="true"><RefreshCw /></div>
          <h3>{t("loadMenuError")}</h3>
          <p>{t("notificationsLoadErrorHelp")}</p>
          <Button onClick={() => refetch()}>{t("tryAgain")}</Button>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="menu-state-card" role="status">
          <div className="menu-state-icon" aria-hidden="true"><FilterX /></div>
          <h3>{t("noItemsFound")}</h3>
          <p>{t("clearCurrentFilter")}</p>
          <Button variant="outline" onClick={clearFilters}>{t("clearFilters")}</Button>
        </div>
      ) : (
        <div className={`menu-results ${isFetching ? "is-fetching" : ""}`} aria-busy={isFetching}>
          <div className="menu-results-meta">
            <span>{t("availableItems")}: {data?.total ?? menuItems.length}</span>
            {isFetching && <span className="menu-fetching-label">{t("updatingResults")}</span>}
          </div>

          <div className="menu-item-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {menuItems.map((item, itemIndex) => {
              const isFavorite = favorites?.includes(item.id) ?? false;
              const isMutating =
                (addFavoriteMutation.isPending && addFavoriteMutation.variables?.menuItemId === item.id) ||
                (removeFavoriteMutation.isPending && removeFavoriteMutation.variables?.menuItemId === item.id);

              return (
                <Card
                  key={item.id}
                  className={`menu-card ${itemIndex === 0 ? "menu-card-featured" : ""}`}
                >
                  <button
                    type="button"
                    className="menu-card-details-button"
                    onClick={(event) => openItem(item, event.currentTarget)}
                    aria-label={`${t("itemDetails")}: ${getItemName(item)}`}
                  >
                    <div className="menu-card-image">
                      {Boolean(item.imageUrl) ? (
                        <img
                          src={getOptimizedImageUrl(item.imageUrl, 720)}
                          alt={getItemName(item)}
                          loading={itemIndex < 3 ? "eager" : "lazy"}
                          decoding="async"
                          width="720"
                          height="540"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            event.currentTarget.parentElement?.setAttribute("data-image-fallback", "true");
                          }}
                        />
                      ) : (
                        <span className="menu-image-fallback">{t("noImage")}</span>
                      )}
                    </div>

                    <CardHeader className="menu-card-header">
                      <div className="menu-card-title-row">
                        <div className="min-w-0">
                          <h3>{getItemName(item)}</h3>
                          {language === "ar" && item.nameAr && item.name !== item.nameAr && (
                            <p className="menu-card-secondary-name">{item.name}</p>
                          )}
                        </div>
                        <Badge className="menu-category-tag" variant="outline">{getCategoryLabel(item.category)}</Badge>
                      </div>
                      <p className="menu-card-description">{getItemDescription(item)}</p>
                    </CardHeader>
                  </button>

                  <CardFooter className="menu-card-footer">
                    <div className="menu-card-price-wrap">
                      {item.isSpecial && item.specialPrice ? (
                        <div className="menu-special-price">
                          <span>{formatCurrency(item.specialPrice)}</span>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      ) : (
                        <span className="menu-card-price">{formatCurrency(item.price)}</span>
                      )}
                      <span className="menu-card-prep">{item.preparationTime} {t("prepMinutes")}</span>
                    </div>

                    <div className="menu-card-actions">
                      {item.isSpecial && <span className="menu-special-label">{t("todaysSpecial")}</span>}
                      {isAuthenticated && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`menu-favorite-button ${isFavorite ? "is-favorite" : ""}`}
                          onClick={() => handleFavoriteToggle(item, isFavorite)}
                          disabled={isMutating}
                          aria-label={isFavorite ? `${t("removeFromFavorites")}: ${getItemName(item)}` : `${t("addToFavorites")}: ${getItemName(item)}`}
                        >
                          <Heart className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="menu-add-button"
                        onClick={(event) => openItem(item, event.currentTarget)}
                      >
                        {t("add")}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => {
          if (!open) closeItemDialog();
        }}
      >
        <DialogContent className="menu-item-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
          {!!selectedItem && (
            <>
              <DialogHeader className="menu-dialog-header">
                <p className="menu-kicker">{t("itemDetails")}</p>
                <DialogTitle>{getItemName(selectedItem)}</DialogTitle>
                <DialogDescription>{getItemDescription(selectedItem)}</DialogDescription>
              </DialogHeader>

              <div className="menu-dialog-body">
                {!!selectedItem.imageUrl && (
                  <div className="menu-dialog-image">
                    <img
                      src={getOptimizedImageUrl(selectedItem.imageUrl, 1024)}
                      alt={getItemName(selectedItem)}
                      loading="eager"
                      decoding="async"
                      width="1024"
                      height="768"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.parentElement?.setAttribute("data-image-fallback", "true");
                      }}
                    />
                  </div>
                )}

                {!!selectedItem.nutritionalInfo && (
                  <div className="menu-dialog-panel">
                    <div className="menu-dialog-panel-heading">
                      <Info className="w-5 h-5" aria-hidden="true" />
                      <h4>{t("nutritionalInformation")}</h4>
                    </div>
                    <div className="menu-nutrition-grid">
                      {Object.entries(selectedItem.nutritionalInfo as Record<string, number>).map(([key, value]) => (
                        <div key={key}>
                          <p>{getNutritionLabel(key)}</p>
                          <strong>
                            {value}{key.toLowerCase() === "calories"
                              ? (language === "ar" ? " سعرة حرارية" : " kcal")
                              : (language === "ar" ? " غ" : "g")}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!!(selectedItem.allergens && selectedItem.allergens.length > 0) && (
                  <div className="menu-allergen-panel">
                    <div className="menu-dialog-panel-heading">
                      <AlertCircle className="w-5 h-5" aria-hidden="true" />
                      <h4>{t("allergenWarning")}</h4>
                    </div>
                    <p>{t("containsLabel")} {selectedItem.allergens.map(getAllergenLabel).join("، ")}</p>
                  </div>
                )}

                {!!(selectedItem.dietaryTags && selectedItem.dietaryTags.length > 0) && (
                  <div className="menu-dietary-tags" aria-label={t("dietaryTags")}>
                    {selectedItem.dietaryTags.map((tag) => {
                      const label = tag.toLowerCase() === "vegetarian" ? t("vegetarian")
                        : tag.toLowerCase() === "vegan" ? t("vegan")
                        : tag.toLowerCase() === "halal" ? t("halal")
                        : tag;
                      return <Badge key={tag} variant="outline">{label}</Badge>;
                    })}
                  </div>
                )}

                {!!(selectedItem.sizeVariants && Array.isArray(selectedItem.sizeVariants) && selectedItem.sizeVariants.length > 0) && (
                  <div className="menu-dialog-field">
                    <label>{t("selectSize")}</label>
                    <div className="menu-size-grid">
                      {(selectedItem.sizeVariants as Array<{ name: string; priceModifier: string }>).map((variant) => {
                        const basePrice = Number(selectedItem.isSpecial && selectedItem.specialPrice ? selectedItem.specialPrice : selectedItem.price);
                        const sizePrice = basePrice + Number(variant.priceModifier);
                        return (
                          <Button
                            key={variant.name}
                            variant={selectedSize === variant.name ? "default" : "outline"}
                            className="menu-size-button"
                            onClick={() => setSelectedSize(variant.name)}
                          >
                            <span>{getSizeLabel(variant.name)}</span>
                            <small>{formatCurrency(sizePrice)}</small>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="menu-dialog-fields">
                  <div className="menu-dialog-field">
                    <label>{t("quantity")}</label>
                    <div className="student-quantity-control menu-dialog-quantity">
                      <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label={t("decreaseQuantity")}>-</Button>
                      <span>{quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)} aria-label={t("increaseQuantity")}>+</Button>
                    </div>
                  </div>

                  <div className="menu-dialog-field menu-dialog-customization">
                    <label htmlFor="menu-customizations">{t("specialInstructionsOptional")}</label>
                    <Input
                      id="menu-customizations"
                      placeholder={t("instructionsPlaceholder")}
                      value={customizations}
                      onChange={(e) => setCustomizations(e.target.value)}
                    />
                  </div>
                </div>

                <div className="menu-dialog-footer">
                  <div>
                    <p>{t("total")}</p>
                    <strong>
                      {(() => {
                        const basePrice = Number(selectedItem.isSpecial && selectedItem.specialPrice ? selectedItem.specialPrice : selectedItem.price);
                        let finalPrice = basePrice;
                        if (selectedSize && selectedItem.sizeVariants && Array.isArray(selectedItem.sizeVariants)) {
                          const variant = selectedItem.sizeVariants.find((v) => v.name === selectedSize);
                          if (variant) finalPrice += Number(variant.priceModifier);
                        }
                        return formatCurrency(finalPrice * quantity);
                      })()}
                    </strong>
                  </div>
                  <Button size="lg" className="menu-dialog-add" onClick={handleAddToCart}>{t("addToCart")}</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={authPromptOpen} onOpenChange={setAuthPromptOpen}>
        <DialogContent className="auth-gate-dialog max-w-md">
          <DialogHeader>
            <DialogTitle>{t("signInToOrder")}</DialogTitle>
            <DialogDescription>{t("accountRequiredForCart")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button className="auth-gate-browse" variant="outline" onClick={() => setAuthPromptOpen(false)}>
              {t("browseMenu")}
            </Button>
            <Button className="auth-gate-sign-up" variant="outline" onClick={() => setLocation("/register")}>
              {t("signUp")}
            </Button>
            <Button className="auth-gate-sign-in" onClick={() => setLocation("/login")}>
              {t("signIn")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {data && data.total > 0 && (
        <div className="menu-pagination" aria-live="polite">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1 || isFetching}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {t("previous")}
          </Button>
          <span>{t("page")} {page} {t("of")} {Math.max(1, Math.ceil(data.total / MENU_PAGE_SIZE))}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => current + 1)}
            disabled={!data.hasMore || isFetching}
          >
            {t("nextPage")}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </section>
  );
}
