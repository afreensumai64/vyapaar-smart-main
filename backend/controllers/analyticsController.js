import Invoice from '../models/Invoice.js';
import Inventory from '../models/Inventory.js';

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const todaySalesResult = await Invoice.aggregate([
      { $match: { user: req.user._id, createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const monthSalesResult = await Invoice.aggregate([
      { $match: { user: req.user._id, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const invoiceCount = await Invoice.countDocuments({ user: req.user._id });
    
    const inventoryResult = await Inventory.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price'] } } } }
    ]);
    
    const lowStockItems = await Inventory.find({ 
      user: req.user._id, 
      quantity: { $lt: 5 } 
    });
    
    const topProducts = await Invoice.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.itemName',
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.total' }
      }},
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);

    const responseData = {
      todaySales: todaySalesResult[0]?.total || 0,
      monthSales: monthSalesResult[0]?.total || 0,
      invoiceCount: invoiceCount || 0,
      inventoryValue: inventoryResult[0]?.total || 0,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems,
      topProducts: topProducts || []
    };
    
    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message, data: {
      todaySales: 0,
      monthSales: 0,
      invoiceCount: 0,
      inventoryValue: 0,
      lowStockCount: 0,
      lowStockItems: [],
      topProducts: []
    }});
  }
};

export const getInsights = async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const thisWeekInvoices = await Invoice.find({ 
      user: req.user._id, 
      createdAt: { $gte: lastWeek } 
    });
    
    const lowStock = await Inventory.find({ 
      user: req.user._id, 
      quantity: { $lt: 5 } 
    });
    
    const totalInventory = await Inventory.countDocuments({ user: req.user._id });
    
    const insights = [];
    
    const totalSales = thisWeekInvoices.reduce(function(sum, inv) {
      return sum + inv.total;
    }, 0);
    
    if (totalSales > 10000) {
      insights.push('Excellent week! Sales crossed Rs.' + totalSales.toLocaleString());
    } else if (totalSales > 0) {
      insights.push('Weekly sales at Rs.' + totalSales.toLocaleString());
    } else {
      insights.push('Create invoices to see sales insights');
    }
    
    if (lowStock.length > 0) {
      insights.push(lowStock.length + ' item(s) running low on stock. Time to reorder');
    }
    
    if (totalInventory === 0) {
      insights.push('Add your first inventory item to start tracking stock');
    }
    
    const productSales = {};
    for (let i = 0; i < thisWeekInvoices.length; i++) {
      const inv = thisWeekInvoices[i];
      for (let j = 0; j < inv.items.length; j++) {
        const item = inv.items[j];
        if (productSales[item.itemName]) {
          productSales[item.itemName] = productSales[item.itemName] + item.quantity;
        } else {
          productSales[item.itemName] = item.quantity;
        }
      }
    }
    
    const productEntries = Object.entries(productSales);
    if (productEntries.length > 0) {
      productEntries.sort(function(a, b) {
        return b[1] - a[1];
      });
      const topProduct = productEntries[0];
      if (topProduct && topProduct[1] > 0) {
        insights.push('"' + topProduct[0] + '" is your best seller with ' + topProduct[1] + ' units sold');
      }
    }
    
    if (insights.length === 0) {
      insights.push('Welcome to Vyappar AI. Add products and create invoices to see AI insights');
    }
    
    res.json({ success: true, data: insights });
  } catch (error) {
    console.error('Insights error:', error);
    res.json({ success: true, data: ['Welcome to Vyappar AI. Your business insights will appear here'] });
  }
};