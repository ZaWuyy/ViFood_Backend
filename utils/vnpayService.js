// services/vnpayService.js
import crypto from 'crypto';
import moment from 'moment';
import dotenv from 'dotenv';

// Các thông tin cấu hình của VNPay
dotenv.config();

const VNPAY_URL = process.env.VNPAY_URL; // URL của VNPay
const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE; // Mã đơn vị của bạn
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET; // Mã bí mật từ VNPay
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL; // URL để VNPay chuyển kết quả về (thường là trang thông báo kết quả thanh toán)

// Hàm tạo mã hash cho yêu cầu thanh toán
const generateVnpayHash = (params) => {
  const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
    acc[key] = params[key];
    return acc;
  }, {});
  
  let queryString = "";
  for (let key in sortedParams) {
    queryString += key + "=" + encodeURIComponent(sortedParams[key]) + "&";
  }

  queryString = queryString.slice(0, -1); // Remove last '&'
  
  const hashData = VNPAY_TMN_CODE + queryString;
  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  hmac.update(hashData);
  
  return hmac.digest('hex');
};

// Hàm tạo yêu cầu thanh toán VNPay
export const createVnpayPaymentRequest = (order, discount) => {
  const orderId = order._id.toString(); // Mã đơn hàng từ Order
  const amount = order.total_amount - discount; // Số tiền thanh toán sau khi áp dụng giảm giá
  const transactionDate = moment().format('YYYYMMDDHHmmss');
  
  const vnpayParams = {
    vnp_Version: '2.1.0',
    vnp_TmnCode: VNPAY_TMN_CODE,
    vnp_Amount: amount * 100, // VNPay yêu cầu giá trị là cent (số tiền * 100)
    vnp_Command: 'pay',
    vnp_CreateDate: transactionDate,
    vnp_Currency: 'VND',
    vnp_OrderInfo: `Thanh toán cho đơn hàng ${orderId}`,
    vnp_OrderType: 'billpayment',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: VNPAY_RETURN_URL,
    vnp_TxnRef: orderId, // Mã đơn hàng sẽ dùng để tra cứu giao dịch
    vnp_BankCode: '', // Nếu thanh toán qua ngân hàng cụ thể, chọn ngân hàng ở đây
  };

  const vnpayHash = generateVnpayHash(vnpayParams);
  vnpayParams.vnp_SecureHash = vnpayHash;

  return { vnpayParams, vnpayUrl: VNPAY_URL };
};

// Hàm xác minh kết quả thanh toán trả về từ VNPay
export const verifyPaymentReturn = (queryParams) => {
  const secureHash = queryParams.vnp_SecureHash;
  delete queryParams.vnp_SecureHash;
  const calculatedHash = generateVnpayHash(queryParams);
  return calculatedHash === secureHash;
};
