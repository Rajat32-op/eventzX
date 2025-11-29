import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Filter, Sparkles } from "lucide-react";
import { mockProducts } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "all", name: "All" },
  { id: "posters", name: "Posters" },
  { id: "t-shirts", name: "T-Shirts" },
  { id: "books", name: "Books" },
];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartCount, setCartCount] = useState(0);
  const { toast } = useToast();

  const handleAddToCart = (name: string) => {
    setCartCount((prev) => prev + 1);
    toast({
      title: "Added to cart! 🛒",
      description: `"${name}" has been added to your cart.`,
    });
  };

  const filteredProducts =
    activeCategory === "all"
      ? mockProducts
      : mockProducts.filter((p) =>
          p.category.toLowerCase().includes(activeCategory.replace("-", " "))
        );

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">
                  Spiritual Shop
                </h1>
                <p className="text-xs text-muted-foreground">
                  Curated for campus souls
                </p>
              </div>
            </div>

            {/* Cart */}
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-10 pr-10" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 py-6">
        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 gradient-primary p-6">
          <div className="relative z-10">
            <Badge variant="secondary" className="mb-2">
              Campus Special
            </Badge>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              20% Off for Students
            </h2>
            <p className="text-foreground/80 text-sm mb-4">
              Use code CAMPUS20 at checkout
            </p>
            <Button variant="glass" size="sm">
              Shop Now
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-secondary/20 rounded-full blur-2xl" />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={activeCategory === category.id ? "default" : "interest"}
              className="cursor-pointer whitespace-nowrap shrink-0"
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard
                {...product}
                onAddToCart={() => handleAddToCart(product.name)}
              />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
