const express = require('express');
const router = express.Router();
const { getUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All user routes require authorization
router.use(protect);

router.get('/', getUsers);
router.get('/:id', getUserById);

module.exports = router;
