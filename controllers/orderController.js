// controllers/orderController.js
import Order from '../models/orderModel.js';
import OrderDetail from '../models/orderDetailModel.js';

/**
 * **Create Order**
 */
export const createOrder = async (req, res) => {
  const { total_price, note, address, phone, order_details, method } = req.body;

  if (!total_price || !address || !phone || !order_details || !Array.isArray(order_details) || !method) {
    return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
  }

  try {
    // Create OrderDetails
    const createdOrderDetails = await OrderDetail.insertMany(order_details);

    // Create Order
    const order = new Order({
      user: req.user.id,
      total_price,
      note,
      address,
      phone,
      order_details: createdOrderDetails.map(detail => detail._id),
      method,
    });

    const savedOrder = await order.save();
    res.status(201).json({ success: true, message: 'Order created successfully.', order: savedOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server error creating order.', error });
  }
};

/**
 * **Get All Orders (Admin)**
 */
export const getAllOrders = async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin) {
    return res.status(403).json({ success: false, message: 'Unauthorized to get all orders' });
  };

  try {
    const { status, method, dateFrom, dateTo, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (method) query.method = method;
    if (dateFrom || dateTo) {
      query.created_date = {};
      if (dateFrom) query.created_date.$gte = new Date(dateFrom);
      if (dateTo) query.created_date.$lte = new Date(dateTo);
    }

    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort['created_date'] = -1;
    }

    const orders = await Order.find(query)
      .populate('user', 'username email')
      .populate({
        path: 'order_details',
        populate: { path: 'product variant' }, // Adjust paths as per OrderDetail schema
      })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders.', error });
  }
};

/**
 * **Get User Orders**
 */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) query.status = status;

    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort['created_date'] = -1;
    }

    const orders = await Order.find(query)
      .populate({
        path: 'order_details',
        populate: { path: 'product variant' }, // Adjust paths as per OrderDetail schema
      })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching your orders.', error });
  }
};

/**
 * **Get Order By ID**
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username email')
      .populate({
        path: 'order_details',
        populate: { path: 'product variant' }, // Adjust paths as per OrderDetail schema
      });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check if the user is the owner or an admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ success: false, message: 'Server error fetching order.', error });
  }
};

/**
 * **Update Order Status (Admin)**
 */
export const updateOrderStatus = async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin) {
    return res.status(403).json({ success: false, message: 'Unauthorized to update order' });
  };
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'canceled', 'delivered', 'completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing status.' });
  }

  try {
    const order = await Order.findById(req.params.id).populate('user', 'email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.status = status;
    await order.save();

    // Optionally, send email notification to user about status update

    res.status(200).json({ success: true, message: 'Order status updated successfully.', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error updating order status.', error });
  }
};

/**
 * **Delete Order (Admin)**
 */
export const deleteOrder = async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin) {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete order' });
  };
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await OrderDetail.deleteMany({ _id: { $in: order.order_details } });
    await order.remove();

    res.status(200).json({ success: true, message: 'Order and its details deleted successfully.' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, message: 'Server error deleting order.', error });
  }
};

export default {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};