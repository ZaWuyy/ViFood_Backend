import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import { connectDB } from './config/db.js';
import { verifyToken } from './middleware/auth.js';

import authRoute from './routes/authRoute.js';
import blogRoute from './routes/blogRoute.js';
import cartRoute from './routes/cartRoute.js';
import categoryRoute from './routes/categoryRoute.js';
import chatRoute from './routes/chatRoute.js';
import commentRoute from './routes/commentRoute.js';
import imageRoute from './routes/imageRoute.js';
import orderDetailRoute from './routes/orderDetailRoute.js';
import orderRoute from './routes/orderRoute.js';
import paymentRoute from './routes/paymentRoute.js';
import productRoute from './routes/productRoute.js';
import productVairantRoute from './routes/productVariantRoute.js';
import ratingRoute from './routes/ratingRoute.js';
import uploadImageRoute from './routes/uploadImageRoute.js';
import userRoute from './routes/userRoute.js';
import voucherRoute from './routes/voucherRoute.js';

import initWebsocket from './utils/websocket.js';

dotenv.config();
const app = express();
const server = require('http').createServer(app);

// Initalize websocket
initWebsocket(server);

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoute);
app.use('/api/blog', verifyToken, blogRoute);
app.use('/api/cart', verifyToken, cartRoute);
app.use('/api/category', verifyToken, categoryRoute);
app.use('/api/chat', verifyToken, chatRoute);
app.use('/api/comment', verifyToken, commentRoute);
app.use('/api/image', verifyToken, imageRoute);
app.use('/api/order-detail', verifyToken, orderDetailRoute);
app.use('/api/order', verifyToken, orderRoute);
app.use('/api/payment', verifyToken, paymentRoute);
app.use('/api/product', verifyToken, productRoute);
app.use('/api/product-variant', verifyToken, productVairantRoute);
app.use('/api/rating', verifyToken, ratingRoute);
app.use('/api/upload-image', verifyToken, uploadImageRoute);
app.use('/api/user', verifyToken, userRoute);
app.use('/api/voucher', verifyToken, voucherRoute);


app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

