import { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  getInventory,
  getInvoices,
  createInvoice,
  deleteInvoice,
  type InventoryItem,
  type Invoice,
} from '@/lib/store';

interface InvoiceFormItem {
  itemId: string;
  quantity: number;
}

export const Invoices = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [formItems, setFormItems] = useState<InvoiceFormItem[]>([{ itemId: '', quantity: 1 }]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setInventory(getInventory());
    setInvoices(getInvoices().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const addFormItem = () => {
    setFormItems([...formItems, { itemId: '', quantity: 1 }]);
  };

  const removeFormItem = (index: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== index));
    }
  };

  const updateFormItem = (index: number, field: keyof InvoiceFormItem, value: string | number) => {
    const updated = [...formItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormItems(updated);
  };

  const calculateTotal = () => {
    return formItems.reduce((sum, formItem) => {
      const inventoryItem = inventory.find(i => i.id === formItem.itemId);
      if (inventoryItem) {
        return sum + (inventoryItem.price * formItem.quantity);
      }
      return sum;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter customer name",
        variant: "destructive",
      });
      return;
    }

    const validItems = formItems.filter(fi => fi.itemId && fi.quantity > 0);
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }

    // Check stock availability
    for (const formItem of validItems) {
      const inventoryItem = inventory.find(i => i.id === formItem.itemId);
      if (inventoryItem && formItem.quantity > inventoryItem.quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${inventoryItem.quantity} units of "${inventoryItem.name}" available`,
          variant: "destructive",
        });
        return;
      }
    }

    const invoiceItems = validItems.map(formItem => {
      const inventoryItem = inventory.find(i => i.id === formItem.itemId)!;
      return {
        itemId: formItem.itemId,
        itemName: inventoryItem.name,
        quantity: formItem.quantity,
        price: inventoryItem.price,
        total: inventoryItem.price * formItem.quantity,
      };
    });

    createInvoice({
      customerName: customerName.trim(),
      items: invoiceItems,
      total: invoiceItems.reduce((sum, item) => sum + item.total, 0),
    });

    toast({
      title: "Invoice Created",
      description: "Invoice generated and inventory updated automatically",
    });

    setCustomerName('');
    setFormItems([{ itemId: '', quantity: 1 }]);
    loadData();
  };

  const handleDelete = (id: string) => {
    deleteInvoice(id);
    toast({
      title: "Invoice Deleted",
      description: "Invoice has been removed",
    });
    loadData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Create Invoice */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Create Invoice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="mt-1.5"
              />
            </div>

            <div className="space-y-3">
              <Label>Items</Label>
              {inventory.length === 0 ? (
                <div className="flex items-center gap-2 p-4 bg-warning/10 border border-warning/20 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <span>No inventory items. Add items in the Inventory section first.</span>
                </div>
              ) : (
                formItems.map((formItem, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Select
                        value={formItem.itemId}
                        onValueChange={(value) => updateFormItem(index, 'itemId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventory.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} - ₹{item.price} ({item.quantity} in stock)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        value={formItem.quantity}
                        onChange={(e) => updateFormItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                      />
                    </div>
                    {formItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFormItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
              {inventory.length > 0 && (
                <Button type="button" variant="outline" size="sm" onClick={addFormItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-lg font-semibold">
                Total: <span className="text-primary">₹{calculateTotal().toLocaleString()}</span>
              </div>
              <Button type="submit" disabled={inventory.length === 0}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No invoices yet. Create your first invoice above.
            </p>
          ) : (
            <div className="space-y-3">
              {invoices.map(invoice => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div>
                    <p className="font-medium">{invoice.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.items.length} item(s) • {new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-primary">₹{invoice.total.toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(invoice.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
