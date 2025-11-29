import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  onAddToCart?: () => void;
}

export function ProductCard({
  name,
  price,
  originalPrice,
  image,
  category,
  isNew = false,
  onAddToCart,
}: ProductCardProps) {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card className="overflow-hidden group hover:border-primary/50 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge variant="glow" className="text-xs">
              NEW
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="secondary" className="text-xs">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Campus discount badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="accent" className="text-xs">
            Campus Price
          </Badge>
        </div>

        {/* Quick add overlay */}
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button variant="glow" onClick={onAddToCart}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{category}</p>
        <h3 className="font-display font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg text-foreground">₹{price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
