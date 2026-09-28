import { memo } from "react";
import { Edit, Trash2, Clock3 } from "lucide-react";
import type { MenuItem } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getOptimizedImageUrl } from "@/lib/utils";

type AdminMenuCardProps = {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
};

function AdminMenuCard({ item, onEdit, onDelete }: AdminMenuCardProps) {
  return (
    <Card className="admin-menu-card overflow-hidden">
      <div className="admin-menu-card-image">
        {item.imageUrl ? (
          <img
            src={getOptimizedImageUrl(item.imageUrl, 640)}
            alt={item.name}
            loading="lazy"
            decoding="async"
            width="640"
            height="480"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.parentElement?.setAttribute("data-image-fallback", "true");
            }}
          />
        ) : (
          <span>No image</span>
        )}
      </div>

      <CardHeader className="admin-menu-card-header pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="admin-card-kicker">{item.category}</p>
            <CardTitle className="text-lg truncate">{item.name}</CardTitle>
            {item.nameAr && (
              <p className="text-sm text-muted-foreground truncate" dir="rtl">{item.nameAr}</p>
            )}
          </div>
          <div className="admin-menu-card-actions">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(item)}
              aria-label={`Edit ${item.name}`}
              data-testid={`button-edit-${item.id}`}
            >
              <Edit className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(item)}
              aria-label={`Delete ${item.name}`}
              data-testid={`button-delete-${item.id}`}
            >
              <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="admin-menu-card-content space-y-3">
        {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}

        <div className="admin-menu-card-price-row">
          <div className="flex flex-col">
            {item.isSpecial && item.specialPrice ? (
              <>
                <span className="text-sm line-through text-muted-foreground">{formatCurrency(parseFloat(item.price || "0"))}</span>
                <span className="text-lg font-bold admin-price-accent">{formatCurrency(parseFloat(item.specialPrice || "0"))}</span>
              </>
            ) : (
              <span className="text-lg font-bold">{formatCurrency(parseFloat(item.price || "0"))}</span>
            )}
          </div>
          <Badge className="admin-availability-badge" variant={item.isAvailable ? "default" : "secondary"}>
            {item.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>

        <div className="admin-menu-card-meta">
          <span><Clock3 aria-hidden="true" /> {item.preparationTime} min prep</span>
          {item.isSpecial && <span className="admin-special-label">Today&apos;s special</span>}
        </div>

        <div className="flex flex-wrap gap-1">
          {item.dietaryTags?.map((tag: string) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(AdminMenuCard);
