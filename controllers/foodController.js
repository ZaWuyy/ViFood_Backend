import foodModel from "../models/foodModel.js";
import fs from "fs";

//add food item

const addFood = async(req,res) => {

    let image_filename = `${req.file.filename}`;

    const food = new  foodModel({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: req.body.category,
        image: image_filename
    })
    try{
        await food.save();
        res.json({success:true,message:"Food Added"})
    }catch(error){
        console.log(error)
        res.json({success:false,message:"Error!"})
    }
}

    //all food list
   const listFood = async (req, res) => {
    try {
        const { sortBy, search } = req.query; // Nhận kiểu sắp xếp và từ khóa tìm kiếm từ query params
        const query = {}; // Khởi tạo query

        // Nếu có từ khóa tìm kiếm, thêm vào query
        if (search) {
            query.name = { $regex: search, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa chữ thường
        }

        const foods = await foodModel.find(query); // Lấy danh sách thực phẩm theo query

        // Sắp xếp danh sách thực phẩm theo kiểu được yêu cầu
        if (sortBy === "name") {
            foods.sort((a, b) => a.name.localeCompare(b.name)); // Sắp xếp theo tên
        } else if (sortBy === "price") {
            foods.sort((a, b) => a.price - b.price); // Sắp xếp theo giá
        } else if (sortBy === "category") {
            foods.sort((a, b) => a.category.localeCompare(b.category)); // Sắp xếp theo category
        }

        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error!" });
    }
};


    //remove food item

    const removeFood = async (req, res) => {
    try {
        const ids = req.body.ids; // Nhận danh sách id từ request
        const foods = await foodModel.find({ _id: { $in: ids } });

        // Xóa các hình ảnh
        foods.forEach(food => {
            fs.unlinkSync(`uploads/${food.image}`, () => {});
        });

        await foodModel.deleteMany({ _id: { $in: ids } }); // Xóa nhiều sản phẩm
        res.json({ success: true, message: "Foods removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error!" });
    }
};
    const updateFood = async (req, res) => {
        try {
            const { id, name, price, description, category } = req.body;
            const food = await foodModel.findById(id);
            
            if (!food) {
                return res.status(404).json({ success: false, message: "Food not found!" });
            }
    
            // Nếu có ảnh mới được tải lên, xóa ảnh cũ và thay thế ảnh mới
            if (req.file) {
                fs.unlinkSync(`uploads/${food.image}`, () => {});
                food.image = `${req.file.filename}`;
            }
    
            // Cập nhật các trường thông tin khác nếu có
            food.name = name || food.name;
            food.price = price || food.price;
            food.description = description || food.description;
            food.category = category || food.category;
    
            await food.save();
    
            res.json({ success: true, message: "Food updated successfully", data: food });
        } catch (error) {
            console.log(error);
            res.json({ success: false, message: "Error updating food!" });
        }
    };
    
export { addFood, listFood, removeFood, updateFood }
