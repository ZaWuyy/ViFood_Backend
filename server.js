import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';


import  connectDB  from './config/db.js';
import { verifyToken } from './middleware/auth.js';

import authRoute from './routes/authRoute.js';
import blogRoute from './routes/blogRoute.js';
import cartRoute from './routes/cartRoute.js';
import categoryRoute from './routes/categoryRoute.js';
import chatRoute from './routes/chatRoute.js';
import commentRoute from './routes/commentRoute.js';
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
const server = http.createServer(app);

// Initalize websocket
initWebsocket(server);

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auths', authRoute);
app.use('/api/blogs', verifyToken, blogRoute);
app.use('/api/carts', verifyToken, cartRoute);
app.use('/api/categorys', verifyToken, categoryRoute);
app.use('/api/chats', verifyToken, chatRoute);
app.use('/api/comments', verifyToken, commentRoute);
app.use('/api/order-details', verifyToken, orderDetailRoute);
app.use('/api/orders', verifyToken, orderRoute);
app.use('/api/payments', verifyToken, paymentRoute);
app.use('/api/products', verifyToken, productRoute);
app.use('/api/product-variants', verifyToken, productVairantRoute);
app.use('/api/ratings', verifyToken, ratingRoute);
app.use('/api/upload-images', verifyToken, uploadImageRoute);
app.use('/api/users', verifyToken, userRoute);
app.use('/api/vouchers', verifyToken, voucherRoute);


app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

