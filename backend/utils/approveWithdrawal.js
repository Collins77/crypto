const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');

async function approveWithdrawal(withdrawalId) {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) throw new Error('Withdrawal request not found');
    if (withdrawal.status !== 'pending') throw new Error('Withdrawal is not pending');

    const user = await User.findById(withdrawal.user);
    if (!user) throw new Error('User not found');

    // Update the user's balance
    user.balance -= withdrawal.amount;

    // Save the user and investment details
    await user.save();

    withdrawal.status = 'approved';

    await withdrawal.save();
}

module.exports = approveWithdrawal;
