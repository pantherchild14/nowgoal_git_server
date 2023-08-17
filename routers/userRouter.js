import express from 'express';
import userController from '../controllers/userController.js';
import checkIsUserAuthenticated from '../middleware/userMiddleware.js';


const router = express.Router();

router.post('/auth/register', userController.userRegistration);
router.post('/auth/login', userController.userLogin);

// protectd Routes
router.post('/change-password', checkIsUserAuthenticated, userController.changePassword);

router.get(`/:user`, (req, res) => userController.getUser(req, res));

export default router;