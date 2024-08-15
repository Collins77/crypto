const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
// const { requireSignIn } = require('../middleware/authMiddleware');


router.post('/create-plan', planController.createNewPlan);
router.get('/get-plans', planController.getPlans);
router.delete('/delete-plan/:id', planController.deletePlan);
// router.get('/approve-investment/:id',  investmentController.approveInvestmentController);

module.exports = router;