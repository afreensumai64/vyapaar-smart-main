import { useState, useEffect } from 'react';
import { Plus, Trash2, Package, AlertTriangle, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  type InventoryItem,
} from '@/lib/store';

export const Inventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: '', quantity: '', price: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    setItems(getInventory().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ title: "Error", description: "Please enter item name", variant: "destructive" });
      return;
    }
    if (!quantity || parseInt(quantity) < 0) {
      toast({ title: "Error", description: "Please enter valid quantity", variant: "destructive" });
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast({ title: "Error", description: "Please enter valid price", variant: "destructive" });
      return;
    }

    addInventoryItem({
      name: name.trim(),
      quantity: parseInt(quantity),
      price: parseFloat(price),
    });

    toast({
      title: "Item Added",
      description: `${name} has been added to inventory`,
    });

    setName('');
    setQuantity('');
    setPrice('');
    loadItems();
  };

  const handleDelete = (id: string, itemName: string) => {
    deleteInventoryItem(id);
    toast({
      title: "Item Deleted",
      description: `${itemName} has been removed from inventory`,
    });
    loadItems();
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditValues({
      name: item.name,
      quantity: item.quantity.toString(),
      price: item.price.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', quantity: '', price: '' });
  };

  const saveEdit = (id: string) => {
    if (!editValues.name.trim() || parseInt(editValues.quantity) < 0 || parseFloat(editValues.price) <= 0) {
      toast({ title: "Error", description: "Please enter valid values", variant: "destructive" });
      return;
    }

    updateInventoryItem(id, {
      name: editValues.name.trim(),
      quantity: parseInt(editValues.quantity),
      price: parseFloat(editValues.price),
    });

    toast({
      title: "Item Updated",
      description: "Inventory item has been updated",
    });

    cancelEdit();
    loadItems();
  };

  const lowStockItems = items.filter(item => item.quantity < 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Low Stock Warning */}
      {lowStockItems.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning">Low Stock Alert</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {lowStockItems.map(item => item.name).join(', ')} {lowStockItems.length === 1 ? 'is' : 'are'} running low on stock.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Item */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add Inventory Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Widget A"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <Button type="submit">
                <Package className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Inventory Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No inventory items yet. Add your first item above.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                >
                  {editingId === item.id ? (
                    <div className="flex-1 grid gap-3 sm:grid-cols-4 items-end">
                      <div className="sm:col-span-2">
                        <Input
                          value={editValues.name}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          placeholder="Item name"
                        />
                      </div>
                      <Input
                        type="number"
                        min="0"
                        value={editValues.quantity}
                        onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                        placeholder="Qty"
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editValues.price}
                          onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                          placeholder="Price"
                        />
                        <Button size="icon" onClick={() => saveEdit(item.id)} className="flex-shrink-0">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit} className="flex-shrink-0">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {item.name}
                            {item.quantity < 5 && (
                              <Badge variant="outline" className="text-warning border-warning/50 text-xs">
                                Low Stock
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} units • ₹{item.price.toLocaleString()} each
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary mr-2">
                          ₹{(item.quantity * item.price).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(item)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
