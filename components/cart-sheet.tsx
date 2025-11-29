"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus, ShoppingBag, Trash2, Zap, DollarSign, MapPin, Check, ArrowRight } from "lucide-react"
import type { CartItem } from "@/lib/mock-data"
import { useState } from "react"

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

// Helper to provide context on why a user should compare
const OTHER_STORE_COMPARE_DATA: Record<string, OtherStoreData[]> = {
  // p7: Classic Sourdough Loaf (Original Price: 8.5)
  'p7': [
    { store: 'Global Bakehouse', price: 6.99, metric: 'Industrial Yeast', stock: 'Medium' },
    { store: 'Mega-Mart Deli', price: 4.50, metric: 'Frozen & Thawed', stock: 'High' },
  ],
  // p3: Hanging Terrarium (Original Price: 45.0)
  'p3': [
    { store: 'Plant HQ Online', price: 50.00, metric: 'Plastic Bowl', stock: 'Medium' },
    { store: 'Amazon Home', price: 29.99, metric: 'Plastic & Fake Plants', stock: 'High' },
  ],
  // p13: Macramé Wall Hanging (Original Price: 65.0)
  'p13': [
    { store: 'Craft Chain', price: 59.00, metric: 'Synthetic Blend', stock: 'High' },
    { store: 'Etsy Reseller', price: 75.00, metric: 'Unknown Origin', stock: 'Low' },
  ],
  // p19: Raw Wildflower Honey (Original Price: 18.0)
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

// --- View 1: Review List Item ---

function CartItemReview({ item, removeItem, updateQuantity, isComparing, onToggleCompare }: { 
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
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-bold text-primary">${item.product.price.toFixed(2)}</p>
                    
                    {/* Explicit Compare Checkbox/Button Area */}
                    {isComparable && (
                        <div 
                            onClick={() => onToggleCompare(item.product.id)}
                            className={`cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-all select-none
                                ${isComparing 
                                    ? 'bg-primary/10 border-primary text-primary' 
                                    : 'bg-card border-border text-muted-foreground hover:bg-secondary'
                                }`}
                        >
                            <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${isComparing ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                {isComparing && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            Compare
                        </div>
                    )}
                </div>
            </div>

            {/* Quantity & Remove Controls */}
            <div className="flex flex-col items-end justify-between min-w-16 pl-2 border-l border-border/50 ml-1">
                <button
                    onClick={() => removeItem(item.product.id)}
                    className="w-6 h-6 rounded-full text-muted-foreground hover:text-destructive transition-colors mb-auto"
                    title="Remove item"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 mt-2">
                    <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- View 2: Compare Table ---

function CompareTable({ items, productsToCompare }: { items: CartItem[], productsToCompare: string[] }) {
    
    const itemsForComparison: CartItem[] = items.filter(item => productsToCompare.includes(item.product.id));
    
    // Safety check, though parent handles navigation
    if (itemsForComparison.length === 0) return null;

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
        <div className="space-y-8 pb-4">
            {Object.entries(groupedProducts).map(([productName, stores]) => (
                <div key={productName} className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                    <h3 className="text-xs font-bold bg-muted/50 p-3 text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                        <Zap className="w-3 h-3 text-primary" />
                        Comparing: {productName}
                    </h3>
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-full divide-y divide-border/50">
                            <thead>
                                <tr className="divide-x divide-border/50 bg-secondary/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                                    <th className="p-2 w-24 text-left font-medium">Source</th>
                                    <th className="p-2 text-right font-medium">Price</th>
                                    <th className="p-2 text-left font-medium">Metric</th>
                                    <th className="p-2 text-center font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 text-xs">
                                {stores.map((store, index) => (
                                    <tr 
                                        key={index} 
                                        className={`divide-x divide-border/50 ${store.isLocal ? 'bg-primary/5 font-semibold' : 'bg-card'}`}
                                    >
                                        <td className="p-2 flex items-center gap-1.5 text-left text-card-foreground">
                                            {store.isLocal ? <MapPin className="w-3 h-3 text-primary shrink-0" /> : <DollarSign className="w-3 h-3 text-muted-foreground shrink-0" />}
                                            <span className="line-clamp-1">{store.store}</span>
                                        </td>
                                        <td className="p-2 text-right text-card-foreground/90">
                                            ${store.price.toFixed(2)}
                                        </td>
                                        <td className="p-2 text-left text-card-foreground/80 text-[10px] leading-tight">
                                            {store.metric}
                                        </td>
                                        <td className="p-2 text-center text-[10px]">
                                            <span className={`font-medium px-1.5 py-0.5 rounded-full ${
                                                store.stock === 'High'
                                                    ? 'bg-green-100 text-green-700'
                                                    : store.stock === 'Medium'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-red-100 text-red-700'
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
            
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground text-center">
                <p className="font-semibold text-primary mb-1">Why Shop Local?</p>
                Comparison shows mass-market alternatives may be cheaper, but lack the specific quality metrics (Freshness, Material, Origin) found in your cart.
            </div>
        </div>
    )
}

// --- Main Cart Sheet Component ---

export function CartSheet({ open, onClose, onCheckout }: CartSheetProps) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()
  const [productsToCompare, setProductsToCompare] = useState<string[]>([]);
  // Steps: 'review' -> 'compare' -> CheckoutModal (triggered by parent)
  const [currentStep, setCurrentStep] = useState<'review' | 'compare'>('review');

  // Reset flow when cart opens/closes
  if (!open && currentStep !== 'review') {
      setTimeout(() => setCurrentStep('review'), 300); // Reset after animation
  }

  const toggleCompare = (productId: string) => {
    setProductsToCompare(prev => 
        prev.includes(productId) 
            ? prev.filter(id => id !== productId) 
            : [...prev, productId]
    );
  };

  const handleContinue = () => {
      if (currentStep === 'review') {
          // If no items selected for compare, auto-select all comparable items to reduce friction
          if (productsToCompare.length === 0) {
              const allComparableIds = items
                  .filter(item => OTHER_STORE_COMPARE_DATA[item.product.id])
                  .map(item => item.product.id);
              
              if (allComparableIds.length > 0) {
                  setProductsToCompare(allComparableIds);
                  setCurrentStep('compare');
              } else {
                  // Skip comparison if no data available for any item
                  onCheckout(); 
              }
          } else {
              setCurrentStep('compare');
          }
      } else {
          // In compare step, proceed to checkout
          onCheckout();
      }
  };

  const handleBack = () => {
      setCurrentStep('review');
  }

  if (!open) return null

  const isCartEmpty = items.length === 0;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            {currentStep === 'compare' && (
                <button onClick={handleBack} className="mr-1 hover:bg-secondary p-1 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
            )}
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-card-foreground">
                {currentStep === 'review' ? 'Review Cart' : 'Market Comparison'}
            </h2>
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
            <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* View Switcher */}
                    {currentStep === 'review' ? (
                        <>
                            <div className="flex items-center justify-between px-1 pb-2">
                                <p className="text-xs text-muted-foreground">Select items to compare with market prices.</p>
                            </div>
                            {items.map(item => (
                                <CartItemReview 
                                    key={item.product.id}
                                    item={item}
                                    removeItem={removeItem}
                                    updateQuantity={updateQuantity}
                                    isComparing={productsToCompare.includes(item.product.id)}
                                    onToggleCompare={toggleCompare}
                                />
                            ))}
                        </>
                    ) : (
                        <CompareTable 
                            items={items} 
                            productsToCompare={productsToCompare} 
                        />
                    )}
                </div>

                {/* Footer Action Area */}
                <div className="p-4 bg-card border-t border-border flex-shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-muted-foreground font-medium">Estimated Total</span>
                        <span className="text-2xl font-bold text-card-foreground">${totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <Button 
                        onClick={handleContinue} 
                        className="w-full h-12 text-base font-semibold shadow-md active:scale-[0.98] transition-transform"
                    >
                        {currentStep === 'review' ? (
                            <span className="flex items-center">
                                Compare & Continue <ArrowRight className="ml-2 w-4 h-4" />
                            </span>
                        ) : (
                            <span className="flex items-center">
                                Confirm & Checkout <Check className="ml-2 w-4 h-4" />
                            </span>
                        )}
                    </Button>
                    
                    {currentStep === 'review' && (
                        <p className="text-[10px] text-center text-muted-foreground mt-3 px-4">
                            You'll see a market comparison before finalizing your order.
                        </p>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  )
}

function ArrowLeft({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </svg>
    )
}