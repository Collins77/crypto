// const cron = require('node-cron');
// const Investment = require('../models/Investment');
// const User = require('../models/User');
// const { logEvents } = require('../middleware/logger'); // Assuming you have a logger utility

// cron.schedule('0 * * * *', async () => {
//     const now = new Date();
//     console.log(`[${now.toISOString()}] Cron job started`);

//     try {
//         const investments = await Investment.find({ status: 'approved', endTime: { $lte: now } });

//         if (investments.length === 0) {
//             console.log(`[${now.toISOString()}] No investments to process`);
//         }

//         for (const investment of investments) {
//             const user = await User.findById(investment.user);

//             if (user) {
//                 user.balance += investment.amount + investment.profit;
//                 await user.save();

//                 investment.status = 'ended';
//                 await investment.save();

//                 console.log(`[${now.toISOString()}] Processed investment ${investment._id} for user ${user._id}`);
//             }
//         }
//     } catch (error) {
//         console.error(`[${now.toISOString()}] Error running cron job:`, error);
//         // logEvents(`Error running cron job: ${error.message}`, 'cronErrLog.log');
//     }

//     console.log(`[${now.toISOString()}] Cron job finished`);
// });

// module.exports = cron;
