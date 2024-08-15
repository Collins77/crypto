const Investment = require('../models/Investment');
const User = require('../models/User');

const checkInvestments = async (req, res, next) => {
    try {
        const now = new Date();

        // Find all approved investments that have ended
        const investments = await Investment.find({ status: 'approved', endTime: { $lte: now } });

        for (const investment of investments) {
            const user = await User.findById(investment.user);

            if (user) {
                user.balance += investment.amount + investment.profit;
                await user.save();

                investment.status = 'ended';
                await investment.save();
            }
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error checking investments:`, error);
        return res.status(500).json({ message: 'Internal server error' });
    }

    next();
};

module.exports = checkInvestments;
