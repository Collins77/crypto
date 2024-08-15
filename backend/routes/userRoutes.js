const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireSignIn } = require('../middleware/authMiddleware');
// const auth = require('../middleware/authMiddleware');

router.get('/get-users', userController.getAllUsers);
router.get('/get-user/:id',  userController.getUserById);
// router.get('/logged-in', resellersController.loggedIn);
router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
  });
router.post('/signup', userController.createNewUser);
router.post('/login', userController.loginUser);
router.get('/logout', userController.logOutUser);
router.patch('/edit-account', userController.updateUser);
router.delete('/delete-user/:id', userController.deleteUser);
router.put('/update-user/:id', userController.updateUser);
router.post('/forgot-password', userController.forgotPassword);
router.get('/reset-password/:id/:token', userController.resetPassword);
router.post('/reset-password/:id/:token', userController.resetPasswordComplete);
router.put('/change-password/:id', userController.changePassword);

module.exports = router;