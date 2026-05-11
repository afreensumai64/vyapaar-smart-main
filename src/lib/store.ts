// Local storage-based data store for Vyappar AI
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  customerName: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  total: number;
  createdAt: string;
}

const INVENTORY_KEY = 'vyappar_inventory';
const INVOICES_KEY = 'vyappar_invoices';

// Inventory functions
export const getInventory = (): InventoryItem[] => {
  const data = localStorage.getItem(INVENTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveInventory = (items: InventoryItem[]): void => {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
};

export const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt'>): InventoryItem => {
  const items = getInventory();
  const newItem: InventoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveInventory(items);
  return newItem;
};

export const updateInventoryItem = (id: string, updates: Partial<InventoryItem>): void => {
  const items = getInventory();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveInventory(items);
  }
};

export const deleteInventoryItem = (id: string): void => {
  const items = getInventory().filter(item => item.id !== id);
  saveInventory(items);
};

export const reduceInventoryQuantity = (itemId: string, quantity: number): void => {
  const items = getInventory();
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.quantity = Math.max(0, item.quantity - quantity);
    saveInventory(items);
  }
};

// Invoice functions
export const getInvoices = (): Invoice[] => {
  const data = localStorage.getItem(INVOICES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
};

export const createInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'>): Invoice => {
  const invoices = getInvoices();
  const newInvoice: Invoice = {
    ...invoice,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  invoices.push(newInvoice);
  saveInvoices(invoices);
  
  // Reduce inventory for each item
  invoice.items.forEach(item => {
    reduceInventoryQuantity(item.itemId, item.quantity);
  });
  
  return newInvoice;
};

export const deleteInvoice = (id: string): void => {
  const invoices = getInvoices().filter(inv => inv.id !== id);
  saveInvoices(invoices);
};

// Analytics helpers
export const getTodaySales = (): number => {
  const today = new Date().toDateString();
  return getInvoices()
    .filter(inv => new Date(inv.createdAt).toDateString() === today)
    .reduce((sum, inv) => sum + inv.total, 0);
};

export const getThisMonthSales = (): number => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  return getInvoices()
    .filter(inv => {
      const date = new Date(inv.createdAt);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    })
    .reduce((sum, inv) => sum + inv.total, 0);
};

export const getLastWeekSales = (): number => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  return getInvoices()
    .filter(inv => {
      const date = new Date(inv.createdAt);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    })
    .reduce((sum, inv) => sum + inv.total, 0);
};

export const getThisWeekSales = (): number => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return getInvoices()
    .filter(inv => new Date(inv.createdAt) >= oneWeekAgo)
    .reduce((sum, inv) => sum + inv.total, 0);
};

export const getTopSellingProduct = (): { name: string; quantity: number } | null => {
  const invoices = getInvoices();
  const productSales: Record<string, { name: string; quantity: number }> = {};
  
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      if (!productSales[item.itemId]) {
        productSales[item.itemId] = { name: item.itemName, quantity: 0 };
      }
      productSales[item.itemId].quantity += item.quantity;
    });
  });
  
  const products = Object.values(productSales);
  if (products.length === 0) return null;
  
  return products.reduce((top, product) => 
    product.quantity > top.quantity ? product : top
  );
};

export const getLowStockItems = (): InventoryItem[] => {
  return getInventory().filter(item => item.quantity < 5);
};

export const generateInsights = (): string[] => {
  const insights: string[] = [];
  const thisWeekSales = getThisWeekSales();
  const lastWeekSales = getLastWeekSales();
  const lowStockItems = getLowStockItems();
  const topProduct = getTopSellingProduct();
  const todaySales = getTodaySales();
  
  // Sales trend insight
  if (thisWeekSales > lastWeekSales && lastWeekSales > 0) {
    const increase = ((thisWeekSales - lastWeekSales) / lastWeekSales * 100).toFixed(0);
    insights.push(`📈 Sales are up ${increase}% compared to last week. Great momentum!`);
  } else if (thisWeekSales < lastWeekSales && lastWeekSales > 0) {
    insights.push(`📉 Sales have decreased compared to last week. Consider running a promotion.`);
  } else if (thisWeekSales > 0) {
    insights.push(`📊 Your business is generating steady sales. Keep it up!`);
  }
  
  // Low stock warnings
  if (lowStockItems.length > 0) {
    const itemNames = lowStockItems.slice(0, 2).map(i => i.name).join(', ');
    insights.push(`⚠️ Low stock alert: ${itemNames}${lowStockItems.length > 2 ? ` and ${lowStockItems.length - 2} more` : ''} may run out soon.`);
  }
  
  // Top product insight
  if (topProduct && topProduct.quantity > 3) {
    insights.push(`🏆 "${topProduct.name}" is your best seller with ${topProduct.quantity} units sold.`);
  }
  
  // Daily performance
  if (todaySales > 0) {
    insights.push(`💰 You've made ₹${todaySales.toLocaleString()} in sales today.`);
  }
  
  // Default insights if no data
  if (insights.length === 0) {
    insights.push(`🚀 Welcome! Start by adding inventory items and creating invoices to see insights.`);
  }
  
  return insights;
};
