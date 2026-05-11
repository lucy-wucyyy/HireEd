const express = require('express');
const router = express.Router();

const userController = require("../controllers/userController");

router.get('/', userController.getUser);
router.post('/', userController.createUser); 
router.delete('/', userController.deleteUser);
router.put('/', userController.updateUser);

module.exports = router;