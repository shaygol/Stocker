import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, TrendingDown, DollarSign, ShoppingCart } from "lucide-react";
import { useState, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";

interface PriceEntry {
  storeName: string;
  price: number;
}

interface ItemPrices {
  itemId: number;
  itemName: string;
  prices: PriceEntry[];
}

export default function PriceComparison() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [, params] = useRoute("/lists/:id/compare");
  const [, navigate] = useLocation();
  
  const listId = params?.id ? parseInt(params.id) : null;
  const [itemPrices, setItemPrices] = useState<ItemPrices[]>([]);
  const [isAddPriceOpen, setIsAddPriceOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [storeName, setStoreName] = useState("");
  const [price, setPrice] = useState("");

  const { data: list } = trpc.lists.getById.useQuery(
    { id: listId || 0 },
    { enabled: !!listId && isAuthenticated }
  );

  const { data: items } = trpc.items.getByListId.useQuery(
    { listId: listId || 0 },
    { enabled: !!listId && isAuthenticated }
  );

  const { data: stores } = trpc.stores.getForLocation.useQuery(
    { country: "US" },
    { enabled: isAuthenticated }
  );

  const { data: allPrices } = trpc.prices.getByItemId.useQuery(
    { itemId: selectedItemId || 0 },
    { enabled: !!selectedItemId && isAuthenticated }
  );

  const addPriceMutation = trpc.prices.add.useMutation({
    onSuccess: () => {
      setIsAddPriceOpen(false);
      setStoreName("");
      setPrice("");
      setSelectedItemId(null);
      toast.success(t('message.priceAdded'));
    },
    onError: (error: any) => {
      toast.error(`Failed to add price: ${error.message}`);
    },
  });

  const handleAddPrice = () => {
    if (!selectedItemId || !storeName.trim() || !price.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    
    const priceInCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    addPriceMutation.mutate({
      itemId: selectedItemId,
      storeName,
      price: priceInCents,
      currency: "USD",
    });
  };

  // Calculate comparison statistics
  const comparisonData = useMemo(() => {
    if (!items) return [];

    return items.map((item) => {
      const itemPriceData: PriceEntry[] = [];
      
      // In a real app, we'd fetch prices for each item
      // For now, we'll show the structure
      
      return {
        itemId: item.id,
        itemName: item.name,
        prices: itemPriceData,
      };
    });
  }, [items]);

  // Calculate totals by store
  const storeComparison = useMemo(() => {
    if (!items || items.length === 0) return {};

    const storeTotals: Record<string, { total: number; itemCount: number }> = {};
    
    items.forEach((item) => {
      // In a real implementation, we'd aggregate prices from the database
      // This is the structure for the comparison
    });

    return storeTotals;
  }, [items]);

  if (!listId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container max-w-6xl">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lists
          </Button>
          <div className="text-center py-12">
            <p className="text-gray-600">Invalid list ID</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container max-w-6xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(`/lists/${listId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('title.priceComparison')}
          </h1>
          <p className="text-gray-600">
            {list?.name ? `Comparing prices for "${list.name}"` : "Compare prices across stores"}
          </p>
        </div>

        {!items || items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">{t('message.noItems')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Add Price Dialog */}
            <Dialog open={isAddPriceOpen} onOpenChange={setIsAddPriceOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Price
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('title.addPrice')}</DialogTitle>
                  <DialogDescription>Add price information for items</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-select">Select Item</Label>
                    <select
                      id="item-select"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={selectedItemId || ""}
                      onChange={(e) => setSelectedItemId(parseInt(e.target.value))}
                    >
                      <option value="">Choose an item...</option>
                      {items?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-select">Store Name</Label>
                    <select
                      id="store-select"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                    >
                      <option value="">Choose a store...</option>
                      {stores?.map((store) => (
                        <option key={store} value={store}>
                          {store}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price-input">Price ($)</Label>
                    <Input
                      id="price-input"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddPriceOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPrice}
                    disabled={addPriceMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {addPriceMutation.isPending ? "Adding..." : "Add Price"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Items with Price Comparison */}
            <div className="grid gap-4">
              {items?.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      {item.name}
                    </CardTitle>
                    <CardDescription>
                      {item.quantity} {item.unit || "unit"}
                      {item.notes && ` • ${item.notes}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                        {stores?.map((store) => (
                          <div
                            key={store}
                            className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-600">{store}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              <span className="text-sm">$</span>
                              <span>0.00</span>
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => {
                                setSelectedItemId(item.id);
                                setStoreName(store);
                                setIsAddPriceOpen(true);
                              }}
                            >
                              Add/Edit
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Price Summary */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Cheapest</p>
                            <p className="text-lg font-bold text-green-600">$0.00</p>
                            <p className="text-xs text-gray-500">-</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Average</p>
                            <p className="text-lg font-bold text-gray-900">$0.00</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Most Expensive</p>
                            <p className="text-lg font-bold text-red-600">$0.00</p>
                            <p className="text-xs text-gray-500">-</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Store Total Comparison */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                  Total Cost by Store
                </CardTitle>
                <CardDescription>
                  Complete shopping cost comparison across all stores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {stores?.map((store) => (
                    <div
                      key={store}
                      className="p-4 rounded-lg bg-white border border-blue-200 hover:border-blue-400 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-600">{store}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        <span className="text-lg">$</span>
                        <span>0.00</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {items?.length || 0} items
                      </p>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-green-600">
                          Save 0% vs most expensive
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Savings Summary */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  Potential Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Cheapest Option</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">$0.00</p>
                    <p className="text-xs text-gray-500 mt-1">at -</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Most Expensive</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">$0.00</p>
                    <p className="text-xs text-gray-500 mt-1">at -</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">You Could Save</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">$0.00</p>
                    <p className="text-xs text-gray-500 mt-1">0%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
