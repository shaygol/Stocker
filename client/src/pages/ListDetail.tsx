import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, DollarSign, Plus, ShoppingCart, Trash2, BarChart3 } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";

export default function ListDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const listId = parseInt(params.id || "0");

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isAddPriceDialogOpen, setIsAddPriceDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemUnit, setItemUnit] = useState("");
  const [itemNotes, setItemNotes] = useState("");

  const [storeName, setStoreName] = useState("");
  const [price, setPrice] = useState("");

  const { data: list, isLoading: listLoading } = trpc.lists.getById.useQuery(
    { id: listId },
    { enabled: isAuthenticated && listId > 0 }
  );

  const { data: items, isLoading: itemsLoading } = trpc.items.getByListId.useQuery(
    { listId },
    { enabled: isAuthenticated && listId > 0 }
  );

  const utils = trpc.useUtils();

  const createItemMutation = trpc.items.create.useMutation({
    onSuccess: () => {
      utils.items.getByListId.invalidate({ listId });
      setIsAddItemDialogOpen(false);
      resetItemForm();
      toast.success("Item added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add item: " + error.message);
    },
  });

  const updateItemMutation = trpc.items.update.useMutation({
    onSuccess: () => {
      utils.items.getByListId.invalidate({ listId });
    },
    onError: (error) => {
      toast.error("Failed to update item: " + error.message);
    },
  });

  const deleteItemMutation = trpc.items.delete.useMutation({
    onSuccess: () => {
      utils.items.getByListId.invalidate({ listId });
      toast.success("Item deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete item: " + error.message);
    },
  });

  const addPriceMutation = trpc.prices.add.useMutation({
    onSuccess: () => {
      setIsAddPriceDialogOpen(false);
      setSelectedItemId(null);
      setStoreName("");
      setPrice("");
      toast.success("Price added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add price: " + error.message);
    },
  });

  const resetItemForm = () => {
    setItemName("");
    setItemQuantity("1");
    setItemUnit("");
    setItemNotes("");
  };

  const handleAddItem = () => {
    if (!itemName.trim()) {
      toast.error("Please enter an item name");
      return;
    }
    const qty = parseInt(itemQuantity);
    if (isNaN(qty) || qty < 1) {
      toast.error("Please enter a valid quantity");
      return;
    }
    createItemMutation.mutate({
      listId,
      name: itemName,
      quantity: qty,
      unit: itemUnit || undefined,
      notes: itemNotes || undefined,
    });
  };

  const handleTogglePurchased = (itemId: number, currentStatus: number) => {
    updateItemMutation.mutate({
      id: itemId,
      listId,
      isPurchased: currentStatus === 1 ? 0 : 1,
    });
  };

  const handleDeleteItem = (itemId: number, itemName: string) => {
    if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
      deleteItemMutation.mutate({ id: itemId, listId });
    }
  };

  const handleAddPrice = () => {
    if (!selectedItemId) return;
    if (!storeName.trim()) {
      toast.error("Please enter a store name");
      return;
    }
    const priceInCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInCents) || priceInCents < 0) {
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

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (listLoading || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 animate-pulse mx-auto text-green-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>List Not Found</CardTitle>
            <CardDescription>The shopping list you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lists
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lists
            </Button>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{list.name}</h1>
              {list.description && <p className="text-gray-600">{list.description}</p>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href={`/lists/${listId}/compare`}>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Compare Prices
                </Button>
              </Link>
              <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Item to List</DialogTitle>
                    <DialogDescription>Add a new item to your shopping list</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-name">Item Name</Label>
                      <Input
                        id="item-name"
                        placeholder="e.g., Milk"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddItem();
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={itemQuantity}
                          onChange={(e) => setItemQuantity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit (Optional)</Label>
                        <Input
                          id="unit"
                          placeholder="e.g., gallons"
                          value={itemUnit}
                          onChange={(e) => setItemUnit(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any additional notes..."
                        value={itemNotes}
                        onChange={(e) => setItemNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddItem}
                      disabled={createItemMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {createItemMutation.isPending ? "Adding..." : "Add Item"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              <CardTitle>Shopping Items</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!items || items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No items yet. Add your first item to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      checked={item.isPurchased === 1}
                      onCheckedChange={() => handleTogglePurchased(item.id, item.isPurchased)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3
                            className={`font-semibold ${
                              item.isPurchased === 1 ? "line-through text-gray-400" : "text-gray-900"
                            }`}
                          >
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                            {item.unit && ` ${item.unit}`}
                          </p>
                          {item.notes && <p className="text-sm text-gray-500 mt-1">{item.notes}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItemId(item.id);
                              setIsAddPriceDialogOpen(true);
                            }}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Add Price
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteItem(item.id, item.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isAddPriceDialogOpen} onOpenChange={setIsAddPriceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Price Information</DialogTitle>
              <DialogDescription>Record the price of this item at a specific store</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input
                  id="store-name"
                  placeholder="e.g., Walmart"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 3.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddPrice();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPriceDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddPrice}
                disabled={addPriceMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {addPriceMutation.isPending ? "Adding..." : "Add Price"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
