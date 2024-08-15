const Investment = require('../models/Investment');
const Plan = require('../models/Plan');
const User = require('../models/User');

async function approveInvestment(investmentId) {
    const investment = await Investment.findById(investmentId).populate('plan');
    if (!investment) throw new Error('Investment not found');
    if (investment.status !== 'pending') throw new Error('Investment is not pending');

    const user = await User.findById(investment.user);
    if (!user) throw new Error('User not found');

    const now = new Date();
    // const endTime = new Date(now.getTime() + investment.plan.duration * 24 * 60 * 60 * 1000);
    const profit = (investment.amount * investment.plan.profitPercentage) / 100;

    // Update the user's balance
    user.balance += investment.amount;

    // Save the user and investment details
    await user.save();

    investment.status = 'approved';
    investment.startTime = now;
    // investment.endTime = endTime;
    investment.profit = profit;

    await investment.save();
}

module.exports = approveInvestment;
