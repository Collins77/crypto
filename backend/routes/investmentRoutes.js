const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
// const { requireSignIn } = require('../middleware/authMiddleware');


router.post('/create-investment', investmentController.createInvestment);
router.patch('/approve-investment/:investmentId',  investmentController.approveInvestmentController);
router.get('/get-investments-user/:userId',  investmentController.getUserInvestments);
router.get('/get-investments',  investmentController.getInvestments);
router.get('/unapproved-investments',  investmentController.getNotApprovedInvestments);
router.get('/approved-investments',  investmentController.getApprovedInvestments);
// router.patch('/approve-investment/:id',  investmentController.getInvestments);

module.exports = router;