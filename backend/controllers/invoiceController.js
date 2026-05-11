import Invoice from '../models/Invoice.js';
import Inventory from '../models/Inventory.js';
import mongoose from 'mongoose';

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id })
      .populate('items.itemId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerName, customerEmail, customerPhone, items, paymentMethod } = req.body;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const inventoryItem = await Inventory.findOne({ 
        _id: item.itemId, 
        user: req.user.id 
      }).session(session);
      
      if (!inventoryItem || inventoryItem.quantity < item.quantity) {
        throw new Error('Insufficient stock for item');
      }
    }

    let subtotal = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      subtotal = subtotal + (item.price * item.quantity);
    }
    
    const taxRate = 18;
    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax;

    const invoiceItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      invoiceItems.push({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      });
    }

    const invoice = new Invoice({
      user: req.user.id,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      items: invoiceItems,
      subtotal: subtotal,
      tax: tax,
      taxRate: taxRate,
      total: total,
      paymentMethod: paymentMethod || 'Cash'
    });

    await invoice.save({ session });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await Inventory.findOneAndUpdate(
        { _id: item.itemId, user: req.user.id },
        { $inc: { quantity: -item.quantity } },
        { session }
      );
    }

    await session.commitTransaction();
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

export const deleteInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoice = await Invoice.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).session(session);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      await Inventory.findOneAndUpdate(
        { _id: item.itemId, user: req.user.id },
        { $inc: { quantity: item.quantity } },
        { session }
      );
    }

    await Invoice.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    }).session(session);
    
    await session.commitTransaction();
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};