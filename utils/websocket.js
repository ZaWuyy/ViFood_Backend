// websocket.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Chat from '../models/chatModel.js';
import { uploadImages, deleteImage } from '../controllers/uploadImageController.js';

dotenv.config();

/**
 * Hàm tìm hoặc tạo cuộc trò chuyện giữa hai người dùng
 */
const getOrCreateChat = async (user1Id, user2Id) => {
  try {
    let chat = await Chat.findOne({
      participants: { $all: [user1Id, user2Id] },
    })
      .populate('participants', 'firstname lastname username avatarUrl')
      .populate('messages.sender', 'firstname lastname username avatarUrl');

    if (!chat) {
      chat = new Chat({ participants: [user1Id, user2Id], messages: [] });
      await chat.save();

      // Populate sau khi tạo mới cuộc trò chuyện
      chat = await Chat.findById(chat._id)
        .populate('participants', 'firstname lastname username avatarUrl')
        .populate('messages.sender', 'firstname lastname username avatarUrl');
    }

    return chat;
  } catch (error) {
    console.error('Error finding or creating chat:', error);
    throw new Error('Could not get or create chat');
  }
};

/**
 * Hàm khởi tạo WebSocket server
 */
function initWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  /**
   * Middleware xác thực người dùng qua token JWT
   */
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Giả sử token chứa thông tin người dùng
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    /**
     * Tham gia các phòng trò chuyện mà người dùng đang tham gia
     */
    Chat.find({ participants: socket.user.id })
      .then(chats => {
        chats.forEach(chat => {
          socket.join(chat._id.toString());
        });
      })
      .catch(err => console.error('Error fetching user chats:', err));

    /**
     * Sự kiện: sendMessage
     * Dữ liệu nhận được: { chatId, text, images }
     */
    socket.on('sendMessage', async (data) => {
      const { chatId, text, images } = data;

      if (!chatId || (!text && (!images || images.length === 0))) {
        return socket.emit('error', { message: 'Chat ID và ít nhất một trong text hoặc images là cần thiết.' });
      }

      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return socket.emit('error', { message: 'Không tìm thấy cuộc trò chuyện.' });
        }

        // Kiểm tra xem người dùng có trong cuộc trò chuyện không
        if (!chat.participants.includes(socket.user.id)) {
          return socket.emit('error', { message: 'Bạn không phải là thành viên của cuộc trò chuyện này.' });
        }

        // Xử lý hình ảnh nếu có
        let uploadedImages = [];
        if (images && images.length > 0) {
          uploadedImages = await uploadImages(images);
        }

        // Tạo tin nhắn mới
        const message = {
          sender: socket.user.id,
          text: text || '',
          timestamp: Date.now(),
          image: uploadedImages, // Lưu thông tin hình ảnh nếu có
        };

        chat.messages.push(message);
        await chat.save();

        // Phát tin nhắn tới tất cả các thành viên trong cuộc trò chuyện
        io.to(chatId).emit('newMessage', {
          chatId,
          message,
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Lỗi máy chủ khi gửi tin nhắn.' });
      }
    });

    /**
     * Sự kiện: joinChat
     * Dữ liệu nhận được: { chatId }
     */
    socket.on('joinChat', async (data) => {
      const { chatId } = data;
      if (!chatId) {
        return socket.emit('error', { message: 'Chat ID là cần thiết để tham gia.' });
      }

      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return socket.emit('error', { message: 'Không tìm thấy cuộc trò chuyện.' });
        }

        // Kiểm tra xem người dùng có trong cuộc trò chuyện không
        if (!chat.participants.includes(socket.user.id)) {
          return socket.emit('error', { message: 'Bạn không phải là thành viên của cuộc trò chuyện này.' });
        }

        socket.join(chatId);
        socket.emit('joinedChat', { chatId });
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Lỗi máy chủ khi tham gia cuộc trò chuyện.' });
      }
    });

    /**
     * Sự kiện: leaveChat
     * Dữ liệu nhận được: { chatId }
     */
    socket.on('leaveChat', (data) => {
      const { chatId } = data;
      if (!chatId) {
        return socket.emit('error', { message: 'Chat ID là cần thiết để rời khỏi.' });
      }
      socket.leave(chatId);
      socket.emit('leftChat', { chatId });
    });

    /**
     * Sự kiện: disconnect
     */
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

export default initWebSocket;