// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Type definitions
export interface InventoryItem {
  _id: string;
  name: string;
  sku?: string;
  category: string;
  quantity: number;
  price: number;
  costPrice?: number;
  reorderLevel: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerGst?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer';
  createdAt: string;
}

export interface DashboardStats {
  todaySales: number;
  monthSales: number;
  invoiceCount: number;
  inventoryValue: number;
  lowStockCount: number;
  lowStockItems: InventoryItem[];
  topProducts: Array<{
    _id: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface CreateInventoryInput {
  name: string;
  sku?: string;
  category: string;
  quantity: number;
  price: number;
  costPrice?: number;
  reorderLevel?: number;
  description?: string;
}

export interface CreateInvoiceInput {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerGst?: string;
  items: Array<{
    itemId: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod?: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer';
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Inventory APIs
export const getInventory = async (): Promise<InventoryItem[]> => {
  const response = await api.get('/inventory');
  return response.data.data;
};

export const addInventoryItem = async (item: CreateInventoryInput): Promise<InventoryItem> => {
  const response = await api.post('/inventory', item);
  return response.data.data;
};

export const updateInventoryItem = async (id: string, item: Partial<CreateInventoryInput>): Promise<InventoryItem> => {
  const response = await api.put(`/inventory/${id}`, item);
  return response.data.data;
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  await api.delete(`/inventory/${id}`);
};

// Invoice APIs
export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await api.get('/invoices');
  return response.data.data;
};

export const createInvoice = async (invoice: CreateInvoiceInput): Promise<Invoice> => {
  const response = await api.post('/invoices', invoice);
  return response.data.data;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  await api.delete(`/invoices/${id}`);
};

// Analytics APIs
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/analytics/dashboard');
  return response.data.data;
};

export const getInsights = async (): Promise<string[]> => {
  const response = await api.get('/analytics/insights');
  return response.data.data;
};