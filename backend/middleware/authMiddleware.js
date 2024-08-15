const jwt = require('jsonwebtoken');
// const Admin = require('../models/Admin')
// const Supplier = require('../models/Supplier')


//Protected Routes token base
exports.requireSignIn = async (req, res, next) => {
  try {
    const decode = jwt.verify(
      req.headers.authorization,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};

// exports.requiresSupplierSignIn = async (req, res, next) => {
//   try {
//     const decode =  jwt.verify(
//       req.headers.authorization,
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     req.supplier = decode;
//     next()
//   } catch (error) {
//     console.log(error);
//   }
// }

exports.requiresAdminSignIn = async (req, res, next) => {
  try {
    const decode =  jwt.verify(
      req.headers.authorization,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.admin = decode;
    next()
  } catch (error) {
    console.log(error);
  }
}

// admin acceess
exports.isAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (admin.status !== true) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      error,
      message: "Error in admin middelware",
    });
  }
};
// exports.isSupplier = async (req, res, next) => {
//   try {
//     const decode = jwt.verify(
//       req.headers.authorization,
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     req.supplier = decode;
//     next();
//   } catch (error) {
//     console.log(error);
//   }

// };

exports.isAdmin = async (req, res, next) => {
  try {
    const decode = jwt.verify(
      req.headers.authorization,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.admin = decode;
    next();
  } catch (error) {
    console.log(error);
  }

};




// exports.isSeller = catchAsyncErrors(async(req,res,next) => {
//     const {seller_token} = req.cookies;
//     if(!seller_token){
//         return next(new ErrorHandler("Please login to continue", 401));
//     }

//     const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

//     req.seller = await Supplier.findById(decoded.id);

//     next();
// });


exports.isAdmin = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`${req.user.role} can not access this resources!`))
        };
        next();
    }
}