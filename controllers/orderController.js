// controllers/orderController.js
import Order from '../models/Order';
import OrderDetail from '../models/OrderDetail';
import Product from '../models/Product';
import PaymentService from '../services/paymentService';

class OrderController {
  // Tạo một đơn hàng mới
  async createOrder(req, res) {
    const { userId, orderDetails, voucherCode } = req.body;

    try {
      // Tính toán tổng giá trị đơn hàng
      let totalPrice = 0;
      const orderDetailsArray = [];

      // Xử lý mỗi chi tiết đơn hàng (sản phẩm, số lượng, ghi chú, tổng giá)
      for (let detail of orderDetails) {
        const { productId, variantId, quantity, note } = detail;

        // Lấy Product từ DB
        const product = await Product.findById(productId).populate('variants');

        // Kiểm tra xem Product có tồn tại không
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }

        // Lấy Variant từ Product (hoặc theo điều kiện bạn muốn)
        const variant = product.variants.find(v => v._id.toString() === variantId);

        if (!variant) {
          return res.status(404).json({ message: 'Product variant not found' });
        }

        // Tính giá cho chi tiết đơn hàng
        const totalPriceDetail = variant.price * quantity;

        orderDetailsArray.push({
          product: productId,
          variant: variantId,
          quantity,
          note,
          total_price: totalPriceDetail,
          price_per_unit: variant.price,
        });

        totalPrice += totalPriceDetail;
      }

      // Tạo OrderDetail cho mỗi chi tiết trong đơn hàng
      const orderDetailRecords = await OrderDetail.insertMany(orderDetailsArray);

      // Tạo đơn hàng (Order)
      const order = new Order({
        user: userId,
        order_detail: orderDetailRecords.map((detail) => detail._id),
        total_price: totalPrice,
        status: 'pending', // Trạng thái ban đầu là pending
      });

      await order.save();

      // Tạo thanh toán (Payment)
      const payment = await PaymentService.createPayment(order._id, totalPrice, voucherCode);

      res.status(201).json({
        order,
        payment,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Lấy thông tin chi tiết đơn hàng
  async getOrder(req, res) {
    const { orderId } = req.params;

    try {
      const order = await Order.findById(orderId).populate('order_detail').populate('user');
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Lấy tất cả đơn hàng của người dùng
  async getAllOrders(req, res) {
    const userId = req.user.id;

    try {
      const orders = await Order.find({ user: userId })
        .populate('order_detail')
        .populate('user');
      res.status(200).json(orders);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new OrderController();
