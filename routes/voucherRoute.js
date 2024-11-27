// voucherRoute.js
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
    createVoucher,
    getVouchers,
    getVoucherByCode,
    updateVoucher,
    deleteVoucher,
    getVouchersByUser
} from '../controllers/voucherController.js';

const router = express.Router();

// **Voucher Routes**
router.post('/', verifyToken, createVoucher);
router.get('/', verifyToken, getVouchers);
router.get('/user', verifyToken, getVouchersByUser); // New route to get vouchers by user
router.get('/:code', verifyToken, getVoucherByCode);
router.put('/:code', verifyToken, updateVoucher);
router.delete('/:code', verifyToken, deleteVoucher);

export default router;