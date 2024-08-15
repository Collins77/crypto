const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requiresAdminSignIn } = require('../middleware/authMiddleware');
 
router.get('/get-admins', adminController.getAllAdmins);
router.get('/get-admin/:id',  adminController.getAdminById);
router.delete('/delete-admin/:id',  adminController.deleteAdmin);
router.post('/create-admin', adminController.createNewAdmin);
router.put('/update-admin/:id', adminController.updateAdmin);
router.put('/deactivate-admin/:id', adminController.deactivateAdmin);
router.put('/activate-admin/:id', adminController.activateAdmin);
router.put('/change-password/:id', adminController.changePassword);
router.post('/login', adminController.loginAdmin);
router.get("/admin-auth", requiresAdminSignIn, (req, res) => {
    res.status(200).send({ ok: true });
  });

module.exports = router;