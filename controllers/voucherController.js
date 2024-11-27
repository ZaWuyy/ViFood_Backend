// voucherController.js
import Voucher from '../models/voucherModel.js';
import userModel from '../models/userModel.js'; // Import User model

// Tạo voucher mới
export const createVoucher = async (req, res) => {
    try {
        const { name, code, discountType, discount, expiryDate, minOrderValue, maxDiscountAmount, quantity, appliedFoods } = req.body;

        // Kiểm tra xem mã voucher đã tồn tại hay chưa
        const voucherExists = await Voucher.findOne({ code });
        if (voucherExists) {
            return res.status(400).json({ message: 'Voucher code already exists' });
        }

        // Kiểm tra ràng buộc cho discount
        if (discountType === 'percentage' && (discount < 0 || discount > 100)) {
            return res.status(400).json({ message: 'Discount percentage must be between 0 and 100' });
        }

        // Kiểm tra ràng buộc cho expiryDate
        if (new Date(expiryDate) <= new Date()) {
            return res.status(400).json({ message: 'Expiry date must be in the future' });
        }

        const voucher = new Voucher({
            name,
            code,
            discountType,
            discount, 
            expiryDate,
            minOrderValue,
            maxDiscountAmount,
            quantity,
            appliedFoods,
            status: 'active',
            updatedDate: Date.now(),
        });

        await voucher.save();
        res.status(201).json({ message: 'Voucher created successfully', voucher });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Lấy danh sách vouchers có thể lọc
export const getVouchers = async (req, res) => {
    try {
        const { search, sortBy, status, minOrderValue, maxDiscountAmount, discountType } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { code: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) query.status = status;  // Lọc theo trạng thái
        if (minOrderValue) query.minOrderValue = { $gte: minOrderValue };  // Lọc theo giá trị đơn hàng tối thiểu
        if (maxDiscountAmount) query.maxDiscountAmount = { $lte: maxDiscountAmount };  // Lọc theo số tiền giảm tối đa
        if (discountType) query.discountType = discountType;  // Lọc theo loại giảm giá

        let sort = {};
        if (sortBy) {
            sort[sortBy] = 1; // Sắp xếp tăng dần
        }

        const vouchers = await Voucher.find(query).sort(sort);
        res.status(200).json(vouchers);
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Lấy voucher theo mã code
export const getVoucherByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const voucher = await Voucher.findOne({ code });
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }
        res.status(200).json(voucher);
    } catch (error) {
        console.error('Error fetching voucher:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cập nhật voucher theo mã code
export const updateVoucher = async (req, res) => {
    try {
        const { code } = req.params;
        const { name, discountType, discount, expiryDate, minOrderValue, maxDiscountAmount, quantity, appliedFoods, status } = req.body;

        // Kiểm tra ràng buộc cho discount
        if (discountType === 'percentage' && (discount < 0 || discount > 100)) {
            return res.status(400).json({ message: 'Discount percentage must be between 0 and 100' });
        }

        // Kiểm tra ràng buộc cho expiryDate
        if (new Date(expiryDate) <= new Date()) {
            return res.status(400).json({ message: 'Expiry date must be in the future' });
        }

        const voucher = await Voucher.findOneAndUpdate(
            { code },
            {
                name,
                discountType,
                discount,
                expiryDate,
                minOrderValue,
                maxDiscountAmount,
                quantity,
                appliedFoods,
                status,
                updatedDate: Date.now(),
            },
            { new: true }
        );

        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        res.status(200).json({ message: 'Voucher updated successfully', voucher });
    } catch (error) {
        console.error('Error updating voucher:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Xóa voucher theo mã code
export const deleteVoucher = async (req, res) => {
    try {
        const { code } = req.params;
        const voucher = await Voucher.findOneAndDelete({ code });
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }
        res.status(204).json({ message: 'Voucher deleted successfully' });
    } catch (error) {
        console.error('Error deleting voucher:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * **Get Vouchers by User**
 */
export const getVouchersByUser = async (req, res) => {
    try {
        const userId = req.user.id; // Assumes authentication middleware sets req.user.id
        const user = await userModel.findById(userId).populate('vouchers');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ success: true, vouchers: user.vouchers });
    } catch (error) {
        console.error('Error fetching user vouchers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export default { 
    createVoucher, 
    getVouchers, 
    getVoucherByCode, 
    updateVoucher,
    deleteVoucher,
    getVouchersByUser
};