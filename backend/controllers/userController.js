const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sendMail = require('../middleware/sendMail');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Investment = require('../models/Investment');

const checkInvestments = async (user) => {
  const now = new Date();

  // Find all approved investments that have ended for the specific user
  const investments = await Investment.find({ user: user._id, status: 'approved', endTime: { $lte: now } });

  for (const investment of investments) {
      user.balance += investment.profit;
      await user.save();

      investment.status = 'ended';
      await investment.save();
  }
};

// @desc get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().lean()
    if(!users?.length) {
        return res.status(400).json({message: 'No users found'})
    }
    res.json(users)
})

// @desc create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
try {
    const { fullName, userName, email, phoneNumber, password } = req.body;

    if(!fullName || !userName || !email || !phoneNumber || !password) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check if the email already exists
    const userEmail = await User.findOne({ email });
    if (userEmail) {
        return res.status(400).json({ message: 'User already exists!' })
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    // Create a new user with status 'Not Approved'
    const newUser = new User({
      fullName,
      userName,
      email,
      phoneNumber,
      "password": hashedPwd,
      roles: "User"
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({
      success: true,
      message: `Account created successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred!'})
  }
});

// @desc update a reseller
// @route PATCH /resellers
// @access Private

const loginUser = asyncHandler(async (req, res) => {
    try {
      const { email, password } = req.body;
      //validation
      if (!email || !password) {
        return res.status(400).send({
          success: false,
          message: "Invalid email or password",
        });
      }
      //check user
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(400).send({
          success: false,
          message: "Email is not registered",
        });
      }

      const match = await bcrypt.compare(password, user.password)
      
      if (!match) {
        return res.status(400).send({
          success: false,
          message: "Invalid Credentials",
        });
      }
      await checkInvestments(user);
      //token
      const token = jwt.sign({ user: user._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).send({
        success: true,
        message: "login successfully",
        user,
        token,
      });
      
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in login",
        error,
      });
    }
});

const getUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
  
        if (!user) {
          return res.status(400).json({ message: "User doesn't exist" });
        }
  
        res.status(200).json({
          success: true,
          user,
        });
      } catch (error) {
        return res.status(500).json(error.message);

      }
})

const getUserById = asyncHandler(async (req, res) => {
  try {
      const user = await User.findById(req.params.id);
      if(!user) {
          return res.status(404).json({ message: 'User not found!' });
      }
    res.status(201).json({
      success: true,
      user,
    });
    } catch (error) {
      return res.status(500).json(error.message);
    }
})

// const getNotApprovedResellers = asyncHandler(async (req, res) => {
//   const resellers = await Reseller.find({ status: "Not approved" }).lean();
//   if (!resellers?.length) {
//       return res.status(400).json({ message: 'No resellers with status "Not approved" found' });
//   }
//   res.json(resellers);
// });

const loggedIn = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies.token;
    if(!token) {
      return res.json(false);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.send(true);
    next();
  } catch (error) {
    res.json(false)
  }
})

const logOutUser = asyncHandler(async (req, res) => {
    try {
        res.cookie("token", null, {
          expires: new Date(Date.now()),
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        res.status(201).json({
          success: true,
          message: "Log out successful!",
        });
      } catch (error) {
        return res.status(500).json(error.message);
      }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { id } = req.params;

  try {
    // Find the admin by ID
    const user = await User.findById(id).select("+password");;

    // Check if admin exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare old password with the hashed password in the database
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid old password' });
    }

    // Validate new password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);


    // Update user's password with the new hashed password
    user.password = hashedPassword;
    await user.save();

    // Password changed successfully
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});


const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    updatedUserData = req.body;
    try {
        // Validate input (you can use a validation library like Joi here)

        // Update the reseller in the database
        const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Send a success response
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        // Send an error response
        res.status(500).json({ error: 'Internal server error' });
    }
})

// @desc delete a user
// @route DELETE /user
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({message: 'User is not found'});
  }

  await user.deleteOne()

  res.status(201).json({
    success: true,
    message: "User Deleted successfully!",
  });
})

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({email});
    if(!oldUser) {
      return res.status(400).json({ message: 'User not found'});
    }
    //token
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "20m",
    });
    const link = `https://crypto.api.resellersprint.com/users/reset-password/${oldUser._id}/${token}`;
    // const link = `http://localhost:3500/resellers/reset-password/${oldUser._id}/${token}`;
    const emailTemplatePath = path.join(__dirname, '..', 'views', 'forgotPassword.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
        .replace('{{firstName}}', oldUser.firstName)
        .replace('{{link}}', link)

    // Send an email with the formatted template
    await sendMail({
        email: oldUser.email,
        subject: "Password Reset",
        html: formattedTemplate,
    });
    return res.status(200).json({ message: 'Check your email' })
  } catch (error) {
    
  }
})

const resetPassword = asyncHandler(async (req, res) => {
  const {id, token} = req.params;
  const oldUser = await User.findOne({_id: id})
  if(!oldUser) {
    return res.status(400).json({ message: "User does not exist" });
  }
  try {
    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.render('forgot', { email: verify.email, status:"not verified" })
  } catch (error) {
    res.send("Not verified")
  }

})
const resetPasswordComplete = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    // Verify the JWT token
    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Hash the new password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Update the password for the Reseller document
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: encryptedPassword },
      { new: true } // To return the updated document
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Password successfully updated, render a response
    res.render("forgot", { email: verify.email, status: "verified" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }

})

module.exports = {
    getAllUsers, 
    createNewUser, 
    updateUser,
    loginUser,
    getUser,
    deleteUser,
    logOutUser,
    // approveReseller,
    loggedIn,
    forgotPassword,
    resetPassword,
    resetPasswordComplete,
    // getNotApprovedResellers,
    // rejectReseller,
    getUserById,
    // holdReseller,
    // adminCreateReseller,
    changePassword
}