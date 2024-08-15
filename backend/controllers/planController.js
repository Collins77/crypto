const asyncHandler = require('express-async-handler');
const Plan = require('../models/Plan');

const createNewPlan = asyncHandler(async (req, res) => {
    try {
        const { name, price, duration, profitPercentage, coin } = req.body;
    
        if(!name || !price || !duration || !profitPercentage || !coin) {
            return res.status(400).json({message: 'All fields are required!'})
        }
    
        // Create a new plan
        const newPlan = new Plan({
          name,
          price,
          duration,
          profitPercentage,
          coin
        });
    
        // Save the plan to the database
        await newPlan.save();
    
        res.status(201).json({
          success: true,
          message: `Plan created successfully`,
        });
      } catch (error) {
        res.status(500).json({ message: 'An error occurred!'})
      }
});

const getPlans = asyncHandler(async (req, res) => {
    const plans = await Plan.find().lean()
    if(!plans?.length) {
        return res.status(400).json({message: 'No plans found'})
    }
    res.json(plans)
})

const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  
  if (!plan) {
    return res.status(404).json({message: 'Plan is not found'});
  }

  await plan.deleteOne()

  res.status(201).json({
    success: true,
    message: "Plan Deleted successfully!",
  });
})

module.exports = {
    createNewPlan, 
    getPlans,
    deletePlan,
}