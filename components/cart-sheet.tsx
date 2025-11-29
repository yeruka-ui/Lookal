"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus, ShoppingBag, Trash2, Zap, DollarSign, MapPin, Check, ChevronRight } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { CartItem } from "@/lib/mock-data"
import { useState, useEffect } from "react"

interface CartSheetProps {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

// --- GSM Arena Style Comparison Mock Data Types & Data ---
type StockStatus = 'High' | 'Medium' | 'Low' | 'Out';

interface OtherStoreData {
  store: string
  price: number
  metric: string // Key differentiator metric
  stock: StockStatus
}

interface AllProductComparison extends OtherStoreData { 
    isLocal: boolean; 
    id: string;
}

const OTHER_STORE_COMPARE_DATA: Record<string, OtherStoreData[]> = {
  // p7: Classic Sourdough Loaf (Original Price: 8.5) - Local metric: "Natural fermentation"
  'p7': [
    { store: 'Global Bakehouse', price: 6.99, metric: 'Industrial Yeast', stock: 'Medium' },
    { store: 'Mega-Mart Deli', price: 4.50, metric: 'Frozen & Thawed', stock: 'High' },
  ],
  // p3: Hanging Terrarium (Original Price: 45.0) - Local metric: "Hand-blown glass"
  'p3': [
    { store: 'Plant HQ Online', price: 50.00, metric: 'Plastic Bowl', stock: 'Medium' },
    { store: 'Amazon Home', price: 29.99, metric: 'Plastic & Fake Plants', stock: 'High' },
  ],
  // p13: Macramé Wall Hanging (Original Price: 65.0) - Local metric: "100% cotton"
  'p13': [
    { store: 'Craft Chain', price: 59.00, metric: 'Synthetic Blend', stock: 'High' },
    { store: 'Etsy Reseller', price: 75.00, metric: 'Unknown Origin', stock: 'Low' },
  ],
  // p19: Raw Wildflower Honey (Original Price: 18.0) - Local metric: "Unfiltered, Local Wildflower"
  'p19': [
    { store: 'Supermarket', price: 10.99, metric: 'Pasteurized, Imported', stock: 'High' },
    { store: 'Wholesale Club', price: 15.00, metric: 'Blended Honey', stock: 'Medium' },
  ]
};

function getProductMetric(item: CartItem): string {
    if (item.product.id === 'p7') return "Natural fermentation";
    if (item.product.id === 'p3') return "Hand-blown glass, Air plants";
    if (item.product.id === 'p13') return "100% cotton, Driftwood";
    if (item.product.id === 'p19') return "Unfiltered, Local Wildflower";

    const defaultDetails = item.product.details.join(', ') || item.product.description;
    return item.product.details[0] || defaultDetails.substring(0, 30) + (defaultDetails.length > 30 ? '...' : '');
}

// --- Cart Item View Component with Compare Button ---

function CartItemView({ item, removeItem, updateQuantity, isComparing, onToggleCompare }: { 
    item: CartItem, 
    removeItem: (id: string) => void, 
    updateQuantity: (id: string, quantity: number) => void,
    isComparing: boolean,
    onToggleCompare: (id: string) => void
}) {
    const isComparable = !!OTHER_STORE_COMPARE_DATA[item.product.id];
    
    return (
        <div key={item.product.id} className="flex gap-3 p-3 bg-secondary/50 rounded-xl">
            <img
                src={item.product.image || "/placeholder.svg"}
                alt={item.product.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-card-foreground truncate">{item.product.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{item.shop.name}</p>
                <p className="text-sm font-bold text-primary mt-1">${item.product.price.toFixed(2)}</p>
            </div>

            {/* Controls and Compare Button */}
            <div className="flex flex-col items-end justify-between min-w-20">
                {/* Compare Button */}
                {isComparable ? (
                    <button
                        onClick={() => onToggleCompare(item.product.id)}
                        className={`w-12 h-6 rounded-full flex items-center justify-center transition-colors text-[10px] font-semibold border ${isComparing ? 'bg-primary text-primary-foreground border-primary/50' : 'bg-card text-muted-foreground hover:bg-secondary border-border'}`}
                        title={isComparing ? "Remove from Compare" : "Add to Compare"}
                    >
                        <Zap className={`w-3 h-3 mr-1 ${isComparing ? 'text-primary-foreground' : 'text-primary'}`} />
                        {isComparing ? 'COMPARING' : 'COMPARE'}
                    </button>
                ) : (
                     <div className="w-12 h-6 flex items-center justify-center text-[10px] text-muted-foreground/60">
                        N/A
                    </div>
                )}


                <div className="flex items-center gap-2">
                    <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="size-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                        title="Decrease quantity"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="size-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                        title="Increase quantity"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => removeItem(item.product.id)}
                        className="size-7 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                        title="Remove item"
                    >
                        <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Compare Table Component ---

function CompareTable({ items, productsToCompare }: { items: CartItem[], productsToCompare: string[] }) {
    
    const itemsForComparison: CartItem[] = items.filter(item => productsToCompare.includes(item.product.id));
    
    if (itemsForComparison.length === 0) {
        return <div className="text-center text-muted-foreground py-8 px-4">Click the <Zap className="w-3 h-3 inline text-primary mx-1" /> **COMPARE** button next to items in your cart to build a comparison list.</div>;
    }

    const allComparisonData: AllProductComparison[] = itemsForComparison.flatMap(item => {
        const localStockStatus: StockStatus = item.product.inStock ? 'High' : 'Out';
        
        const localItem: AllProductComparison = { 
            store: item.shop.name, 
            price: item.product.price, 
            metric: getProductMetric(item), 
            stock: localStockStatus, 
            isLocal: true,
            id: item.product.id
        };

        const otherItems = OTHER_STORE_COMPARE_DATA[item.product.id]?.map(other => ({ 
            ...other, 
            isLocal: false,
            id: item.product.id
        })) || [];

        return [localItem, ...otherItems];
    });

    const groupedProducts = itemsForComparison.reduce((acc, item) => {
        if (!acc[item.product.name]) {
            acc[item.product.name] = [];
        }
        acc[item.product.name].push(...allComparisonData.filter(p => p.id === item.product.id));
        
        acc[item.product.name] = acc[item.product.name].filter((v, i, a) => 
            a.findIndex(t => (t.store === v.store && t.price === v.price)) === i
        );
        return acc;
    }, {} as Record<string, AllProductComparison[]>);


    return (
        <div className="space-y-6">
            {Object.entries(groupedProducts).map(([productName, stores]) => (
                <div key={productName} className="border border-border rounded-xl overflow-hidden shadow-lg">
                    <h3 className="text-sm font-bold bg-secondary p-3 text-card-foreground/90 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        COMPARING: {productName.toUpperCase()}
                    </h3>
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-full divide-y divide-border/80">
                            <thead>
                                <tr className="divide-x divide-border/80 bg-background/50 text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="p-3 w-20 text-left font-medium">Store</th>
                                    <th className="p-3 text-right font-medium">Price</th>
                                    <th className="p-3 text-left font-medium">Key Metric</th>
                                    <th className="p-3 text-center font-medium">Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/80 text-sm">
                                {stores.map((store, index) => (
                                    <tr 
                                        key={index} 
                                        className={`divide-x divide-border/80 ${store.isLocal ? 'bg-primary/10 font-semibold' : 'bg-card'}`}
                                    >
                                        <td className="p-3 flex items-center gap-1 text-left text-card-foreground">
                                            {store.isLocal ? <MapPin className="w-3 h-3 text-primary" /> : <DollarSign className="w-3 h-3 text-muted-foreground" />}
                                            {store.store}
                                        </td>
                                        <td className="p-3 text-right text-card-foreground/90">
                                            ${store.price.toFixed(2)}
                                        </td>
                                        <td className="p-3 text-left text-card-foreground/80 text-xs">
                                            {store.metric}
                                        </td>
                                        <td className="p-3 text-center text-xs">
                                            <span className={`font-medium ${
                                                store.stock === 'High'
                                                    ? 'text-primary'
                                                    : store.stock === 'Medium'
                                                        ? 'text-amber-600'
                                                        : store.stock === 'Low'
                                                            ? 'text-destructive'
                                                            : 'text-muted-foreground'
                                            }`}>
                                                {store.stock}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                </div>
            ))}
            {itemsForComparison.length > 0 && (
                <div className="text-center p-4 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
                    <Check className="w-4 h-4 inline-block mr-1 text-primary" />
                    Local market products are generally priced higher but feature superior metrics like "Natural fermentation" or "100% cotton".
                </div>
            )}
        </div>
    )
}

// --- Main Cart Sheet Component ---

export function CartSheet({ open, onClose, onCheckout }: CartSheetProps) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()
  const [productsToCompare, setProductsToCompare] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("cart");
  const [hasViewedCompare, setHasViewedCompare] = useState(false); // Track view for mandatory step

  // Effect to mark as viewed when the tab is changed to 'compare'
  useEffect(() => {
    if (activeTab === 'compare') {
        setHasViewedCompare(true);
    }
  }, [activeTab]);

  const toggleCompare = (productId: string) => {
    setProductsToCompare(prev => {
        const isCurrentlyComparing = prev.includes(productId);
        const nextState = isCurrentlyComparing
            ? prev.filter(id => id !== productId)
            : [...prev, productId];
        
        // Auto-switch to the compare tab if the user adds an item
        if (!isCurrentlyComparing && activeTab !== 'compare') {
            setActiveTab('compare');
        }
        return nextState;
    });
  };
  
  const handleProceedToCheckout = () => {
    if (items.length === 0) return;

    if (!hasViewedCompare) {
        // Enforce comparison view: switch tab and show alert
        setActiveTab('compare');
        alert("Please review your items on the 'Compare' tab before checking out to ensure you're making the right decision!");
        return;
    }
    // Proceed if the check is passed
    onCheckout();
  }


  if (!open) return null

  const isCartEmpty = items.length === 0;
  const isCheckoutDisabled = isCartEmpty || !hasViewedCompare; // Checkout now requires viewing the compare tab

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header (Contains synced totalItems) */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-card-foreground">Your Cart</h2>
            {totalItems > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {isCartEmpty ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-1">Cart is empty</h3>
                <p className="text-sm text-muted-foreground">Swipe right on products to add them!</p>
            </div>
        ) : (
             <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
                <TabsList className="mx-4 mt-4 flex-shrink-0">
                    <TabsTrigger value="cart" className="flex-1">
                        Review Cart
                    </TabsTrigger>
                    <TabsTrigger value="compare" className="flex-1">
                        Compare ({productsToCompare.length})
                        {/* Visual warning when the compare tab has not been viewed */}
                        {!hasViewedCompare && (
                            <ChevronRight className="w-4 h-4 text-destructive ml-1 animate-pulse" />
                        )}
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="cart" className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.map(item => (
                        <CartItemView 
                            key={item.product.id}
                            item={item}
                            removeItem={removeItem}
                            updateQuantity={updateQuantity}
                            isComparing={productsToCompare.includes(item.product.id)}
                            onToggleCompare={toggleCompare}
                        />
                    ))}
                </TabsContent>
                
                <TabsContent value="compare" className="flex-1 overflow-y-auto p-4 space-y-4">
                    <CompareTable 
                        items={items} 
                        productsToCompare={productsToCompare} 
                    />
                </TabsContent>

                {/* The checkout button in the footer */}
                <div className="p-4 bg-card border-t border-border flex-shrink-0">
                    {!hasViewedCompare && (
                        <div className="flex items-center text-sm font-medium text-destructive mb-3 p-2 bg-destructive/10 rounded-lg">
                            <Zap className="w-4 h-4 mr-2" />
                            Review the "Compare" tab before checkout.
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-2xl font-bold text-card-foreground">${totalPrice.toFixed(2)}</span>
                    </div>
                    <Button 
                        onClick={handleProceedToCheckout} 
                        className="w-full h-12 text-base font-semibold"
                        disabled={isCheckoutDisabled}
                    >
                        Checkout
                    </Button>
                </div>
            </Tabs>
        )}
      </div>
    </div>
  )
}