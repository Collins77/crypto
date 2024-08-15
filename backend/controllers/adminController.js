const Admin = require('../models/Admin')
const bcrypt = require('bcrypt')
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc Get all users
// @route GET /users
// @access Private
const getAllAdmins = async (req, res) => {
    // Get all users from MongoDB
    const admins = await Admin.find().lean()

    // If no users 
    if (!admins?.length) {
        return res.status(400).json({ message: 'No admins found' })
    }

    res.json(admins)
}

// @desc Create new user
// @route POST /users
// @access Private
const createNewAdmin = async (req, res) => {
    const { username,email, password, role, status } = req.body;

    // Confirm data
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
    const duplicate = await Admin.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate email' })
    }

    // Hash password 
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const adminObject = (!Array.isArray(role) || !role.length)
        ? { username, "password": hashedPwd, email, status }
        : { username, "password": hashedPwd, role, email, status }

    // Create and store new user 
    const admin = await Admin.create(adminObject)

    if (admin) { //created 
        res.status(201).json({ message: `New admin ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid admin data received' })
    }
}

const loginAdmin = asyncHandler(async (req, res) => {
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
      const admin = await Admin.findOne({ email }).select("+password");
      if (!admin) {
        return res.status(400).send({
          success: false,
          message: "Admin not found",
        });
      }

      if (admin.status !== true) {
          return res.status(401).json({ message: 'Access Denied' });
      }
      const match = await bcrypt.compare(password, admin.password)
      
      if (!match) {
        return res.status(400).send({
          success: false,
          message: "Invalid Password",
        });
      }
      //token
      const token = jwt.sign({ admin: admin._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
      });
      // Generate refresh token
      // const refreshToken = jwt.sign({ admin: admin._id }, process.env.REFRESH_TOKEN_SECRET);
      res.status(200).send({
        success: true,
        message: "login successfully",
        admin,
        token,
      });
      
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Error in login",
        error,
      });
    }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  updatedAdminData = req.body;
  try {
      // Validate input (you can use a validation library like Joi here)

      // Update the reseller in the database
      const updatedAdmin = await Admin.findByIdAndUpdate(id, updatedAdminData, { new: true });

      if (!updatedAdmin) {
          return res.status(404).json({ error: 'Admin not found' });
      }

      // Send a success response
      res.status(200).json({ message: 'Admin updated successfully', admin: updatedAdmin });
  } catch (error) {
      // Send an error response
      res.status(500).json({ error: 'Internal server error' });
  }

  // res.json({ message: `${updatedReseller.firstName} updated` })
})

const changePassword = asyncHandler (async(req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { id } = req.params;

  try {
      // Find the admin by ID
      const admin = await Admin.findById(id);

      // Check if admin exists
      if (!admin) {
          return res.status(404).json({ message: 'Admin not found' });
      }

      // / Compare old password with the hashed password in the database
      const isMatch = await bcrypt.compare(oldPassword, admin.password);

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
      admin.password = hashedPassword;
      await admin.save();

      // Password changed successfully
      return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
});

const getAdminById = asyncHandler(async (req, res) => {
  try {
      const admin = await Admin.findById(req.params.id);
      if(!admin) {
          return res.status(404).json({ message: 'Admin not found!' });
      }
    res.status(201).json({
      success: true,
      admin,
    });
    } catch (error) {
      return res.status(500).json(error.message);
    }
})

const deactivateAdmin = asyncHandler(async (req, res) => {
  try {
      const admin = await Admin.findById(req.params.id);

      if (!Admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      admin.status = false;
      await admin.save();

      res.status(200).json({
        success: true,
        message: "Admin suspended successfully!",
        admin: admin,
      });
    } catch (error) {
      return res.status(500).json(error.message);
    }
})

const activateAdmin = asyncHandler(async (req, res) => {
  try {
      const admin = await Admin.findById(req.params.id);

      if (!Admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      admin.status = true;
      await admin.save();

      res.status(200).json({
        success: true,
        message: "Admin activated successfully!",
        admin: admin,
      });
    } catch (error) {
      return res.status(500).json(error.message);
    }
})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteAdmin = async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Admin ID Required' })
    }

    // Does the user exist to delete?
    const admin = await Admin.findById(id).exec()

    if (!admin) {
        return res.status(400).json({ message: 'Admin not found' })
    }

    const result = await admin.deleteOne()

    const reply = `Admin ${result.username} with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllAdmins,
    createNewAdmin,
    updateAdmin,
    deleteAdmin,
    loginAdmin,
    getAdminById, 
    changePassword,
    deactivateAdmin,
    activateAdmin,
}