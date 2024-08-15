const Investment = require('../models/Investment');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const approveInvestment = require('../utils/approveInvestment');
const approveWithdrawal = require('../utils/approveWithdrawal');

// Create an investment
async function createWithdrawal(req, res) {
    try {
        const { userId, coin, wallet, amount } = req.body;

        // Validate the user, plan, and amount
        const user = await User.findById(userId);
        if (!user) return res.status(404).send('User not found');


        if (amount > user.balance) return res.status(400).send('Amount is higher than user balance');

        // Create a new investment
        const withdrawal = new Withdrawal({
            user: userId,
            coin,
            wallet,
            amount,
            status: 'pending',
        });

        await withdrawal.save();
        res.status(201).send(withdrawal);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function getUserWithdrawals(req, res) {
    try {
        const userId = req.params.userId;
        const withdrawals = await Withdrawal.find({ user: userId });
        res.status(200).json({ success: true, withdrawals });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch withdrawals' });
    }
}

// Approve an investment
async function approveWithdraw(req, res) {
    try {
        const { withdrawalId } = req.params;
        await approveWithdrawal(withdrawalId);
        res.status(200).send('Investment approved');
    } catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = {
    createWithdrawal,
    approveWithdraw,
    getUserWithdrawals
};
