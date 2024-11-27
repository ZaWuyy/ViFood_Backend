import crypto from 'crypto';
import redis from 'redis';

// Tạo kết nối Redis
const redisClient = redis.createClient();

// Hàm sinh mã OTP
export const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// Lưu OTP với thời hạn 5 phút
export const saveOtp = (email, otp) => {
  return new Promise((resolve, reject) => {
    redisClient.setex(email, 180, otp, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

// Kiểm tra OTP
export const verifyOtp = (email, otp) => {
  return new Promise((resolve, reject) => {
    redisClient.get(email, (err, storedOtp) => {
      if (err) return reject(err);
      if (storedOtp === otp) return resolve(true);
      return resolve(false);
    });
  });
};

export default { generateOtp, saveOtp, verifyOtp };