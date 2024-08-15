const express = require('express');
const router = express.Router();
const withdrawController = require('../controllers/withdrawController');
// const { requireSignIn } = require('../middleware/authMiddleware');


router.post('/create-withdrawal', withdrawController.createWithdrawal);
router.post('/approve-withdrawal/:withdrawalId',  withdrawController.approveWithdraw);
router.get('/get-withdrawals-user/:userId',  withdrawController.getUserWithdrawals);

module.exports = router;