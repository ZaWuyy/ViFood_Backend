// controllers/orderDetailController.js
import OrderDetail from '../models/orderDetailModel.js';
import Order from '../models/orderModel.js';

/**
 * **Create Order Detail**
 */
export const createOrderDetail = async (req, res) => {
  const { orderId, product, quantity, note, discount_unit, price_per_unit, total_price } = req.body;

  if (!orderId || !product || !quantity || !price_per_unit || !total_price) {
    return res.status(400).json({ success: false, message: 'Required fields are missing.' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check if the user is the owner of the order or an admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to add details to this order.' });
    }

    const orderDetail = new OrderDetail({
      order: orderId,
      product,
      quantity,
      note,
      discount_unit: discount_unit || 0,
      price_per_unit,
      total_price,
    });

    const savedOrderDetail = await orderDetail.save();

    order.order_details.push(savedOrderDetail._id);
    await order.save();

    res.status(201).json({ success: true, message: 'Order detail added successfully.', orderDetail: savedOrderDetail });
  } catch (error) {
    console.error('Error creating order detail:', error);
    res.status(500).json({ success: false, message: 'Server error creating order detail.', error });
  }
};

/**
 * **Get All Order Details**
 */
export const getAllOrderDetails = async (req, res) => {
  try {
    const { product, orderId, minPrice, maxPrice, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    const query = {};
    if (product) query.product = product;
    if (orderId) query.order = orderId;
    if (minPrice || maxPrice) {
      query.total_price = {};
      if (minPrice) query.total_price.$gte = Number(minPrice);
      if (maxPrice) query.total_price.$lte = Number(maxPrice);
    }

    // If not admin, filter by user's orders
    if (req.user.role !== 'admin') {
      const userOrders = await Order.find({ user: req.user.id }).select('_id');
      const orderIds = userOrders.map(order => order._id);
      query.order = { $in: orderIds };
    }

    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort['createdAt'] = -1;
    }

    const orderDetails = await OrderDetail.find(query)
      .populate('product', 'name price')
      .populate({
        path: 'order',
        populate: { path: 'user', select: 'username email' },
      })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await OrderDetail.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orderDetails.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      orderDetails,
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, message: 'Server error fetching order details.', error });
  }
};

/**
 * **Get Order Detail by ID**
 */
export const getOrderDetailById = async (req, res) => {
  try {
    const orderDetail = await OrderDetail.findById(req.params.id)
      .populate('product', 'name price')
      .populate({
        path: 'order',
        populate: { path: 'user', select: 'username email' },
      });

    if (!orderDetail) {
      return res.status(404).json({ success: false, message: 'Order detail not found.' });
    }

    // Check if the user is the owner of the order or an admin
    if (orderDetail.order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order detail.' });
    }

    res.status(200).json({ success: true, orderDetail });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({ success: false, message: 'Server error fetching order detail.', error });
  }
};

/**
 * **Update Order Detail**
 */
export const updateOrderDetail = async (req, res) => {
  const { product, quantity, note, discount_unit, price_per_unit, total_price } = req.body;

  try {
    const orderDetail = await OrderDetail.findById(req.params.id).populate('order');

    if (!orderDetail) {
      return res.status(404).json({ success: false, message: 'Order detail not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = orderDetail.order.user.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this order detail.' });
    }

    // Update fields if provided
    if (product) orderDetail.product = product;
    if (quantity) orderDetail.quantity = quantity;
    if (note !== undefined) orderDetail.note = note;
    if (discount_unit !== undefined) orderDetail.discount_unit = discount_unit;
    if (price_per_unit) orderDetail.price_per_unit = price_per_unit;
    if (total_price) orderDetail.total_price = total_price;

    const updatedOrderDetail = await orderDetail.save();

    res.status(200).json({ success: true, message: 'Order detail updated successfully.', orderDetail: updatedOrderDetail });
  } catch (error) {
    console.error('Error updating order detail:', error);
    res.status(500).json({ success: false, message: 'Server error updating order detail.', error });
  }
};

/**
 * **Delete Order Detail**
 */
export const deleteOrderDetail = async (req, res) => {
  try {
    const orderDetail = await OrderDetail.findById(req.params.id).populate('order');

    if (!orderDetail) {
      return res.status(404).json({ success: false, message: 'Order detail not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = orderDetail.order.user.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this order detail.' });
    }

    // Remove the order detail reference from the order
    await Order.findByIdAndUpdate(orderDetail.order._id, { $pull: { order_details: orderDetail._id } });

    await orderDetail.remove();

    res.status(200).json({ success: true, message: 'Order detail deleted successfully.' });
  } catch (error) {
    console.error('Error deleting order detail:', error);
    res.status(500).json({ success: false, message: 'Server error deleting order detail.', error });
  }
};

export default {
  createOrderDetail,
  getAllOrderDetails,
  getOrderDetailById,
  updateOrderDetail,
  deleteOrderDetail,
};