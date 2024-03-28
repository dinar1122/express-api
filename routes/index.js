const express = require('express');
const router = express.Router();
const multer = require('multer');
const UserController = require('../controllers');
const {authToken} = require('../middleware/auth');

const uploadDestination = 'uploads'

const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function(req, file, callBack) {
    callBack(null,file.originalname)
  }
})

const uploads = multer({
  storage: storage
})
/* GET home page. */
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/current',authToken,UserController.currentUser);
router.get('/users/:id',authToken, UserController.getUserById);
router.put('/users/:id',authToken, UserController.updateUser);

module.exports = router;
