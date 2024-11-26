import express from 'express';
import { addFood, listFood, removeFood, updateFood } from '../controllers/foodController.js';
import multer from "multer";

const foodRouter = express.Router();

// Cấu hình multer để upload file ảnh
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);  // Đặt tên file ảnh
    }
});

const upload = multer({ storage: storage });

// Các routes
foodRouter.post("/add", upload.single("image"), addFood);  // Thêm món ăn
foodRouter.get("/list", listFood);                         // Lấy danh sách món ăn
foodRouter.post("/remove", removeFood);                    // Xóa món ăn
foodRouter.post("/update", upload.single("image"), updateFood); // Cập nhật món ăn

export default foodRouter;
