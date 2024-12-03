import crypto from 'crypto';
import redis from 'redis';

// Tạo kết nối Redis
const redisClient = redis.createClient();

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

await redisClient.connect(); // Đảm bảo kết nối Redis

// Hàm sinh mã OTP
export const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// Lưu OTP với thời hạn 5 phút (300 giây)
export const saveOtp = async (email, otp) => {
  try {
    if (!email || !otp) {
      throw new Error('Email or OTP is missing');
    }
    console.log('Saving OTP:', { email, otp });
    await redisClient.set(email, otp, 'EX', 300);
    console.log(`OTP saved for ${email}`);
  } catch (err) {
    console.error('Error saving OTP:', err);
    throw err;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    if (!email || !otp) {
      throw new Error('Email or OTP is missing');
    }
    console.log('Verifying OTP for:', email);
    const storedOtp = await redisClient.get(email);
    console.log('Stored OTP:', storedOtp);
    if (storedOtp === otp) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    throw err;
  }
};


export default { generateOtp, saveOtp, verifyOtp };
