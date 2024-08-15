const Investment = require('../models/Investment');
const Plan = require('../models/Plan');
const User = require('../models/User');
const approveInvestment = require('../utils/approveInvestment');

async function getInvestments(req, res) {
    try {
        const investments = await Investment.find().lean()
        if(!investments?.length) {
            return res.status(400).json({message: 'No investments found'})
        }

        res.json(investments)
    } catch (error) {
        res.status(500).send(error.message);
    }
}

// Create an investment
async function createInvestment(req, res) {
    try {
        const { userId, coin, planId, amount } = req.body;

        // Validate the user, plan, and amount
        const user = await User.findById(userId);
        if (!user) return res.status(404).send('User not found');

        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).send('Plan not found');

        if (amount <= 0) return res.status(400).send('Invalid amount');

        // Create a new investment
        const investment = new Investment({
            user: userId,
            coin,
            plan: planId,
            amount,
            status: 'pending',
        });

        await investment.save();
        res.status(201).send(investment);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function getUserInvestments(req, res) {
    try {
        const userId = req.params.userId;
        const investments = await Investment.find({ user: userId });
        res.status(200).json({ success: true, investments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch investments' });
    }
}

// Approve an investment
async function approveInvestmentController(req, res) {
    try {
        const { investmentId } = req.params;
        await approveInvestment(investmentId);
        res.status(200).send('Investment approved');
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function getNotApprovedInvestments(req, res) {
    const investments = await Investment.find({ status: "pending" }).lean();
  if (!investments?.length) {
      return res.status(400).json({ message: 'No investments with status "Not approved" found' });
  }
  res.json(investments);
}

async function getApprovedInvestments(req, res) {
    const investments = await Investment.find({ status: "approved" }).lean();
  if (!investments?.length) {
      return res.status(400).json({ message: 'No investments with status "Not approved" found' });
  }
  res.json(investments);
}

module.exports = {
    createInvestment,
    approveInvestmentController,
    getUserInvestments,
    getInvestments,
    getNotApprovedInvestments,
    getApprovedInvestments
};
