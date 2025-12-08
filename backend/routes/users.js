const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUsers, getUserById, updateUser, deleteUser, getHeads } = require('../controllers/users');

// @route GET api/users
// @desc List users (admin/technical-admin) or manager/ceo see employees
// @access Private
router.get('/', auth, getUsers);
router.get('/heads', auth, getHeads);

// @route GET api/users/:id
// @desc Get user by id
// @access Private
router.get('/:id', auth, getUserById);

// @route PUT api/users/:id
// @desc Update user (role, fullName, password)
// @access Private
router.put('/:id', auth, updateUser);

// @route DELETE api/users/:id
// @desc Delete a user (admin/technical-admin)
// @access Private
router.delete('/:id', auth, deleteUser);

module.exports = router;
