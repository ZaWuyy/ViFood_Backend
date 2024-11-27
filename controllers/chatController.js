// controllers/chatController.js
import Chat from '../models/Chat.js';
import { uploadImages, deleteImage } from '../controllers/uploadImageController.js';

/**
 * **Get All Chats for Authenticated User**
 */
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'avatarUrl firstname lastname username')
      .populate('messages.sender', 'avatarUrl firstname lastname username')
      .sort({ 'messages.timestamp': -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * **Get or Create Chat with Specific User**
 */
export const getOrCreateChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      participants: { $all: [req.user.id, req.params.userId] },
    })
      .populate('participants', 'avatarUrl firstname lastname username')
      .populate('messages.sender', 'avatarUrl firstname lastname username');

    if (!chat) {
      const newChat = new Chat({
        participants: [req.user.id, req.params.userId],
        messages: [],
      });
      await newChat.save();
      return res.json(newChat);
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * **Send Message with Optional Image**
 */
export const sendMessage = async (req, res) => {
  uploadImages(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: `Image upload failed: ${err.message}` });
    }

    const { chatId, text } = req.body;

    if (!chatId || (!text && !req.files)) {
      return res.status(400).json({ message: 'Chat ID and either text or image are required.' });
    }

    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found.' });
      }

      // Check if the user is a participant in the chat
      if (!chat.participants.includes(req.user.id)) {
        return res.status(403).json({ message: 'You are not a participant of this chat.' });
      }

      const message = {
        sender: req.user.id,
        text: text || '',
        timestamp: Date.now(),
      };

      if (req.files && req.files.length > 0) {
        message.image = req.files.map(file => ({
          public_id: file.filename,
          url: file.path,
        }));
      }

      chat.messages.push(message);
      await chat.save();

      res.status(201).json({ message: 'Message sent successfully.', chat });
    } catch (error) {
      res.status(500).json({ message: 'Server error sending message.', error });
    }
  });
};

/**
 * **Delete Message Image**
 */
export const deleteMessageImage = async (req, res) => {
  const { chatId, messageId, imageId } = req.body;

  if (!chatId || !messageId || !imageId) {
    return res.status(400).json({ message: 'Chat ID, Message ID, and Image ID are required.' });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found.' });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    // Check if the requester is the sender or an admin
    if (message.sender.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this image.' });
    }

    const image = message.image.id(imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    // Delete image from Cloudinary
    await deleteImage(image.public_id);

    // Remove image from message
    image.remove();
    await chat.save();

    res.status(200).json({ message: 'Image deleted successfully.', chat });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting image.', error });
  }
};